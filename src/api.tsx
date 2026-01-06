import { Hono } from 'hono'
import { cors } from 'hono/cors'
import analyticsApi from './analytics-api'
import aiApi from './ai-api'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())
app.use('/admin/api/*', cors())

// ユーティリティ関数：IDから問題群を決定
function getPoolGroup(userId: string): number {
  const lastChar = userId.slice(-1)
  const num = parseInt(lastChar, 10)
  return isNaN(num) ? 0 : num
}

// ==================== 管理者API ====================

// 管理者ログイン
app.post('/admin/api/login', async (c) => {
  const { DB } = c.env
  const { username, password } = await c.req.json()

  const admin = await DB.prepare(`
    SELECT id, username FROM admins 
    WHERE username = ? AND password_hash = ?
  `).bind(username, password).first()

  if (!admin) {
    return c.json({ error: '認証に失敗しました' }, 401)
  }

  return c.json({ 
    success: true, 
    admin: { id: admin.id, username: admin.username }
  })
})

// イベント一覧取得
app.get('/admin/api/events', async (c) => {
  const { DB } = c.env
  
  const events = await DB.prepare(`
    SELECT * FROM events ORDER BY created_at DESC
  `).all()

  return c.json({ events: events.results })
})

// イベント作成
app.post('/admin/api/events', async (c) => {
  const { DB } = c.env
  const { name, description, start_date, end_date, questions_per_user, mode, min_participants } = await c.req.json()

  const result = await DB.prepare(`
    INSERT INTO events (name, description, start_date, end_date, questions_per_user, mode, min_participants, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(name, description, start_date, end_date, questions_per_user, mode, min_participants).run()

  return c.json({ success: true, eventId: result.meta.last_row_id })
})

// イベント更新
app.put('/admin/api/events/:id', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('id')
  const { name, description, start_date, end_date, questions_per_user, mode, min_participants, is_active } = await c.req.json()

  await DB.prepare(`
    UPDATE events 
    SET name = ?, description = ?, start_date = ?, end_date = ?, 
        questions_per_user = ?, mode = ?, min_participants = ?, is_active = ?
    WHERE id = ?
  `).bind(name, description, start_date, end_date, questions_per_user, mode, min_participants, is_active, eventId).run()

  return c.json({ success: true })
})

// イベント削除
app.delete('/admin/api/events/:id', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('id')

  await DB.prepare(`DELETE FROM events WHERE id = ?`).bind(eventId).run()
  return c.json({ success: true })
})

// 問題一覧取得
app.get('/admin/api/events/:eventId/questions', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')

  const questions = await DB.prepare(`
    SELECT * FROM questions WHERE event_id = ? ORDER BY pool_group, id
  `).bind(eventId).all()

  return c.json({ questions: questions.results })
})

// 問題作成
app.post('/admin/api/events/:eventId/questions', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const { question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group } = await c.req.json()

  const result = await DB.prepare(`
    INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(eventId, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group).run()

  return c.json({ success: true, questionId: result.meta.last_row_id })
})

// 問題更新
app.put('/admin/api/questions/:id', async (c) => {
  const { DB } = c.env
  const questionId = c.req.param('id')
  const { question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group } = await c.req.json()

  await DB.prepare(`
    UPDATE questions 
    SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, pool_group = ?
    WHERE id = ?
  `).bind(question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group, questionId).run()

  return c.json({ success: true })
})

// 問題削除
app.delete('/admin/api/questions/:id', async (c) => {
  const { DB } = c.env
  const questionId = c.req.param('id')

  await DB.prepare(`DELETE FROM questions WHERE id = ?`).bind(questionId).run()
  return c.json({ success: true })
})

// イベント参加者・結果一覧
app.get('/admin/api/events/:eventId/participants', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')

  const participants = await DB.prepare(`
    SELECT u.user_id, u.name, u.team_name, u.company_name, 
           s.score, s.completed_at, s.answer_duration, s.has_completed
    FROM user_event_status s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.event_id = ?
    ORDER BY s.completed_at DESC
  `).bind(eventId).all()

  return c.json({ participants: participants.results })
})

// ==================== ユーザーAPI ====================

// アクティブなイベント取得
app.get('/api/events/active', async (c) => {
  const { DB } = c.env
  
  const result = await DB.prepare(`
    SELECT id, name, description, start_date, end_date, questions_per_user, mode, min_participants
    FROM events
    WHERE is_active = 1
      AND datetime('now') BETWEEN start_date AND end_date
    ORDER BY created_at DESC
    LIMIT 1
  `).first()

  if (!result) {
    return c.json({ error: 'アクティブなイベントがありません' }, 404)
  }

  return c.json(result)
})

// ユーザー認証・登録（マルチモード対応）
app.post('/api/auth/login', async (c) => {
  const { DB } = c.env
  const { userId, name, teamName, companyName } = await c.req.json()

  if (!userId || userId.trim() === '') {
    return c.json({ error: 'ユーザーIDを入力してください' }, 400)
  }

  // アクティブなイベント取得
  const event: any = await DB.prepare(`
    SELECT id, name, description, start_date, end_date, questions_per_user, mode, min_participants
    FROM events
    WHERE is_active = 1
      AND datetime('now') BETWEEN start_date AND end_date
    ORDER BY created_at DESC
    LIMIT 1
  `).first()

  if (!event) {
    return c.json({ error: 'アクティブなイベントがありません' }, 404)
  }

  // モードに応じたバリデーション
  if (event.mode === 'team' && (!teamName || teamName.trim() === '')) {
    return c.json({ error: 'チーム名を入力してください' }, 400)
  }
  if (event.mode === 'company' && (!companyName || companyName.trim() === '')) {
    return c.json({ error: '企業名を入力してください' }, 400)
  }

  // ユーザー登録または更新
  await DB.prepare(`
    INSERT INTO users (user_id, name, team_name, company_name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      name = excluded.name,
      team_name = excluded.team_name,
      company_name = excluded.company_name
  `).bind(userId, name || userId, teamName || null, companyName || null).run()

  // すでに回答済みかチェック
  const status = await DB.prepare(`
    SELECT has_completed, score, completed_at, answer_duration
    FROM user_event_status
    WHERE user_id = ? AND event_id = ?
  `).bind(userId, event.id).first()

  if (status && status.has_completed) {
    return c.json({
      userId,
      event,
      hasCompleted: true,
      score: status.score,
      completedAt: status.completed_at,
      answerDuration: status.answer_duration
    })
  }

  return c.json({
    userId,
    event,
    hasCompleted: false,
    poolGroup: getPoolGroup(userId)
  })
})

// 問題取得（開始時間記録）
app.get('/api/events/:eventId/questions', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const userId = c.req.query('userId')
  const poolGroupParam = c.req.query('poolGroup')

  if (!userId) {
    return c.json({ error: 'ユーザーIDが必要です' }, 400)
  }

  // すでに回答済みかチェック
  const status = await DB.prepare(`
    SELECT has_completed
    FROM user_event_status
    WHERE user_id = ? AND event_id = ?
  `).bind(userId, eventId).first()

  if (status && status.has_completed) {
    return c.json({ error: 'すでに回答済みです' }, 403)
  }

  // 問題群を決定
  const poolGroup = poolGroupParam ? parseInt(poolGroupParam, 10) : getPoolGroup(userId)

  // イベント情報取得
  const event = await DB.prepare(`
    SELECT questions_per_user FROM events WHERE id = ?
  `).bind(eventId).first()

  if (!event) {
    return c.json({ error: 'イベントが見つかりません' }, 404)
  }

  // 開始時間を記録
  await DB.prepare(`
    INSERT INTO user_event_status (user_id, event_id, has_completed, score, started_at)
    VALUES (?, ?, 0, 0, datetime('now'))
    ON CONFLICT(user_id, event_id) DO UPDATE SET started_at = datetime('now')
  `).bind(userId, eventId).run()

  // 問題取得
  const questions = await DB.prepare(`
    SELECT id, question_text, option_a, option_b, option_c, option_d
    FROM questions
    WHERE event_id = ? AND pool_group = ?
    ORDER BY RANDOM()
    LIMIT ?
  `).bind(eventId, poolGroup, event.questions_per_user).all()

  return c.json({
    questions: questions.results,
    poolGroup,
    startTime: new Date().toISOString()
  })
})

// 回答送信（回答時間記録）
app.post('/api/events/:eventId/submit', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const { userId, answers } = await c.req.json()

  if (!userId || !answers || !Array.isArray(answers)) {
    return c.json({ error: '不正なリクエストです' }, 400)
  }

  // すでに回答済みかチェック
  const status: any = await DB.prepare(`
    SELECT has_completed, started_at
    FROM user_event_status
    WHERE user_id = ? AND event_id = ?
  `).bind(userId, eventId).first()

  if (status && status.has_completed) {
    return c.json({ error: 'すでに回答済みです' }, 403)
  }

  // 回答時間を計算（秒単位）
  let answerDuration = 0
  if (status && status.started_at) {
    const startTime = new Date(status.started_at).getTime()
    const endTime = Date.now()
    answerDuration = Math.floor((endTime - startTime) / 1000)
  }

  // 回答を採点
  let correctCount = 0
  const results = []

  for (const answer of answers) {
    const question = await DB.prepare(`
      SELECT correct_answer FROM questions WHERE id = ?
    `).bind(answer.questionId).first()

    if (!question) continue

    const isCorrect = answer.userAnswer === question.correct_answer
    if (isCorrect) correctCount++

    await DB.prepare(`
      INSERT INTO answers (user_id, event_id, question_id, user_answer, is_correct)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, eventId, answer.questionId, answer.userAnswer, isCorrect ? 1 : 0).run()

    results.push({
      questionId: answer.questionId,
      userAnswer: answer.userAnswer,
      correctAnswer: question.correct_answer,
      isCorrect
    })
  }

  // 参加状態を更新
  await DB.prepare(`
    UPDATE user_event_status 
    SET has_completed = 1, score = ?, completed_at = datetime('now'), answer_duration = ?
    WHERE user_id = ? AND event_id = ?
  `).bind(correctCount, answerDuration, userId, eventId).run()

  return c.json({
    score: correctCount,
    total: answers.length,
    answerDuration,
    results
  })
})

// 個人ランキング取得
app.get('/api/events/:eventId/ranking/individual', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')

  const ranking = await DB.prepare(`
    SELECT u.user_id, u.name, u.team_name, u.company_name, s.score, s.completed_at, s.answer_duration
    FROM user_event_status s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.event_id = ? AND s.has_completed = 1
    ORDER BY s.score DESC, s.answer_duration ASC, s.completed_at ASC
    LIMIT 100
  `).bind(eventId).all()

  return c.json({ ranking: ranking.results })
})

// チームランキング取得
app.get('/api/events/:eventId/ranking/team', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')

  const event: any = await DB.prepare(`
    SELECT questions_per_user, min_participants FROM events WHERE id = ?
  `).bind(eventId).first()

  if (!event) {
    return c.json({ error: 'イベントが見つかりません' }, 404)
  }

  // チームごとの集計
  const teamStats = await DB.prepare(`
    SELECT 
      u.team_name,
      COUNT(*) as member_count,
      AVG(CAST(s.score AS FLOAT) / ? * 100) as avg_accuracy,
      AVG(s.answer_duration) as avg_duration
    FROM user_event_status s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.event_id = ? AND s.has_completed = 1 AND u.team_name IS NOT NULL
    GROUP BY u.team_name
    HAVING member_count >= ?
    ORDER BY avg_accuracy DESC, avg_duration ASC
  `).bind(event.questions_per_user, eventId, event.min_participants).all()

  return c.json({ ranking: teamStats.results })
})

// 企業ランキング取得
app.get('/api/events/:eventId/ranking/company', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')

  const event: any = await DB.prepare(`
    SELECT questions_per_user, min_participants FROM events WHERE id = ?
  `).bind(eventId).first()

  if (!event) {
    return c.json({ error: 'イベントが見つかりません' }, 404)
  }

  // 企業ごとの集計
  const companyStats = await DB.prepare(`
    SELECT 
      u.company_name,
      COUNT(*) as member_count,
      AVG(CAST(s.score AS FLOAT) / ? * 100) as avg_accuracy,
      AVG(s.answer_duration) as avg_duration
    FROM user_event_status s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.event_id = ? AND s.has_completed = 1 AND u.company_name IS NOT NULL
    GROUP BY u.company_name
    HAVING member_count >= ?
    ORDER BY avg_accuracy DESC, avg_duration ASC
  `).bind(event.questions_per_user, eventId, event.min_participants).all()

  return c.json({ ranking: companyStats.results })
})

// ユーザーの結果取得
app.get('/api/events/:eventId/result/:userId', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const userId = c.req.param('userId')

  const status = await DB.prepare(`
    SELECT score, completed_at, answer_duration
    FROM user_event_status
    WHERE user_id = ? AND event_id = ?
  `).bind(userId, eventId).first()

  if (!status) {
    return c.json({ error: '結果が見つかりません' }, 404)
  }

  // 個人ランキング内の順位を取得
  const rankResult = await DB.prepare(`
    SELECT COUNT(*) + 1 as rank
    FROM user_event_status
    WHERE event_id = ? 
      AND (score > ? OR (score = ? AND answer_duration < ?) OR (score = ? AND answer_duration = ? AND completed_at < ?))
  `).bind(eventId, status.score, status.score, status.answer_duration, status.score, status.answer_duration, status.completed_at).first()

  return c.json({
    score: status.score,
    completedAt: status.completed_at,
    answerDuration: status.answer_duration,
    rank: rankResult?.rank || 1
  })
})

// ==================== AI機能 ====================

// カテゴリ一覧取得
app.get('/admin/api/categories', async (c) => {
  const { DB } = c.env
  
  const categories = await DB.prepare(`
    SELECT * FROM question_categories ORDER BY id
  `).all()
  
  return c.json({ categories: categories.results })
})

// AI問題生成（ファイルアップロード対応）
app.post('/admin/api/ai/generate-questions', async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.parseBody()
    const fileContent = body['content'] as string // テキストコンテンツ
    const category = body['category'] as string || '一般知識'
    const count = parseInt(body['count'] as string || '10')
    const eventId = body['event_id'] as string
    
    if (!fileContent) {
      return c.json({ error: 'コンテンツが必要です' }, 400)
    }
    
    // OpenAI APIキー確認（環境変数から）
    const apiKey = c.env.OPENAI_API_KEY || ''
    const baseURL = c.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
    
    if (!apiKey) {
      return c.json({ 
        error: 'OpenAI APIキーが設定されていません。GenSparkのAPI Keysタブで設定してください。',
        setup_required: true
      }, 400)
    }
    
    // プロンプト生成
    const prompt = `あなたは企業向けクイズの問題作成エキスパートです。

以下の社内資料から、${count}問の4択クイズを作成してください。

【カテゴリ】: ${category}

【社内資料】:
${fileContent}

【出力形式】:
JSON形式で、以下の構造で出力してください：

\`\`\`json
{
  "questions": [
    {
      "question_text": "問題文",
      "option_a": "選択肢A",
      "option_b": "選択肢B",
      "option_c": "選択肢C",
      "option_d": "選択肢D",
      "correct_answer": "A",
      "detailed_explanation": "この問題の背景や詳細な説明。200文字程度。"
    }
  ]
}
\`\`\`

【重要な指示】:
1. 問題は資料の内容に基づいた事実のみ
2. 選択肢は明確に区別できるもの
3. 正解は資料から明確に判断できるもの
4. detailed_explanationには、問題の背景や覚えておくべきポイントを記載
5. 必ずJSON形式のみを出力すること（\`\`\`json などのマークダウンは不要）

それでは、${count}問を作成してください。`

    // OpenAI API呼び出し（fetch使用）
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates quiz questions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      return c.json({ error: 'AI問題生成に失敗しました', details: errorText }, 500)
    }
    
    const aiResponse = await response.json() as any
    const content = aiResponse.choices[0]?.message?.content || ''
    
    // JSONを抽出（マークダウンコードブロックを除去）
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').trim()
    }
    
    const generatedData = JSON.parse(jsonContent)
    
    // カテゴリIDを取得
    const categoryRecord = await DB.prepare(`
      SELECT id FROM question_categories WHERE name = ?
    `).bind(category).first()
    
    const categoryId = categoryRecord?.id || 6 // デフォルトは「その他」
    
    return c.json({
      success: true,
      questions: generatedData.questions.map((q: any) => ({
        ...q,
        category_id: categoryId,
        source_material: '社内資料（アップロード）'
      })),
      count: generatedData.questions.length
    })
    
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return c.json({ 
      error: 'AI問題生成中にエラーが発生しました',
      details: error.message 
    }, 500)
  }
})

// 生成された問題を一括登録
app.post('/admin/api/questions/bulk-create', async (c) => {
  const { DB } = c.env
  const { event_id, questions } = await c.req.json()
  
  if (!event_id || !questions || !Array.isArray(questions)) {
    return c.json({ error: '不正なリクエストです' }, 400)
  }
  
  try {
    const results = []
    
    for (const q of questions) {
      // ランダムに問題群を割り当て（0-9）
      const poolGroup = Math.floor(Math.random() * 10)
      
      const result = await DB.prepare(`
        INSERT INTO questions (
          event_id, question_text, option_a, option_b, option_c, option_d, 
          correct_answer, pool_group, category_id, source_material, detailed_explanation
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        event_id, 
        q.question_text, 
        q.option_a, 
        q.option_b, 
        q.option_c, 
        q.option_d,
        q.correct_answer, 
        poolGroup,
        q.category_id || 6,
        q.source_material || 'AI生成',
        q.detailed_explanation || ''
      ).run()
      
      results.push({ id: result.meta.last_row_id, pool_group: poolGroup })
    }
    
    return c.json({ 
      success: true, 
      created: results.length,
      questions: results
    })
  } catch (error: any) {
    console.error('Bulk Create Error:', error)
    return c.json({ error: '問題の登録に失敗しました', details: error.message }, 500)
  }
})

// ==================== サブルートをマウント ====================
app.route('/', analyticsApi)
app.route('/', aiApi)

export default app
