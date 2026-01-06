// AI問題生成（ファイルアップロード対応）
app.post('/admin/api/ai/generate-questions', async (c) => {
  const { DB } = c.env
  
  try {
    const body = await c.req.json()
    const fileContent = body.file_content as string
    const fileName = body.file_name as string || 'uploaded_file'
    const category = body.category as string || 'knowledge'
    const count = parseInt(body.count as string || '10')
    const eventId = body.event_id
    const additionalPrompt = body.additional_prompt || ''
    
    if (!fileContent) {
      return c.json({ error: 'ファイルコンテンツが必要です' }, 400)
    }
    
    // OpenAI APIキー確認（環境変数から）
    const apiKey = c.env.OPENAI_API_KEY || ''
    const baseURL = c.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
    
    if (!apiKey) {
      return c.json({ 
        error: 'OpenAI APIキーが設定されていません。.dev.varsファイルまたは環境変数で設定してください。',
        setup_required: true
      }, 400)
    }
    
    // カテゴリ名を日本語に変換
    const categoryNames: Record<string, string> = {
      'company_history': '社史',
      'knowledge': 'ナレッジ',
      'people': '人物',
      'product': '製品知識',
      'compliance': 'コンプライアンス'
    }
    const categoryLabel = categoryNames[category] || category
    
    // プロンプト生成
    const prompt = `あなたは企業向けクイズの問題作成エキスパートです。

以下の社内資料から、${count}問の4択クイズを作成してください。

【カテゴリ】: ${categoryLabel}
${additionalPrompt ? `【追加の指示】: ${additionalPrompt}\n` : ''}

【社内資料】:
${fileContent.slice(0, 10000)} ${fileContent.length > 10000 ? '...(以下省略)' : ''}

【出力形式】:
JSON形式で、以下の構造で出力してください：

{
  "questions": [
    {
      "question_text": "問題文",
      "option_a": "選択肢A",
      "option_b": "選択肢B",
      "option_c": "選択肢C",
      "option_d": "選択肢D",
      "correct_answer": "A",
      "detailed_explanation": "この問題の背景や詳細な説明。150文字程度。",
      "pool_group": 0
    }
  ]
}

【重要な指示】:
1. 問題は資料の内容に基づいた事実のみを使用
2. 選択肢は明確に区別でき、紛らわしくないもの
3. 正解は資料から明確に判断できるもの
4. detailed_explanationには、問題の背景や覚えておくべきポイントを記載（150文字程度）
5. pool_groupは0〜9の数値をランダムに割り当て（問題群の振り分け用）
6. 必ずJSON形式のみを出力すること（マークダウンのコードブロックは不要）
7. 日本語で出力すること

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
          { 
            role: 'system', 
            content: 'あなたは企業向けクイズ問題を作成する専門家です。与えられた資料から、正確で質の高い4択問題を日本語で作成します。' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      return c.json({ 
        error: 'AI問題生成に失敗しました', 
        details: errorText,
        hint: 'APIキーが正しく設定されているか確認してください'
      }, 500)
    }
    
    const aiResponse = await response.json() as any
    const content = aiResponse.choices[0]?.message?.content || ''
    
    if (!content) {
      return c.json({ error: 'AIからの応答が空でした' }, 500)
    }
    
    // JSONを抽出（マークダウンコードブロックを除去）
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '').trim()
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').trim()
    }
    
    const generatedData = JSON.parse(jsonContent)
    
    if (!generatedData.questions || !Array.isArray(generatedData.questions)) {
      return c.json({ error: 'AIの応答形式が不正です', raw: jsonContent }, 500)
    }
    
    // 生成された問題にメタデータを追加
    const questions = generatedData.questions.map((q: any) => ({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      pool_group: q.pool_group !== undefined ? q.pool_group : Math.floor(Math.random() * 10),
      category: category,
      source_material: `${fileName}（AIで自動生成）`,
      detailed_explanation: q.detailed_explanation || ''
    }))
    
    return c.json({
      success: true,
      questions: questions,
      count: questions.length
    })
    
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return c.json({ 
      error: 'AI問題生成中にエラーが発生しました',
      details: error.message,
      stack: error.stack
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

// カテゴリ一覧取得
app.get('/admin/api/categories', async (c) => {
  const { DB } = c.env
  
  const categories = await DB.prepare(`
    SELECT * FROM question_categories ORDER BY id
  `).all()
  
  return c.json({ categories: categories.results })
})
