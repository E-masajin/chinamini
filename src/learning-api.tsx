import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * 組織全体の学習状況を取得
 * GET /admin/api/learning/organization-stats
 */
app.get('/admin/api/learning/organization-stats', async (c) => {
  const { DB } = c.env
  
  try {
    // カテゴリ別の学習統計を集計
    const stats = await DB.prepare(`
      SELECT 
        COALESCE(q.category, 'その他') as category,
        COUNT(a.id) as total_attempts,
        SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
        ROUND(AVG(CASE WHEN a.is_correct = 1 THEN 100.0 ELSE 0.0 END), 1) as accuracy_rate,
        ROUND(AVG(a.time_spent), 1) as avg_time_spent,
        COUNT(DISTINCT a.user_id) as unique_users
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.answered_at >= datetime('now', '-30 days')
      GROUP BY q.category
      ORDER BY accuracy_rate ASC
    `).all()
    
    // 総学習時間
    const totalTime = await DB.prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_questions,
        SUM(time_spent) as total_time_spent
      FROM answers
      WHERE answered_at >= datetime('now', '-30 days')
    `).first()
    
    return c.json({
      success: true,
      stats: stats.results,
      summary: totalTime
    })
    
  } catch (error: any) {
    console.error('Organization Stats Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 個人の学習状況を取得
 * GET /admin/api/learning/user-stats/:userId
 */
app.get('/admin/api/learning/user-stats/:userId', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('userId')
  
  try {
    // カテゴリ別の個人統計
    const stats = await DB.prepare(`
      SELECT 
        COALESCE(q.category, 'その他') as category,
        COUNT(a.id) as total_attempts,
        SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
        ROUND(AVG(CASE WHEN a.is_correct = 1 THEN 100.0 ELSE 0.0 END), 1) as accuracy_rate,
        ROUND(AVG(a.time_spent), 1) as avg_time_spent,
        MAX(a.answered_at) as last_studied_at
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      GROUP BY q.category
      ORDER BY accuracy_rate ASC
    `).bind(userId).all()
    
    // 総合統計
    const summary = await DB.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
        ROUND(AVG(CASE WHEN is_correct = 1 THEN 100.0 ELSE 0.0 END), 1) as overall_accuracy,
        SUM(time_spent) as total_time_spent,
        MIN(answered_at) as first_study,
        MAX(answered_at) as last_study
      FROM answers
      WHERE user_id = ?
    `).bind(userId).first()
    
    // 苦手分野トップ3
    const weaknesses = await DB.prepare(`
      SELECT 
        COALESCE(q.category, 'その他') as category,
        ROUND(AVG(CASE WHEN a.is_correct = 1 THEN 100.0 ELSE 0.0 END), 1) as accuracy_rate,
        COUNT(a.id) as attempts
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      GROUP BY q.category
      HAVING attempts >= 3
      ORDER BY accuracy_rate ASC
      LIMIT 3
    `).bind(userId).all()
    
    return c.json({
      success: true,
      stats: stats.results,
      summary,
      weaknesses: weaknesses.results
    })
    
  } catch (error: any) {
    console.error('User Stats Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 問題を新バージョンに更新
 * POST /admin/api/learning/questions/:questionId/update-version
 */
app.post('/admin/api/learning/questions/:questionId/update-version', async (c) => {
  const { DB } = c.env
  const questionId = c.req.param('questionId')
  
  try {
    const body = await c.req.json()
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      update_reason
    } = body
    
    // 元の問題を取得
    const oldQuestion: any = await DB.prepare(`
      SELECT * FROM questions WHERE id = ?
    `).bind(questionId).first()
    
    if (!oldQuestion) {
      return c.json({ error: '問題が見つかりません' }, 404)
    }
    
    // 旧バージョンを非アクティブ化
    await DB.prepare(`
      UPDATE questions
      SET is_active = 0,
          deprecated_at = datetime('now'),
          valid_until = datetime('now')
      WHERE id = ?
    `).bind(questionId).run()
    
    // 新バージョンを作成
    const newVersion = (oldQuestion.version || 1) + 1
    const baseQuestionId = oldQuestion.base_question_id || questionId
    
    const result = await DB.prepare(`
      INSERT INTO questions (
        event_id, question_text, option_a, option_b, option_c, option_d,
        correct_answer, pool_group, category, category_id,
        version, base_question_id, is_active, update_reason, valid_from
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))
    `).bind(
      oldQuestion.event_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      oldQuestion.pool_group,
      oldQuestion.category,
      oldQuestion.category_id,
      newVersion,
      baseQuestionId,
      update_reason
    ).run()
    
    // 旧バージョンに新バージョンへの参照を追加
    await DB.prepare(`
      UPDATE questions
      SET replaced_by = ?
      WHERE id = ?
    `).bind(result.meta.last_row_id, questionId).run()
    
    return c.json({
      success: true,
      message: '問題を更新しました',
      new_question_id: result.meta.last_row_id,
      version: newVersion
    })
    
  } catch (error: any) {
    console.error('Update Version Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 問題のバージョン履歴を取得
 * GET /admin/api/learning/questions/:questionId/history
 */
app.get('/admin/api/learning/questions/:questionId/history', async (c) => {
  const { DB } = c.env
  const questionId = c.req.param('questionId')
  
  try {
    // base_question_idを取得
    const question: any = await DB.prepare(`
      SELECT base_question_id FROM questions WHERE id = ?
    `).bind(questionId).first()
    
    const baseId = question?.base_question_id || questionId
    
    // 全バージョンを取得
    const history = await DB.prepare(`
      SELECT 
        id,
        version,
        question_text,
        is_active,
        update_reason,
        valid_from,
        valid_until,
        deprecated_at,
        created_at
      FROM questions
      WHERE base_question_id = ? OR id = ?
      ORDER BY version DESC
    `).bind(baseId, baseId).all()
    
    return c.json({
      success: true,
      history: history.results
    })
    
  } catch (error: any) {
    console.error('History Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 古い問題の一覧を取得（更新が必要な問題）
 * GET /admin/api/learning/questions/outdated
 */
app.get('/admin/api/learning/questions/outdated', async (c) => {
  const { DB } = c.env
  
  try {
    // 6ヶ月以上更新されていない問題
    const outdated = await DB.prepare(`
      SELECT 
        q.id,
        q.question_text,
        q.category,
        q.version,
        q.created_at,
        q.valid_from,
        COUNT(a.id) as usage_count,
        MAX(a.answered_at) as last_used
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.is_active = 1
        AND (q.valid_from IS NULL OR q.valid_from < datetime('now', '-6 months'))
        AND q.category != 'company_history'
      GROUP BY q.id
      ORDER BY q.valid_from ASC
      LIMIT 50
    `).all()
    
    return c.json({
      success: true,
      outdated: outdated.results,
      count: outdated.results.length
    })
    
  } catch (error: any) {
    console.error('Outdated Questions Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default app
