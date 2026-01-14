import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/admin/api/*', cors())
app.use('/api/*', cors())

// ==================== コミュニケーション情報 API ====================

/**
 * 予測クイズの答え合わせ結果からコミュニケーション情報を抽出・蓄積
 * 
 * 例: 「田中君は2時間後のランチで何を食べる？」→ 正解「ラーメン」
 * → person: 田中, category: lunch, attribute: food, value: ラーメン
 * 
 * 同じパターンが複数回出現 → 洞察を生成
 * → 「田中さんはラーメンをよく食べます。一緒にラーメン行きませんか？」
 */

/**
 * 問題から人物とカテゴリを抽出（AI使用）
 */
async function extractPersonAndCategory(
  questionText: string,
  actualValue: string,
  env: Bindings
): Promise<{
  personName: string | null
  category: string
  attribute: string
  conversationHints: string[]
}> {
  const apiKey = env.OPENAI_API_KEY
  const baseURL = env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
  
  // APIキーがない場合は簡易解析
  if (!apiKey) {
    return simpleExtraction(questionText, actualValue)
  }
  
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `あなたは日本語のクイズ問題から人物情報を抽出するアシスタントです。
以下の情報をJSON形式で抽出してください：
- personName: 問題に登場する人物の名前（なければnull）
- category: カテゴリ（lunch, hobby, schedule, preference, habit, work, personality）
- attribute: 属性（food, time, place, activity, item, etc.）
- conversationHints: この情報を元にした会話のきっかけ例（3つ程度）

必ずJSON形式で出力してください。`
          },
          {
            role: 'user',
            content: `問題: ${questionText}\n実際の答え: ${actualValue}`
          }
        ],
        temperature: 0.3
      })
    })
    
    if (!response.ok) {
      console.error('OpenAI API Error')
      return simpleExtraction(questionText, actualValue)
    }
    
    const data = await response.json() as any
    const content = data.choices[0]?.message?.content || ''
    
    // JSONを抽出
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').trim()
    }
    
    const parsed = JSON.parse(jsonContent)
    return {
      personName: parsed.personName || null,
      category: parsed.category || 'other',
      attribute: parsed.attribute || 'value',
      conversationHints: parsed.conversationHints || []
    }
  } catch (error) {
    console.error('AI Extraction Error:', error)
    return simpleExtraction(questionText, actualValue)
  }
}

/**
 * 簡易的な抽出（AI不使用時のフォールバック）
 */
function simpleExtraction(questionText: string, actualValue: string): {
  personName: string | null
  category: string
  attribute: string
  conversationHints: string[]
} {
  // 人物名を抽出（「〇〇君」「〇〇さん」パターン）
  const personMatch = questionText.match(/([^\s「」（）]{1,10})(君|さん|氏|部長|課長|社長)/)?.[1]
  
  // カテゴリを推測
  let category = 'other'
  let attribute = 'value'
  
  if (questionText.includes('ランチ') || questionText.includes('昼食') || questionText.includes('食べ')) {
    category = 'lunch'
    attribute = 'food'
  } else if (questionText.includes('趣味') || questionText.includes('好き')) {
    category = 'hobby'
    attribute = 'interest'
  } else if (questionText.includes('時') || questionText.includes('いつ')) {
    category = 'schedule'
    attribute = 'time'
  } else if (questionText.includes('飲み物') || questionText.includes('飲む')) {
    category = 'preference'
    attribute = 'drink'
  }
  
  // 会話のヒントを生成
  const hints = []
  if (personMatch && actualValue) {
    if (category === 'lunch') {
      hints.push(`${personMatch}さん、${actualValue}好きなんですね！オススメの店ありますか？`)
      hints.push(`今度一緒に${actualValue}食べに行きませんか？`)
      hints.push(`${actualValue}といえば、どこがお気に入りですか？`)
    } else {
      hints.push(`${personMatch}さんって${actualValue}なんですね！`)
      hints.push(`${actualValue}について教えてください！`)
    }
  }
  
  return {
    personName: personMatch || null,
    category,
    attribute,
    conversationHints: hints
  }
}

/**
 * 人物プロフィールの取得または作成
 */
async function getOrCreatePerson(DB: D1Database, name: string, department?: string): Promise<number> {
  // 既存の人物を検索
  const existing = await DB.prepare(`
    SELECT id FROM person_profiles WHERE name = ? AND (department = ? OR department IS NULL)
  `).bind(name, department || null).first()
  
  if (existing) {
    return existing.id as number
  }
  
  // 新規作成
  const result = await DB.prepare(`
    INSERT INTO person_profiles (name, department) VALUES (?, ?)
  `).bind(name, department || null).run()
  
  return result.meta.last_row_id as number
}

/**
 * 特性を記録（同じ値の場合はカウント増加）
 */
async function recordTrait(
  DB: D1Database,
  personId: number,
  category: string,
  attribute: string,
  value: string,
  questionId: number
): Promise<{ isNew: boolean; count: number }> {
  // 既存の特性を検索
  const existing = await DB.prepare(`
    SELECT id, occurrence_count FROM person_traits
    WHERE person_id = ? AND category = ? AND attribute = ? AND value = ?
  `).bind(personId, category, attribute, value).first()
  
  if (existing) {
    // カウント増加
    const newCount = (existing.occurrence_count as number) + 1
    await DB.prepare(`
      UPDATE person_traits
      SET occurrence_count = ?, last_observed_at = datetime('now')
      WHERE id = ?
    `).bind(newCount, existing.id).run()
    
    return { isNew: false, count: newCount }
  }
  
  // 新規作成
  await DB.prepare(`
    INSERT INTO person_traits (person_id, category, attribute, value, source_question_id)
    VALUES (?, ?, ?, ?, ?)
  `).bind(personId, category, attribute, value, questionId).run()
  
  return { isNew: true, count: 1 }
}

/**
 * 洞察を生成または更新
 * 同じ値が複数回（2回以上）出現した場合、パターンとして洞察を生成
 */
async function updateInsights(
  DB: D1Database,
  personId: number,
  category: string,
  value: string,
  count: number,
  conversationHints: string[]
): Promise<void> {
  // 人物名を取得
  const person = await DB.prepare(`
    SELECT name FROM person_profiles WHERE id = ?
  `).bind(personId).first()
  const personName = person?.name || '不明'
  
  // カテゴリに応じたタイトルと説明を生成
  let title = ''
  let description = ''
  let insightType = 'pattern'
  
  if (category === 'lunch') {
    title = `${value}好き`
    description = `${personName}さんはランチで${value}をよく食べます（${count}回確認）`
    insightType = 'conversation_starter'
  } else if (category === 'hobby') {
    title = `趣味: ${value}`
    description = `${personName}さんの趣味は${value}のようです（${count}回確認）`
    insightType = 'shared_interest'
  } else if (category === 'preference') {
    title = `${value}派`
    description = `${personName}さんは${value}を好むようです（${count}回確認）`
    insightType = 'conversation_starter'
  } else {
    title = `${category}: ${value}`
    description = `${personName}さんは${value}に関連があります（${count}回確認）`
  }
  
  // 既存の洞察を検索
  const existingInsight = await DB.prepare(`
    SELECT id FROM person_insights
    WHERE person_id = ? AND title = ?
  `).bind(personId, title).first()
  
  const confidenceScore = Math.min(count / 5, 1) // 5回で信頼度100%
  const hintsJson = JSON.stringify(conversationHints)
  
  if (existingInsight) {
    // 更新
    await DB.prepare(`
      UPDATE person_insights
      SET description = ?, confidence_score = ?, trait_count = ?, 
          conversation_hints = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(description, confidenceScore, count, hintsJson, existingInsight.id).run()
  } else if (count >= 2) {
    // 2回以上で新規洞察を作成
    await DB.prepare(`
      INSERT INTO person_insights (person_id, insight_type, title, description, conversation_hints, confidence_score, trait_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(personId, insightType, title, description, hintsJson, confidenceScore, count).run()
  }
}

/**
 * 答え合わせ時にコミュニケーション情報を蓄積
 * POST /admin/api/communication/extract
 */
app.post('/admin/api/communication/extract', async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const { question_id, question_text, actual_value } = body
    
    // 人物とカテゴリを抽出
    const extraction = await extractPersonAndCategory(question_text, actual_value, c.env)
    
    if (!extraction.personName) {
      return c.json({
        success: true,
        message: '人物名を特定できませんでした',
        extracted: null
      })
    }
    
    // 人物プロフィールを取得または作成
    const personId = await getOrCreatePerson(DB, extraction.personName)
    
    // 問題と人物のマッピングを保存
    await DB.prepare(`
      INSERT OR IGNORE INTO question_person_mapping (question_id, person_id, extracted_category, extracted_attribute)
      VALUES (?, ?, ?, ?)
    `).bind(question_id, personId, extraction.category, extraction.attribute).run()
    
    // 特性を記録
    const traitResult = await recordTrait(
      DB,
      personId,
      extraction.category,
      extraction.attribute,
      actual_value,
      question_id
    )
    
    // 洞察を更新（パターンを検出）
    await updateInsights(
      DB,
      personId,
      extraction.category,
      actual_value,
      traitResult.count,
      extraction.conversationHints
    )
    
    return c.json({
      success: true,
      extracted: {
        personName: extraction.personName,
        personId,
        category: extraction.category,
        attribute: extraction.attribute,
        value: actual_value,
        isNewTrait: traitResult.isNew,
        occurrenceCount: traitResult.count,
        conversationHints: extraction.conversationHints
      }
    })
    
  } catch (error: any) {
    console.error('Communication Extract Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 人物一覧取得
 * GET /api/communication/persons
 */
app.get('/api/communication/persons', async (c) => {
  const { DB } = c.env
  
  try {
    const persons = await DB.prepare(`
      SELECT 
        pp.id,
        pp.name,
        pp.department,
        COUNT(DISTINCT pt.id) as trait_count,
        COUNT(DISTINCT pi.id) as insight_count
      FROM person_profiles pp
      LEFT JOIN person_traits pt ON pp.id = pt.person_id
      LEFT JOIN person_insights pi ON pp.id = pi.person_id
      GROUP BY pp.id
      ORDER BY insight_count DESC, trait_count DESC
    `).all()
    
    return c.json({ persons: persons.results })
    
  } catch (error: any) {
    console.error('Get Persons Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 人物プロフィール詳細取得
 * GET /api/communication/persons/:personId
 */
app.get('/api/communication/persons/:personId', async (c) => {
  const { DB } = c.env
  const personId = c.req.param('personId')
  
  try {
    // 人物基本情報
    const person = await DB.prepare(`
      SELECT * FROM person_profiles WHERE id = ?
    `).bind(personId).first()
    
    if (!person) {
      return c.json({ error: '人物が見つかりません' }, 404)
    }
    
    // 特性一覧
    const traits = await DB.prepare(`
      SELECT 
        category,
        attribute,
        value,
        occurrence_count,
        first_observed_at,
        last_observed_at
      FROM person_traits
      WHERE person_id = ?
      ORDER BY occurrence_count DESC
    `).bind(personId).all()
    
    // 洞察一覧
    const insights = await DB.prepare(`
      SELECT 
        insight_type,
        title,
        description,
        conversation_hints,
        confidence_score,
        trait_count
      FROM person_insights
      WHERE person_id = ?
      ORDER BY confidence_score DESC
    `).bind(personId).all()
    
    // 洞察のconversation_hintsをパース
    const parsedInsights = insights.results.map((insight: any) => ({
      ...insight,
      conversation_hints: insight.conversation_hints ? JSON.parse(insight.conversation_hints) : []
    }))
    
    return c.json({
      person,
      traits: traits.results,
      insights: parsedInsights
    })
    
  } catch (error: any) {
    console.error('Get Person Profile Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ユーザー向けナレッジ一覧取得
 * GET /api/knowledge
 */
app.get('/api/knowledge', async (c) => {
  const { DB } = c.env
  const category = c.req.query('category')
  
  try {
    let query = `
      SELECT 
        id, title, content, category, recognition_rate, value_score, status, created_at
      FROM knowledge_base
      WHERE status = 'published'
    `
    
    if (category) {
      query += ` AND category = '${category}'`
    }
    
    query += ` ORDER BY value_score DESC, recognition_rate DESC`
    
    const result = await DB.prepare(query).all()
    
    return c.json({ 
      success: true,
      knowledge: result.results 
    })
    
  } catch (error: any) {
    console.error('Get Knowledge Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ユーザー向けナレッジ詳細取得
 * GET /api/knowledge/:id
 */
app.get('/api/knowledge/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const knowledge = await DB.prepare(`
      SELECT * FROM knowledge_base WHERE id = ? AND status = 'published'
    `).bind(id).first()
    
    if (!knowledge) {
      return c.json({ error: 'ナレッジが見つかりません' }, 404)
    }
    
    return c.json({ 
      success: true,
      knowledge 
    })
    
  } catch (error: any) {
    console.error('Get Knowledge Detail Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ユーザー向けナレッジカテゴリ一覧取得
 * GET /api/knowledge/categories
 */
app.get('/api/knowledge-categories', async (c) => {
  const { DB } = c.env
  
  try {
    const result = await DB.prepare(`
      SELECT 
        category,
        COUNT(*) as count
      FROM knowledge_base
      WHERE status = 'published'
      GROUP BY category
      ORDER BY count DESC
    `).all()
    
    // カテゴリ名を日本語に変換
    const categoryLabels: { [key: string]: string } = {
      company_history: '社史',
      knowledge: '業務ナレッジ',
      communication: 'コミュニケーション',
      compliance: 'コンプライアンス'
    }
    
    const categories = result.results.map((cat: any) => ({
      id: cat.category,
      name: categoryLabels[cat.category] || cat.category,
      count: cat.count
    }))
    
    return c.json({ 
      success: true,
      categories 
    })
    
  } catch (error: any) {
    console.error('Get Knowledge Categories Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 会話のきっかけを取得（ランダム）
 * GET /api/communication/conversation-starters
 */
app.get('/api/communication/conversation-starters', async (c) => {
  const { DB } = c.env
  
  try {
    // 信頼度の高い洞察からランダムに取得
    const insights = await DB.prepare(`
      SELECT 
        pp.name as person_name,
        pi.title,
        pi.description,
        pi.conversation_hints,
        pi.confidence_score
      FROM person_insights pi
      JOIN person_profiles pp ON pi.person_id = pp.id
      WHERE pi.confidence_score >= 0.4
      ORDER BY RANDOM()
      LIMIT 5
    `).all()
    
    const starters = insights.results.map((insight: any) => {
      const hints = insight.conversation_hints ? JSON.parse(insight.conversation_hints) : []
      return {
        personName: insight.person_name,
        topic: insight.title,
        description: insight.description,
        suggestedOpener: hints[0] || `${insight.person_name}さんと${insight.title}について話してみましょう`,
        allHints: hints
      }
    })
    
    return c.json({ starters })
    
  } catch (error: any) {
    console.error('Get Conversation Starters Error:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default app
