import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/admin/api/*', cors())

// ==================== AI自動分類API ====================

// POST /admin/api/ai/classify-question - 問題の自動分類
app.post('/admin/api/ai/classify-question', async (c) => {
  try {
    const { question_text, options, context } = await c.req.json()
    const { env } = c

    const apiKey = env.OPENAI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'OpenAI API key not configured' }, 500)
    }

    const baseURL = env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'

    // AI分類プロンプト
    const systemPrompt = `あなたは企業クイズシステムの問題分類AIです。与えられた問題を以下の4種類に分類してください：

1. **entertainment（エンタメ系）**
   - 未来予測、ゲーム的要素、楽しみを目的とした問題
   - 例：「田中君は何を食べる？」「明日の天気は？」
   - 保持期間：短期（7日）

2. **learning（学習系）**
   - 業務知識、スキル、一般常識の学習を目的とした問題
   - 例：「SQLのJOIN句の種類は？」「営業マナーとは？」
   - 保持期間：永久

3. **knowledge（ナレッジ系）**
   - 企業の内部情報、業務手順、ツールの使い方など
   - 例：「経費申請の手順は？」「CRMシステムの使い方は？」
   - 保持期間：永久（定期更新必要）

4. **history（社史系）**
   - 企業の歴史、創業者、企業文化、沿革など
   - 例：「当社の創業年は？」「社長の名前は？」
   - 保持期間：永久

以下の形式でJSON形式で返してください：
{
  "type": "entertainment" | "learning" | "knowledge" | "history",
  "confidence": 0.0-1.0,
  "reason": "分類理由を日本語で説明",
  "retention_policy": "short" | "medium" | "permanent"
}
`

    const userPrompt = `問題文：${question_text}

${options ? `選択肢：
${options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}` : ''}

${context ? `追加情報：${context}` : ''}

この問題を分類してください。`

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return c.json({ success: false, error: 'AI classification failed', details: error }, 500)
    }

    const data = await response.json()
    const classification = JSON.parse(data.choices[0].message.content)

    return c.json({
      success: true,
      classification
    })

  } catch (error: any) {
    console.error('Classify question error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== 情報インプット → AI問題生成 ====================

// POST /admin/api/knowledge-base/bulk-create - 情報から問題を一括生成
app.post('/admin/api/knowledge-base/bulk-create', async (c) => {
  try {
    const { input_type, content, question_type, count, event_id, title } = await c.req.json()
    const { env } = c

    const apiKey = env.OPENAI_API_KEY
    if (!apiKey) {
      return c.json({ success: false, error: 'OpenAI API key not configured' }, 500)
    }

    const baseURL = env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'

    // Step 1: 知識ベースに保存
    const knowledge = await env.DB.prepare(`
      INSERT INTO knowledge_base (title, content, source_type, source_name, uploaded_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(
      title || 'Untitled',
      content,
      input_type,
      input_type === 'file' ? title : null
    ).run()

    const knowledgeId = knowledge.meta.last_row_id

    // Step 2: AI問題生成
    const questionTypeLabel = {
      entertainment: 'エンタメ系',
      learning: '学習系',
      knowledge: 'ナレッジ系',
      history: '社史系'
    }[question_type] || '学習系'

    const systemPrompt = `あなたは企業クイズシステムの問題作成AIです。与えられた情報から${questionTypeLabel}の4択クイズ問題を作成してください。

以下の形式でJSON形式で返してください（配列で${count}問）：
[
  {
    "question_text": "問題文",
    "option_a": "選択肢A",
    "option_b": "選択肢B",
    "option_c": "選択肢C",
    "option_d": "選択肢D",
    "correct_answer": "A",
    "detailed_explanation": "詳しい解説",
    "pool_group": 0
  }
]

**重要な注意事項：**
- 問題は情報から直接導出できるものにすること
- 難易度は中程度にすること
- 詳しい解説を必ず含めること
- pool_groupは0-9のランダムな値
`

    const userPrompt = `以下の情報から${count}問の${questionTypeLabel}クイズを作成してください：

${content}
`

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return c.json({ success: false, error: 'AI question generation failed', details: error }, 500)
    }

    const data = await response.json()
    const content_str = data.choices[0].message.content
    
    // JSONコンテンツを抽出（```json...```の場合を処理）
    let questions
    if (content_str.includes('```json')) {
      const jsonMatch = content_str.match(/```json\n([\s\S]*?)\n```/)
      questions = JSON.parse(jsonMatch ? jsonMatch[1] : content_str)
    } else if (content_str.includes('```')) {
      const jsonMatch = content_str.match(/```\n([\s\S]*?)\n```/)
      questions = JSON.parse(jsonMatch ? jsonMatch[1] : content_str)
    } else {
      questions = JSON.parse(content_str)
    }

    // Step 3: 問題をデータベースに保存
    const questionIds = []
    for (const q of questions) {
      const result = await env.DB.prepare(`
        INSERT INTO questions (
          event_id, question_text, option_a, option_b, option_c, option_d,
          correct_answer, pool_group, source_material, detailed_explanation,
          question_type, retention_policy, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        event_id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_answer,
        q.pool_group || Math.floor(Math.random() * 10),
        title || 'AI生成',
        q.detailed_explanation,
        question_type,
        question_type === 'entertainment' ? 'short' : 'permanent'
      ).run()

      const questionId = result.meta.last_row_id

      // 知識ベースとの関連付け
      await env.DB.prepare(`
        INSERT INTO knowledge_questions (knowledge_id, question_id, created_at)
        VALUES (?, ?, datetime('now'))
      `).bind(knowledgeId, questionId).run()

      questionIds.push(questionId)
    }

    return c.json({
      success: true,
      knowledge_id: knowledgeId,
      questions,
      question_ids: questionIds,
      count: questions.length
    })

  } catch (error: any) {
    console.error('Bulk create knowledge error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// ==================== 問題数カウント ====================

// GET /admin/api/classification/stats - 問題数統計
app.get('/admin/api/classification/stats', async (c) => {
  try {
    const { env } = c

    // 全体の問題数
    const total = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM questions
    `).first()

    // 種別ごとの問題数
    const byType = await env.DB.prepare(`
      SELECT 
        question_type,
        COUNT(*) as count
      FROM questions
      GROUP BY question_type
    `).all()

    // 保持ポリシー別の問題数
    const byRetention = await env.DB.prepare(`
      SELECT 
        retention_policy,
        COUNT(*) as count
      FROM questions
      GROUP BY retention_policy
    `).all()

    // アクティブ/非アクティブの問題数
    const byActive = await env.DB.prepare(`
      SELECT 
        is_active,
        COUNT(*) as count
      FROM questions
      GROUP BY is_active
    `).all()

    return c.json({
      success: true,
      stats: {
        total: total?.count || 0,
        by_type: byType.results,
        by_retention: byRetention.results,
        by_active: byActive.results
      }
    })

  } catch (error: any) {
    console.error('Get knowledge stats error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// GET /admin/api/knowledge/:id - ナレッジ詳細取得
app.get('/admin/api/knowledge/:id', async (c) => {
  try {
    const { env } = c
    const id = parseInt(c.req.param('id'))

    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid knowledge ID' }, 400)
    }

    const knowledge = await env.DB.prepare(`
      SELECT * FROM knowledge_base WHERE id = ?
    `).bind(id).first()

    if (!knowledge) {
      return c.json({ success: false, error: 'Knowledge not found' }, 404)
    }

    return c.json({
      success: true,
      knowledge
    })

  } catch (error: any) {
    console.error('Get knowledge detail error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// GET /admin/api/knowledge-base/list - 知識ベース一覧
app.get('/admin/api/knowledge-base/list', async (c) => {
  try {
    const { env } = c

    const knowledgeList = await env.DB.prepare(`
      SELECT 
        kb.*,
        COUNT(kq.question_id) as question_count
      FROM knowledge_base kb
      LEFT JOIN knowledge_questions kq ON kb.id = kq.knowledge_id
      GROUP BY kb.id
      ORDER BY kb.uploaded_at DESC
    `).all()

    return c.json({
      success: true,
      knowledge: knowledgeList.results
    })

  } catch (error: any) {
    console.error('Get knowledge list error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
