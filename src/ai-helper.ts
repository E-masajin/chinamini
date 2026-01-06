import OpenAI from 'openai'
import fs from 'fs'
import yaml from 'js-yaml'
import os from 'os'
import path from 'path'

// OpenAI クライアントの初期化
export function getOpenAIClient(): OpenAI | null {
  try {
    // 1. 設定ファイルから読み込み
    const configPath = path.join(os.homedir(), '.genspark_llm.yaml')
    let config: any = null
    
    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8')
      config = yaml.load(fileContents) as any
    }
    
    // 2. 環境変数または設定ファイルからAPIキーを取得
    const apiKey = config?.openai?.api_key || process.env.OPENAI_API_KEY
    const baseURL = config?.openai?.base_url || process.env.OPENAI_BASE_URL
    
    if (!apiKey) {
      console.error('OpenAI API key not found. Please configure it in GenSpark.')
      return null
    }
    
    return new OpenAI({
      apiKey,
      baseURL: baseURL || 'https://www.genspark.ai/api/llm_proxy/v1',
    })
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error)
    return null
  }
}

// 問題生成プロンプト
export function generateQuestionPrompt(content: string, category: string, count: number): string {
  return `あなたは企業向けクイズの問題作成エキスパートです。

以下の社内資料から、${count}問の4択クイズを作成してください。

【カテゴリ】: ${category}

【社内資料】:
${content}

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
5. 必ずJSON形式で出力すること

それでは、${count}問を作成してください。`
}

// 深い知識追加プロンプト
export function generateDetailedKnowledgePrompt(
  questionText: string,
  correctAnswer: string,
  category: string,
  accuracyRate: number
): string {
  return `あなたは企業向け教育コンテンツの専門家です。

以下のクイズ問題について、従業員がより深く理解できるように詳細な知識を追加してください。

【問題】: ${questionText}
【正解】: ${correctAnswer}
【カテゴリ】: ${category}
【現在の認識度】: ${accuracyRate}%

${accuracyRate < 70 ? '※ 正解率が低いため、特に重要な知識として扱ってください。' : ''}

【出力内容】:
1. この問題の背景（200-300文字）
2. 覚えておくべき重要ポイント（箇条書き3-5点）
3. 実務での活用シーン（具体例）

【出力形式】:
\`\`\`json
{
  "title": "タイトル（30文字以内）",
  "background": "背景説明",
  "key_points": ["ポイント1", "ポイント2", "ポイント3"],
  "practical_use": "実務での活用シーン",
  "value_score": 1-5の整数（重要度）
}
\`\`\`

必ずJSON形式で出力してください。`
}
