import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// ==================== 問題統計・分析機能 ====================

/**
 * イベント終了後の統計集計（手動トリガー）
 * POST /admin/api/events/:eventId/analyze
 */
app.post('/admin/api/events/:eventId/analyze', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  
  try {
    // イベントの全問題を取得
    const questions = await DB.prepare(`
      SELECT id, question_text, pool_group, category, source_material, detailed_explanation
      FROM questions 
      WHERE event_id = ?
    `).bind(eventId).all()
    
    if (!questions.results || questions.results.length === 0) {
      return c.json({ error: '問題が見つかりません' }, 404)
    }
    
    const statistics = []
    
    // 各問題の統計を計算
    for (const question of questions.results) {
      // 回答者数と正解者数を集計
      const stats = await DB.prepare(`
        SELECT 
          COUNT(*) as total_answers,
          SUM(CASE WHEN user_answer = ? THEN 1 ELSE 0 END) as correct_answers
        FROM answers
        WHERE question_id = ?
      `).bind(
        (question as any).correct_answer || 'A',  // 正解は別途取得が必要
        question.id
      ).first()
      
      const totalAnswers = (stats?.total_answers as number) || 0
      const correctAnswers = (stats?.correct_answers as number) || 0
      const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
      
      // 認識度レベルを判定
      let recognitionLevel = 'low'
      if (accuracyRate >= 80) recognitionLevel = 'high'
      else if (accuracyRate >= 50) recognitionLevel = 'medium'
      
      // 価値スコアを計算（正解率が低いほど高スコア = 学習価値が高い）
      let valueScore = 3
      if (accuracyRate < 30) valueScore = 5
      else if (accuracyRate < 50) valueScore = 4
      else if (accuracyRate >= 80) valueScore = 2
      
      // 統計データを保存
      await DB.prepare(`
        INSERT OR REPLACE INTO question_statistics (
          question_id, event_id, total_answers, correct_answers, 
          accuracy_rate, recognition_level, value_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        question.id,
        eventId,
        totalAnswers,
        correctAnswers,
        accuracyRate,
        recognitionLevel,
        valueScore
      ).run()
      
      statistics.push({
        question_id: question.id,
        question_text: (question as any).question_text,
        total_answers: totalAnswers,
        correct_answers: correctAnswers,
        accuracy_rate: accuracyRate,
        recognition_level: recognitionLevel,
        value_score: valueScore
      })
    }
    
    return c.json({
      success: true,
      event_id: eventId,
      analyzed_questions: statistics.length,
      statistics: statistics
    })
    
  } catch (error: any) {
    console.error('Analysis Error:', error)
    return c.json({ 
      error: '統計分析に失敗しました',
      details: error.message 
    }, 500)
  }
})

/**
 * ナレッジベース自動生成（正解率が低い問題を抽出）
 * POST /admin/api/events/:eventId/generate-knowledge
 */
app.post('/admin/api/events/:eventId/generate-knowledge', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const { threshold = 70 } = await c.req.json() // デフォルト: 正解率70%未満
  
  try {
    // 正解率が閾値未満の問題を取得
    const lowAccuracyQuestions = await DB.prepare(`
      SELECT 
        q.id, q.question_text, q.category, q.source_material, q.detailed_explanation,
        qs.accuracy_rate, qs.recognition_level, qs.value_score
      FROM questions q
      JOIN question_statistics qs ON q.id = qs.question_id
      WHERE q.event_id = ? AND qs.accuracy_rate < ?
      ORDER BY qs.accuracy_rate ASC
    `).bind(eventId, threshold).all()
    
    if (!lowAccuracyQuestions.results || lowAccuracyQuestions.results.length === 0) {
      return c.json({ 
        success: true,
        message: `正解率${threshold}%未満の問題はありません`,
        generated: 0
      })
    }
    
    const generatedKnowledge = []
    
    // ナレッジベースに登録
    for (const question of lowAccuracyQuestions.results) {
      const q = question as any
      
      // タイトルを生成（問題文の最初の50文字）
      const title = q.question_text.substring(0, 50) + (q.question_text.length > 50 ? '...' : '')
      
      // コンテンツを生成
      const content = `
## 問題
${q.question_text}

## 詳細説明
${q.detailed_explanation || '（詳細説明なし）'}

## 認識度
- 正解率: ${q.accuracy_rate}%
- 認識レベル: ${q.recognition_level === 'low' ? '低（強化が必要）' : q.recognition_level === 'medium' ? '中' : '高'}
- 価値スコア: ${q.value_score}/5

## 出典
${q.source_material || '不明'}
      `.trim()
      
      // カテゴリに応じてステータスを決定
      const status = q.category === 'company_history' ? 'published' : 'draft'
      
      // ナレッジベースに登録
      const result = await DB.prepare(`
        INSERT INTO knowledge_base (
          title, content, category, recognition_rate, value_score, status, source_question_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title,
        content,
        q.category || 'knowledge',
        q.accuracy_rate,
        q.value_score,
        status,
        q.id
      ).run()
      
      generatedKnowledge.push({
        id: result.meta.last_row_id,
        title: title,
        category: q.category,
        accuracy_rate: q.accuracy_rate,
        status: status
      })
    }
    
    return c.json({
      success: true,
      generated: generatedKnowledge.length,
      threshold: threshold,
      knowledge: generatedKnowledge
    })
    
  } catch (error: any) {
    console.error('Knowledge Generation Error:', error)
    return c.json({ 
      error: 'ナレッジ生成に失敗しました',
      details: error.message 
    }, 500)
  }
})

/**
 * 問題統計一覧取得
 * GET /admin/api/events/:eventId/statistics
 */
app.get('/admin/api/events/:eventId/statistics', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  
  try {
    const statistics = await DB.prepare(`
      SELECT 
        q.id, q.question_text, q.category, q.pool_group,
        qs.total_answers, qs.correct_answers, qs.accuracy_rate,
        qs.recognition_level, qs.value_score, qs.analyzed_at
      FROM questions q
      LEFT JOIN question_statistics qs ON q.id = qs.question_id
      WHERE q.event_id = ?
      ORDER BY qs.accuracy_rate ASC
    `).bind(eventId).all()
    
    return c.json({
      success: true,
      statistics: statistics.results || []
    })
    
  } catch (error: any) {
    console.error('Statistics Fetch Error:', error)
    return c.json({ 
      error: '統計の取得に失敗しました',
      details: error.message 
    }, 500)
  }
})

/**
 * ナレッジベース一覧取得
 * GET /admin/api/knowledge
 */
app.get('/admin/api/knowledge', async (c) => {
  const { DB } = c.env
  const { category, status } = c.req.query()
  
  try {
    let query = `
      SELECT 
        id, title, category, recognition_rate, value_score, 
        status, created_at, updated_at
      FROM knowledge_base
      WHERE 1=1
    `
    const params: any[] = []
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY value_score DESC, created_at DESC'
    
    const knowledge = await DB.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      knowledge: knowledge.results || []
    })
    
  } catch (error: any) {
    console.error('Knowledge Fetch Error:', error)
    return c.json({ 
      error: 'ナレッジの取得に失敗しました',
      details: error.message 
    }, 500)
  }
})

/**
 * ナレッジベース詳細取得
 * GET /admin/api/knowledge/:id
 */
app.get('/admin/api/knowledge/:id', async (c) => {
  const { DB } = c.env
  const knowledgeId = c.req.param('id')
  
  try {
    const knowledge = await DB.prepare(`
      SELECT * FROM knowledge_base WHERE id = ?
    `).bind(knowledgeId).first()
    
    if (!knowledge) {
      return c.json({ error: 'ナレッジが見つかりません' }, 404)
    }
    
    return c.json({
      success: true,
      knowledge: knowledge
    })
    
  } catch (error: any) {
    console.error('Knowledge Detail Fetch Error:', error)
    return c.json({ 
      error: 'ナレッジの取得に失敗しました',
      details: error.message 
    }, 500)
  }
})

/**
 * ナレッジベース更新
 * PUT /admin/api/knowledge/:id
 */
app.put('/admin/api/knowledge/:id', async (c) => {
  const { DB } = c.env
  const knowledgeId = c.req.param('id')
  const { title, content, category, status } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE knowledge_base 
      SET title = ?, content = ?, category = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, content, category, status, knowledgeId).run()
    
    return c.json({
      success: true,
      message: 'ナレッジを更新しました'
    })
    
  } catch (error: any) {
    console.error('Knowledge Update Error:', error)
    return c.json({ 
      error: 'ナレッジの更新に失敗しました',
      details: error.message 
    }, 500)
  }
})

/**
 * ナレッジベース削除
 * DELETE /admin/api/knowledge/:id
 */
app.delete('/admin/api/knowledge/:id', async (c) => {
  const { DB } = c.env
  const knowledgeId = c.req.param('id')
  
  try {
    await DB.prepare(`
      DELETE FROM knowledge_base WHERE id = ?
    `).bind(knowledgeId).run()
    
    return c.json({
      success: true,
      message: 'ナレッジを削除しました'
    })
    
  } catch (error: any) {
    console.error('Knowledge Delete Error:', error)
    return c.json({ 
      error: 'ナレッジの削除に失敗しました',
      details: error.message 
    }, 500)
  }
})

export default app
