import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { 
  hashPassword, 
  verifyPassword, 
  generateSessionToken, 
  generateCSRFToken,
  sanitizeInput,
  validateUserId,
  validateEventId,
  validateAnswer
} from './middleware/auth'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())
app.use('/admin/api/*', cors())

// ==================== セキュアな管理者認証API ====================

/**
 * 管理者ログイン（セキュア版）
 * POST /admin/api/v2/login
 */
app.post('/admin/api/v2/login', async (c) => {
  const { DB } = c.env
  const { username, password } = await c.req.json()
  
  // 入力検証
  if (!username || !password) {
    return c.json({ error: 'ユーザー名とパスワードを入力してください' }, 400)
  }
  
  const sanitizedUsername = sanitizeInput(username)
  
  try {
    // 管理者を取得
    const admin: any = await DB.prepare(`
      SELECT id, username, password_hash, password_salt, is_active, 
             failed_login_attempts, locked_until
      FROM admins
      WHERE username = ?
    `).bind(sanitizedUsername).first()
    
    if (!admin) {
      // ユーザーが存在しない場合も同じエラーを返す（タイミング攻撃対策）
      await hashPassword('dummy', 'dummy-salt')
      await logAuditEvent(DB, 'failed_login', null, null, c.req.header('CF-Connecting-IP'), 
        c.req.header('User-Agent'), `Unknown user: ${sanitizedUsername}`)
      return c.json({ error: '認証に失敗しました' }, 401)
    }
    
    // アカウントロックチェック
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return c.json({ 
        error: 'アカウントが一時的にロックされています', 
        locked_until: admin.locked_until 
      }, 423)
    }
    
    // アカウント無効チェック
    if (!admin.is_active) {
      return c.json({ error: 'アカウントが無効です' }, 403)
    }
    
    // パスワード検証
    // 後方互換性: password_saltがない場合は旧方式（平文）で比較
    let isValid = false
    if (admin.password_salt) {
      isValid = await verifyPassword(password, admin.password_hash, admin.password_salt)
    } else {
      // 旧方式（平文比較）- 移行期間用
      isValid = admin.password_hash === password
    }
    
    if (!isValid) {
      // 失敗回数を増加
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1
      let lockUntil = null
      
      // 5回失敗でアカウントロック（15分）
      if (newFailedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }
      
      await DB.prepare(`
        UPDATE admins 
        SET failed_login_attempts = ?, locked_until = ?
        WHERE id = ?
      `).bind(newFailedAttempts, lockUntil, admin.id).run()
      
      await logAuditEvent(DB, 'failed_login', admin.id, null, 
        c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
        `Failed attempt ${newFailedAttempts}`)
      
      return c.json({ error: '認証に失敗しました' }, 401)
    }
    
    // ログイン成功: セッション作成
    const sessionToken = generateSessionToken()
    const csrfToken = generateCSRFToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24時間
    
    // セッション保存
    await DB.prepare(`
      INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      admin.id, 
      sessionToken, 
      expiresAt,
      c.req.header('CF-Connecting-IP') || '',
      c.req.header('User-Agent') || ''
    ).run()
    
    // CSRFトークン保存
    await DB.prepare(`
      INSERT INTO csrf_tokens (token, admin_id, expires_at)
      VALUES (?, ?, ?)
    `).bind(csrfToken, admin.id, expiresAt).run()
    
    // 失敗回数リセット、最終ログイン時刻更新
    await DB.prepare(`
      UPDATE admins 
      SET failed_login_attempts = 0, locked_until = NULL, last_login_at = datetime('now')
      WHERE id = ?
    `).bind(admin.id).run()
    
    // 監査ログ
    await logAuditEvent(DB, 'login', admin.id, null,
      c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
      'Login successful')
    
    // CSRFトークンをCookieにセット
    c.header('Set-Cookie', `csrf_token=${csrfToken}; HttpOnly; SameSite=Strict; Path=/`)
    
    return c.json({
      success: true,
      admin: { id: admin.id, username: admin.username },
      session_token: sessionToken,
      csrf_token: csrfToken,
      expires_at: expiresAt
    })
    
  } catch (error: any) {
    console.error('Login Error:', error)
    return c.json({ error: 'ログイン処理中にエラーが発生しました' }, 500)
  }
})

/**
 * 管理者ログアウト
 * POST /admin/api/v2/logout
 */
app.post('/admin/api/v2/logout', async (c) => {
  const { DB } = c.env
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (sessionToken) {
    try {
      // セッションを無効化
      await DB.prepare(`
        UPDATE admin_sessions SET is_valid = 0 WHERE session_token = ?
      `).bind(sessionToken).run()
      
      // 監査ログ
      const session: any = await DB.prepare(`
        SELECT admin_id FROM admin_sessions WHERE session_token = ?
      `).bind(sessionToken).first()
      
      if (session) {
        await logAuditEvent(DB, 'logout', session.admin_id, null,
          c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
          'Logout successful')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  return c.json({ success: true })
})

/**
 * パスワード変更
 * POST /admin/api/v2/change-password
 */
app.post('/admin/api/v2/change-password', async (c) => {
  const { DB } = c.env
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  
  const { current_password, new_password } = await c.req.json()
  
  // パスワード強度チェック
  if (!new_password || new_password.length < 8) {
    return c.json({ error: 'パスワードは8文字以上必要です' }, 400)
  }
  
  if (!/[A-Z]/.test(new_password) || !/[a-z]/.test(new_password) || !/[0-9]/.test(new_password)) {
    return c.json({ error: 'パスワードには大文字、小文字、数字を含める必要があります' }, 400)
  }
  
  try {
    // セッションから管理者を取得
    const session: any = await DB.prepare(`
      SELECT as.admin_id, a.password_hash, a.password_salt
      FROM admin_sessions as
      JOIN admins a ON as.admin_id = a.id
      WHERE as.session_token = ? AND as.expires_at > datetime('now') AND as.is_valid = 1
    `).bind(sessionToken).first()
    
    if (!session) {
      return c.json({ error: 'セッションが無効です' }, 401)
    }
    
    // 現在のパスワード検証
    let currentPasswordValid = false
    if (session.password_salt) {
      currentPasswordValid = await verifyPassword(current_password, session.password_hash, session.password_salt)
    } else {
      currentPasswordValid = session.password_hash === current_password
    }
    
    if (!currentPasswordValid) {
      return c.json({ error: '現在のパスワードが正しくありません' }, 400)
    }
    
    // 新しいパスワードをハッシュ化
    const { hash, salt } = await hashPassword(new_password)
    
    // パスワード更新
    await DB.prepare(`
      UPDATE admins 
      SET password_hash = ?, password_salt = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(hash, salt, session.admin_id).run()
    
    // 監査ログ
    await logAuditEvent(DB, 'password_change', session.admin_id, null,
      c.req.header('CF-Connecting-IP'), c.req.header('User-Agent'),
      'Password changed')
    
    return c.json({ success: true, message: 'パスワードを変更しました' })
    
  } catch (error: any) {
    console.error('Password change error:', error)
    return c.json({ error: 'パスワード変更中にエラーが発生しました' }, 500)
  }
})

/**
 * セッション検証
 * GET /admin/api/v2/verify-session
 */
app.get('/admin/api/v2/verify-session', async (c) => {
  const { DB } = c.env
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ valid: false }, 401)
  }
  
  try {
    const session: any = await DB.prepare(`
      SELECT as.*, a.username
      FROM admin_sessions as
      JOIN admins a ON as.admin_id = a.id
      WHERE as.session_token = ? 
        AND as.expires_at > datetime('now') 
        AND as.is_valid = 1
    `).bind(sessionToken).first()
    
    if (!session) {
      return c.json({ valid: false }, 401)
    }
    
    // 最終アクティビティ更新
    await DB.prepare(`
      UPDATE admin_sessions SET last_activity = datetime('now') WHERE id = ?
    `).bind(session.id).run()
    
    return c.json({
      valid: true,
      admin: { id: session.admin_id, username: session.username },
      expires_at: session.expires_at
    })
    
  } catch (error) {
    return c.json({ valid: false, error: 'Session verification failed' }, 500)
  }
})

// ==================== ユーティリティ関数 ====================

/**
 * 監査ログ記録
 */
async function logAuditEvent(
  DB: D1Database,
  eventType: string,
  adminId: number | null,
  userId: string | null,
  ipAddress: string | null | undefined,
  userAgent: string | null | undefined,
  action: string,
  resourceType?: string,
  resourceId?: string
) {
  try {
    await DB.prepare(`
      INSERT INTO audit_logs (
        event_type, admin_id, user_id, ip_address, user_agent, 
        action, resource_type, resource_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventType,
      adminId,
      userId,
      ipAddress || '',
      userAgent || '',
      action,
      resourceType || null,
      resourceId || null
    ).run()
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

// ==================== セキュアなユーザーAPI ====================

/**
 * ユーザー認証（入力検証強化版）
 * POST /api/v2/auth/login
 */
app.post('/api/v2/auth/login', async (c) => {
  const { DB } = c.env
  const { userId, name, teamName, companyName } = await c.req.json()
  
  // 入力検証
  if (!userId || !validateUserId(userId)) {
    return c.json({ error: '有効なユーザーIDを入力してください（英数字、50文字以内）' }, 400)
  }
  
  const sanitizedUserId = sanitizeInput(userId)
  const sanitizedName = name ? sanitizeInput(name) : sanitizedUserId
  const sanitizedTeamName = teamName ? sanitizeInput(teamName) : null
  const sanitizedCompanyName = companyName ? sanitizeInput(companyName) : null
  
  try {
    // アクティブなイベント取得
    const event: any = await DB.prepare(`
      SELECT id, name, description, start_date, end_date, questions_per_user, mode, min_participants, quiz_type
      FROM events
      WHERE is_active = 1
        AND quiz_type = 'async'
        AND datetime('now') BETWEEN start_date AND end_date
      ORDER BY created_at DESC
      LIMIT 1
    `).first()
    
    if (!event) {
      return c.json({ error: 'アクティブなイベントがありません' }, 404)
    }
    
    // モードに応じたバリデーション
    if (event.mode === 'team' && !sanitizedTeamName) {
      return c.json({ error: 'チーム名を入力してください' }, 400)
    }
    if (event.mode === 'company' && !sanitizedCompanyName) {
      return c.json({ error: '企業名を入力してください' }, 400)
    }
    
    // ユーザー登録または更新（プリペアドステートメント使用）
    await DB.prepare(`
      INSERT INTO users (user_id, name, team_name, company_name)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        team_name = excluded.team_name,
        company_name = excluded.company_name
    `).bind(sanitizedUserId, sanitizedName, sanitizedTeamName, sanitizedCompanyName).run()
    
    // すでに回答済みかチェック
    const status = await DB.prepare(`
      SELECT has_completed, score, completed_at, answer_duration
      FROM user_event_status
      WHERE user_id = ? AND event_id = ?
    `).bind(sanitizedUserId, event.id).first()
    
    if (status && (status as any).has_completed) {
      return c.json({
        userId: sanitizedUserId,
        event,
        hasCompleted: true,
        score: (status as any).score,
        completedAt: (status as any).completed_at,
        answerDuration: (status as any).answer_duration
      })
    }
    
    return c.json({
      userId: sanitizedUserId,
      event,
      hasCompleted: false,
      poolGroup: getPoolGroup(sanitizedUserId)
    })
    
  } catch (error: any) {
    console.error('Login error:', error)
    return c.json({ error: 'ログイン処理中にエラーが発生しました' }, 500)
  }
})

/**
 * 回答送信（入力検証強化版）
 * POST /api/v2/events/:eventId/submit
 */
app.post('/api/v2/events/:eventId/submit', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const { userId, answers } = await c.req.json()
  
  // 入力検証
  if (!validateEventId(eventId)) {
    return c.json({ error: '無効なイベントIDです' }, 400)
  }
  
  if (!userId || !validateUserId(userId)) {
    return c.json({ error: '無効なユーザーIDです' }, 400)
  }
  
  if (!answers || !Array.isArray(answers)) {
    return c.json({ error: '回答データが不正です' }, 400)
  }
  
  // 各回答の検証
  for (const answer of answers) {
    if (!answer.questionId || typeof answer.questionId !== 'number') {
      return c.json({ error: '無効な問題IDが含まれています' }, 400)
    }
    if (!answer.userAnswer || !validateAnswer(answer.userAnswer)) {
      return c.json({ error: '無効な回答が含まれています（A, B, C, Dのみ有効）' }, 400)
    }
  }
  
  const sanitizedUserId = sanitizeInput(userId)
  
  try {
    // すでに回答済みかチェック
    const status: any = await DB.prepare(`
      SELECT has_completed, started_at
      FROM user_event_status
      WHERE user_id = ? AND event_id = ?
    `).bind(sanitizedUserId, eventId).first()
    
    if (status && status.has_completed) {
      return c.json({ error: 'すでに回答済みです' }, 403)
    }
    
    // 回答時間を計算
    let answerDuration = 0
    if (status && status.started_at) {
      const startTime = new Date(status.started_at).getTime()
      answerDuration = Math.floor((Date.now() - startTime) / 1000)
    }
    
    // 回答を採点
    let correctCount = 0
    const results = []
    
    for (const answer of answers) {
      const question = await DB.prepare(`
        SELECT correct_answer FROM questions WHERE id = ?
      `).bind(answer.questionId).first()
      
      if (!question) continue
      
      const isCorrect = answer.userAnswer.toUpperCase() === (question as any).correct_answer
      if (isCorrect) correctCount++
      
      await DB.prepare(`
        INSERT INTO answers (user_id, event_id, question_id, user_answer, is_correct)
        VALUES (?, ?, ?, ?, ?)
      `).bind(sanitizedUserId, eventId, answer.questionId, answer.userAnswer.toUpperCase(), isCorrect ? 1 : 0).run()
      
      results.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer.toUpperCase(),
        correctAnswer: (question as any).correct_answer,
        isCorrect
      })
    }
    
    // 参加状態を更新
    await DB.prepare(`
      UPDATE user_event_status 
      SET has_completed = 1, score = ?, completed_at = datetime('now'), answer_duration = ?
      WHERE user_id = ? AND event_id = ?
    `).bind(correctCount, answerDuration, sanitizedUserId, eventId).run()
    
    return c.json({
      score: correctCount,
      total: answers.length,
      answerDuration,
      results
    })
    
  } catch (error: any) {
    console.error('Submit error:', error)
    return c.json({ error: '回答送信中にエラーが発生しました' }, 500)
  }
})

// ==================== ユーティリティ関数 ====================

function getPoolGroup(userId: string): number {
  const lastChar = userId.slice(-1)
  const num = parseInt(lastChar, 10)
  return isNaN(num) ? 0 : num
}

export default app
