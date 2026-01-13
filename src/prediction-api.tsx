import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { calculateAndAwardPoints } from './gamification-api'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/admin/api/*', cors())
app.use('/api/*', cors())

// ==================== 未来予測型クイズ API ====================

/**
 * 予測問題の作成（管理者用）
 * POST /admin/api/prediction/questions
 */
app.post('/admin/api/prediction/questions', async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const {
      event_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      prediction_date,
      verification_source,
      category_id,
      source_material,
      detailed_explanation
    } = body
    
    // 問題を作成
    const result = await DB.prepare(`
      INSERT INTO questions (
        event_id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        pool_group,
        category_id,
        source_material,
        detailed_explanation,
        prediction_date,
        verification_source,
        is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      'PENDING', // 予測問題は答えが未定
      0, // 予測問題はpool_group不要
      category_id || 6,
      source_material || '予測問題',
      detailed_explanation || '',
      prediction_date,
      verification_source,
      0 // 未検証
    ).run()
    
    return c.json({
      success: true,
      question_id: result.meta.last_row_id
    })
    
  } catch (error: any) {
    console.error('Prediction Question Create Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 予測イベントの問題一覧取得（ユーザー用）
 * GET /api/prediction/events/:eventId/questions
 */
app.get('/api/prediction/events/:eventId/questions', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  
  try {
    const questions = await DB.prepare(`
      SELECT 
        q.id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.prediction_date,
        q.verification_source,
        q.is_verified,
        q.detailed_explanation
      FROM questions q
      WHERE q.event_id = ?
      ORDER BY q.id
    `).bind(eventId).all()
    
    return c.json({ questions: questions.results })
    
  } catch (error: any) {
    console.error('Get Prediction Questions Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 予測回答の送信
 * POST /api/prediction/events/:eventId/submit
 */
app.post('/api/prediction/events/:eventId/submit', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  
  try {
    const body = await c.req.json()
    const { user_id, predictions } = body
    
    // predictions: [{ question_id, predicted_answer, confidence_level }]
    
    for (const pred of predictions) {
      await DB.prepare(`
        INSERT INTO prediction_answers (
          user_id,
          question_id,
          event_id,
          predicted_answer,
          confidence_level
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        user_id,
        pred.question_id,
        eventId,
        pred.predicted_answer,
        pred.confidence_level || 3
      ).run()
    }
    
    // 参加ステータスを更新
    await DB.prepare(`
      INSERT OR REPLACE INTO user_event_status (
        user_id,
        event_id,
        has_participated,
        participated_at,
        score,
        questions_count
      ) VALUES (?, ?, ?, datetime('now'), ?, ?)
    `).bind(
      user_id,
      eventId,
      1,
      0, // 予測問題は答え合わせまでスコア不明
      predictions.length
    ).run()
    
    return c.json({
      success: true,
      message: '予測を送信しました。答え合わせをお待ちください。',
      predictions_count: predictions.length
    })
    
  } catch (error: any) {
    console.error('Submit Prediction Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ユーザーの予測一覧取得
 * GET /api/prediction/events/:eventId/my-predictions/:userId
 */
app.get('/api/prediction/events/:eventId/my-predictions/:userId', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const userId = c.req.param('userId')
  
  try {
    const predictions = await DB.prepare(`
      SELECT 
        pa.id,
        pa.question_id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        pa.predicted_answer,
        pa.predicted_at,
        pa.actual_answer,
        pa.is_correct,
        pa.verified_at,
        pa.confidence_level,
        q.prediction_date,
        q.is_verified
      FROM prediction_answers pa
      JOIN questions q ON pa.question_id = q.id
      WHERE pa.user_id = ? AND pa.event_id = ?
      ORDER BY q.prediction_date
    `).bind(userId, eventId).all()
    
    return c.json({ predictions: predictions.results })
    
  } catch (error: any) {
    console.error('Get My Predictions Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 答え合わせ実行（管理者用）
 * POST /admin/api/prediction/questions/:questionId/verify
 */
app.post('/admin/api/prediction/questions/:questionId/verify', async (c) => {
  const { DB } = c.env
  const questionId = c.req.param('questionId')
  
  try {
    const body = await c.req.json()
    const { actual_value, actual_option, data_source, raw_data } = body
    
    // 実データを保存
    await DB.prepare(`
      INSERT INTO prediction_actual_data (
        question_id,
        data_source,
        actual_value,
        actual_option,
        raw_data
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      questionId,
      data_source,
      actual_value,
      actual_option,
      raw_data || ''
    ).run()
    
    // 問題の正解を更新
    await DB.prepare(`
      UPDATE questions
      SET correct_answer = ?, is_verified = 1
      WHERE id = ?
    `).bind(actual_option, questionId).run()
    
    // 全ユーザーの予測を答え合わせ
    await DB.prepare(`
      UPDATE prediction_answers
      SET 
        actual_answer = ?,
        is_correct = CASE 
          WHEN predicted_answer = ? THEN 1 
          ELSE 0 
        END,
        verified_at = datetime('now')
      WHERE question_id = ?
    `).bind(actual_option, actual_option, questionId).run()
    
    // 統計を更新（各ユーザー）
    const users = await DB.prepare(`
      SELECT DISTINCT user_id, event_id
      FROM prediction_answers
      WHERE question_id = ?
    `).bind(questionId).all()
    
    for (const user of users.results as any[]) {
      const stats = await DB.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
          AVG(confidence_level) as avg_conf
        FROM prediction_answers
        WHERE user_id = ? AND event_id = ? AND is_correct IS NOT NULL
      `).bind(user.user_id, user.event_id).first()
      
      const total = (stats?.total as number) || 0
      const correct = (stats?.correct as number) || 0
      const accuracy = total > 0 ? (correct / total) * 100 : 0
      const avgConf = (stats?.avg_conf as number) || 0
      
      await DB.prepare(`
        INSERT OR REPLACE INTO prediction_statistics (
          user_id,
          event_id,
          total_predictions,
          correct_predictions,
          accuracy_rate,
          avg_confidence
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        user.user_id,
        user.event_id,
        total,
        correct,
        accuracy,
        avgConf
      ).run()
      
      // ポイント付与（ゲーミフィケーション）
      // このイベントの全ての予測結果を取得
      const userPredictions: any = await DB.prepare(`
        SELECT 
          question_id,
          predicted_answer,
          is_correct,
          confidence_level
        FROM prediction_answers
        WHERE user_id = ? AND event_id = ? AND is_correct IS NOT NULL
      `).bind(user.user_id, user.event_id).all()
      
      if (userPredictions.results.length > 0) {
        // ポイント計算と付与
        await calculateAndAwardPoints(
          DB,
          user.user_id,
          user.event_id,
          userPredictions.results
        )
      }
    }
    
    return c.json({
      success: true,
      message: '答え合わせが完了しました',
      verified_users: users.results.length
    })
    
  } catch (error: any) {
    console.error('Verify Prediction Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 予測ランキング取得
 * GET /api/prediction/events/:eventId/ranking
 */
app.get('/api/prediction/events/:eventId/ranking', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  
  try {
    const rankings = await DB.prepare(`
      SELECT 
        ps.user_id,
        ues.name,
        ps.total_predictions,
        ps.correct_predictions,
        ps.accuracy_rate,
        ps.avg_confidence
      FROM prediction_statistics ps
      LEFT JOIN user_event_status ues 
        ON ps.user_id = ues.user_id AND ps.event_id = ues.event_id
      WHERE ps.event_id = ?
      ORDER BY ps.accuracy_rate DESC, ps.avg_confidence DESC
      LIMIT 50
    `).bind(eventId).all()
    
    return c.json({ rankings: rankings.results })
    
  } catch (error: any) {
    console.error('Get Prediction Ranking Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default app
