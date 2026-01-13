import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * AI柔軟判定：記入式回答を柔軟に評価
 * POST /admin/api/ai/verify-prediction
 */
app.post('/admin/api/ai/verify-prediction', async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const { question_id, actual_answer, user_answers } = body
    
    // OpenAI APIキー確認
    const apiKey = c.env.OPENAI_API_KEY || ''
    const baseURL = c.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
    
    if (!apiKey) {
      return c.json({ 
        error: 'OpenAI APIキーが設定されていません',
        setup_required: true
      }, 400)
    }
    
    // 問題情報を取得
    const question: any = await DB.prepare(`
      SELECT question_text FROM questions WHERE id = ?
    `).bind(question_id).first()
    
    if (!question) {
      return c.json({ error: '問題が見つかりません' }, 404)
    }
    
    // AIに柔軟判定を依頼
    const prompt = `あなたは予測クイズの採点者です。以下の問題と正解、ユーザーの回答を比較して、正誤を判定してください。

【問題】
${question.question_text}

【正解】
${actual_answer}

【ユーザーの回答一覧】
${user_answers.map((ua: any, i: number) => `${i + 1}. ${ua.predicted_answer}`).join('\n')}

【判定基準】
- 表記の揺れは許容（例: 「カレー」「カレーライス」「チキンカレー」）
- 時刻の表記揺れは許容（例: 「12:30」「12時30分」「午後0時半」）
- 数値は±5%以内なら正解
- 単位の有無は無視（例: 「800」「800円」）
- 大文字小文字は区別しない

【出力形式】
JSON形式で以下の構造で出力してください：

{
  "results": [
    {
      "user_id": "${user_answers[0]?.user_id || ''}",
      "predicted_answer": "ユーザーの回答",
      "is_correct": true,
      "reason": "判定理由（30文字以内）"
    }
  ]
}

それでは判定してください。`

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
            content: '予測クイズの採点者として、柔軟に回答を判定します。表記揺れや単位の違いは許容します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      return c.json({ 
        error: 'AI判定に失敗しました', 
        details: errorText
      }, 500)
    }
    
    const aiResponse = await response.json() as any
    const content = aiResponse.choices[0]?.message?.content || ''
    
    // JSONを抽出
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').trim()
    }
    
    const aiResults = JSON.parse(jsonContent)
    
    // 判定結果をデータベースに反映
    for (const result of aiResults.results) {
      const userAnswer = user_answers.find((ua: any) => 
        ua.predicted_answer === result.predicted_answer
      )
      
      if (userAnswer) {
        await DB.prepare(`
          UPDATE prediction_answers
          SET 
            actual_answer = ?,
            is_correct = ?,
            verified_at = datetime('now')
          WHERE user_id = ? AND question_id = ?
        `).bind(
          actual_answer,
          result.is_correct ? 1 : 0,
          userAnswer.user_id,
          question_id
        ).run()
      }
    }
    
    return c.json({
      success: true,
      results: aiResults.results,
      verified_count: aiResults.results.length
    })
    
  } catch (error: any) {
    console.error('AI Verify Error:', error)
    return c.json({ 
      error: 'AI判定中にエラーが発生しました',
      details: error.message
    }, 500)
  }
})

/**
 * AI問題生成（予測クイズ用）
 * POST /admin/api/ai/generate-prediction-questions
 */
app.post('/admin/api/ai/generate-prediction-questions', async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const { theme, count, event_id } = body
    
    // OpenAI APIキー確認
    const apiKey = c.env.OPENAI_API_KEY || ''
    const baseURL = c.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
    
    if (!apiKey) {
      return c.json({ 
        error: 'OpenAI APIキーが設定されていません',
        setup_required: true
      }, 400)
    }
    
    const prompt = `あなたは未来予測クイズの問題作成エキスパートです。

【テーマ】: ${theme}

以下の条件で、${count}問の予測問題を作成してください：

【条件】
1. 記入式（自由入力）の問題
2. 身近で予測可能な内容
3. 答えが客観的に確認できるもの
4. 予測期間：2時間〜24時間程度

【出力形式】
JSON形式で以下の構造で出力してください：

{
  "questions": [
    {
      "question_text": "問題文（記入式であることを明示）",
      "answer_type": "free_text",
      "pool_group": 1,
      "participation_deadline_hours": 2,
      "answer_reveal_hours": 4,
      "verification_source": "manual",
      "example_answer": "回答例"
    }
  ]
}

【例】
- 「田中さんは今日のランチで何を食べるでしょうか？（自由記入）」
- 「次の会議は何時に終了するでしょうか？（例: 14:30）」
- 「明日の東京の最高気温は何度でしょうか？（数字のみ）」

それでは、${count}問を作成してください。`

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
            content: '未来予測クイズの問題作成専門家として、身近で予測しやすい問題を日本語で作成します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      return c.json({ 
        error: 'AI問題生成に失敗しました', 
        details: errorText
      }, 500)
    }
    
    const aiResponse = await response.json() as any
    const content = aiResponse.choices[0]?.message?.content || ''
    
    // JSONを抽出
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').trim()
    }
    
    const generatedData = JSON.parse(jsonContent)
    
    return c.json({
      success: true,
      questions: generatedData.questions,
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

export default app
