import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())

// ユーティリティ関数：IDから問題群を決定
function getPoolGroup(userId: string): number {
  // IDの末尾1文字を取得して数値化（0-9）
  const lastChar = userId.slice(-1)
  const num = parseInt(lastChar, 10)
  return isNaN(num) ? 0 : num
}

// API: アクティブなイベント取得
app.get('/api/events/active', async (c) => {
  const { DB } = c.env
  
  const result = await DB.prepare(`
    SELECT id, name, description, start_date, end_date, questions_per_user
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

// API: ユーザー認証・登録
app.post('/api/auth/login', async (c) => {
  const { DB } = c.env
  const { userId, name } = await c.req.json()

  if (!userId || userId.trim() === '') {
    return c.json({ error: 'ユーザーIDを入力してください' }, 400)
  }

  // ユーザー登録または取得
  await DB.prepare(`
    INSERT OR IGNORE INTO users (user_id, name)
    VALUES (?, ?)
  `).bind(userId, name || userId).run()

  // アクティブなイベント取得
  const event = await DB.prepare(`
    SELECT id, name, description, start_date, end_date, questions_per_user
    FROM events
    WHERE is_active = 1
      AND datetime('now') BETWEEN start_date AND end_date
    ORDER BY created_at DESC
    LIMIT 1
  `).first()

  if (!event) {
    return c.json({ error: 'アクティブなイベントがありません' }, 404)
  }

  // すでに回答済みかチェック
  const status = await DB.prepare(`
    SELECT has_completed, score, completed_at
    FROM user_event_status
    WHERE user_id = ? AND event_id = ?
  `).bind(userId, event.id).first()

  if (status && status.has_completed) {
    return c.json({
      userId,
      event,
      hasCompleted: true,
      score: status.score,
      completedAt: status.completed_at
    })
  }

  return c.json({
    userId,
    event,
    hasCompleted: false,
    poolGroup: getPoolGroup(userId)
  })
})

// API: 問題取得
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

  // 問題取得（指定された問題群から）
  const questions = await DB.prepare(`
    SELECT id, question_text, option_a, option_b, option_c, option_d
    FROM questions
    WHERE event_id = ? AND pool_group = ?
    ORDER BY RANDOM()
    LIMIT ?
  `).bind(eventId, poolGroup, event.questions_per_user).all()

  return c.json({
    questions: questions.results,
    poolGroup
  })
})

// API: 回答送信
app.post('/api/events/:eventId/submit', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const { userId, answers } = await c.req.json()

  if (!userId || !answers || !Array.isArray(answers)) {
    return c.json({ error: '不正なリクエストです' }, 400)
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

    // 回答記録を保存
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
    INSERT OR REPLACE INTO user_event_status (user_id, event_id, has_completed, score, completed_at)
    VALUES (?, ?, 1, ?, datetime('now'))
  `).bind(userId, eventId, correctCount).run()

  return c.json({
    score: correctCount,
    total: answers.length,
    results
  })
})

// API: ランキング取得
app.get('/api/events/:eventId/ranking', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')

  const ranking = await DB.prepare(`
    SELECT u.user_id, u.name, s.score, s.completed_at
    FROM user_event_status s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.event_id = ? AND s.has_completed = 1
    ORDER BY s.score DESC, s.completed_at ASC
    LIMIT 100
  `).bind(eventId).all()

  return c.json({
    ranking: ranking.results
  })
})

// API: ユーザーの結果取得
app.get('/api/events/:eventId/result/:userId', async (c) => {
  const { DB } = c.env
  const eventId = c.req.param('eventId')
  const userId = c.req.param('userId')

  const status = await DB.prepare(`
    SELECT score, completed_at
    FROM user_event_status
    WHERE user_id = ? AND event_id = ?
  `).bind(userId, eventId).first()

  if (!status) {
    return c.json({ error: '結果が見つかりません' }, 404)
  }

  // ランキング内の順位を取得
  const rankResult = await DB.prepare(`
    SELECT COUNT(*) + 1 as rank
    FROM user_event_status
    WHERE event_id = ? 
      AND (score > ? OR (score = ? AND completed_at < ?))
  `).bind(eventId, status.score, status.score, status.completed_at).first()

  return c.json({
    score: status.score,
    completedAt: status.completed_at,
    rank: rankResult?.rank || 1
  })
})

// ルートページ
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>いつでもクイズ（仮）</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div id="app" class="container mx-auto px-4 py-8 max-w-4xl">
            <!-- コンテンツは動的に生成 -->
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_BASE = '/api';
            let currentUser = null;
            let currentEvent = null;
            let currentQuestions = [];
            let userAnswers = [];

            // ローディング表示
            function showLoading() {
                document.getElementById('app').innerHTML = \`
                    <div class="flex items-center justify-center h-64">
                        <div class="text-center">
                            <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
                            <p class="text-gray-600">読み込み中...</p>
                        </div>
                    </div>
                \`;
            }

            // ログイン画面
            function showLoginScreen() {
                document.getElementById('app').innerHTML = \`
                    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto mt-16">
                        <div class="text-center mb-8">
                            <i class="fas fa-brain text-6xl text-indigo-600 mb-4"></i>
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">いつでもクイズ</h1>
                            <p class="text-gray-600">期間限定・1回のみ回答可能</p>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    ユーザーID（社員番号など）
                                </label>
                                <input 
                                    type="text" 
                                    id="userId" 
                                    placeholder="例: 00001"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    名前（任意）
                                </label>
                                <input 
                                    type="text" 
                                    id="userName" 
                                    placeholder="例: 山田太郎"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            <button 
                                onclick="handleLogin()"
                                class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                            >
                                <i class="fas fa-sign-in-alt mr-2"></i>
                                ログイン
                            </button>
                        </div>
                        
                        <div id="loginError" class="mt-4 text-red-600 text-sm text-center hidden"></div>
                    </div>
                \`;
            }

            // ログイン処理
            async function handleLogin() {
                const userId = document.getElementById('userId').value.trim();
                const userName = document.getElementById('userName').value.trim();
                const errorDiv = document.getElementById('loginError');

                if (!userId) {
                    errorDiv.textContent = 'ユーザーIDを入力してください';
                    errorDiv.classList.remove('hidden');
                    return;
                }

                showLoading();

                try {
                    const response = await axios.post(\`\${API_BASE}/auth/login\`, {
                        userId,
                        name: userName
                    });

                    currentUser = response.data.userId;
                    currentEvent = response.data.event;

                    if (response.data.hasCompleted) {
                        showResultScreen(response.data.score, currentEvent.questions_per_user);
                    } else {
                        showEventInfo(response.data.poolGroup);
                    }
                } catch (error) {
                    showLoginScreen();
                    errorDiv.textContent = error.response?.data?.error || 'エラーが発生しました';
                    errorDiv.classList.remove('hidden');
                }
            }

            // イベント情報表示
            function showEventInfo(poolGroup) {
                document.getElementById('app').innerHTML = \`
                    <div class="bg-white rounded-2xl shadow-xl p-8">
                        <div class="text-center mb-8">
                            <i class="fas fa-info-circle text-5xl text-indigo-600 mb-4"></i>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">\${currentEvent.name}</h2>
                            <p class="text-gray-600">\${currentEvent.description}</p>
                        </div>
                        
                        <div class="bg-indigo-50 rounded-lg p-6 mb-6">
                            <h3 class="font-semibold text-gray-800 mb-3">
                                <i class="fas fa-clipboard-list mr-2"></i>
                                クイズについて
                            </h3>
                            <ul class="space-y-2 text-gray-700">
                                <li><i class="fas fa-check text-green-600 mr-2"></i>問題数: <strong>\${currentEvent.questions_per_user}問</strong></li>
                                <li><i class="fas fa-check text-green-600 mr-2"></i>回答制限: <strong>1回のみ</strong></li>
                                <li><i class="fas fa-check text-green-600 mr-2"></i>あなたの問題群: <strong>グループ\${poolGroup}</strong></li>
                                <li><i class="fas fa-check text-orange-600 mr-2"></i>開始すると途中でやめられません</li>
                            </ul>
                        </div>
                        
                        <button 
                            onclick="startQuiz()"
                            class="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200"
                        >
                            <i class="fas fa-play-circle mr-2"></i>
                            クイズを開始
                        </button>
                    </div>
                \`;
            }

            // クイズ開始
            async function startQuiz() {
                showLoading();

                try {
                    const response = await axios.get(\`\${API_BASE}/events/\${currentEvent.id}/questions\`, {
                        params: { userId: currentUser }
                    });

                    currentQuestions = response.data.questions;
                    userAnswers = new Array(currentQuestions.length).fill(null);
                    showQuizScreen();
                } catch (error) {
                    alert(error.response?.data?.error || 'エラーが発生しました');
                    showEventInfo(0);
                }
            }

            // クイズ画面
            function showQuizScreen() {
                const questionsHtml = currentQuestions.map((q, index) => \`
                    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div class="flex items-start mb-4">
                            <span class="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                \${index + 1}
                            </span>
                            <h3 class="text-lg font-semibold text-gray-800">\${q.question_text}</h3>
                        </div>
                        
                        <div class="space-y-2 ml-11">
                            \${['A', 'B', 'C', 'D'].map(option => \`
                                <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition duration-150">
                                    <input 
                                        type="radio" 
                                        name="question_\${index}" 
                                        value="\${option}"
                                        onchange="setAnswer(\${index}, '\${option}')"
                                        class="mr-3 w-5 h-5 text-indigo-600"
                                    />
                                    <span class="font-medium text-gray-700 mr-2">\${option}.</span>
                                    <span class="text-gray-700">\${q['option_' + option.toLowerCase()]}</span>
                                </label>
                            \`).join('')}
                        </div>
                    </div>
                \`).join('');

                document.getElementById('app').innerHTML = \`
                    <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-question-circle text-indigo-600 mr-2"></i>
                            クイズに挑戦
                        </h2>
                        
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-gray-600">回答進捗</span>
                                <span class="text-sm font-medium text-indigo-600" id="progress">0/\${currentQuestions.length}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div id="progressBar" class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                        \${questionsHtml}
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-xl p-6 mt-6 sticky bottom-4">
                        <button 
                            onclick="submitAnswers()"
                            id="submitBtn"
                            class="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled
                        >
                            <i class="fas fa-paper-plane mr-2"></i>
                            回答を送信
                        </button>
                        <p class="text-center text-sm text-gray-500 mt-2">
                            すべての問題に回答してください
                        </p>
                    </div>
                \`;
            }

            // 回答設定
            function setAnswer(index, answer) {
                userAnswers[index] = answer;
                updateProgress();
            }

            // 進捗更新
            function updateProgress() {
                const answeredCount = userAnswers.filter(a => a !== null).length;
                const total = currentQuestions.length;
                const percentage = (answeredCount / total) * 100;

                document.getElementById('progress').textContent = \`\${answeredCount}/\${total}\`;
                document.getElementById('progressBar').style.width = \`\${percentage}%\`;

                const submitBtn = document.getElementById('submitBtn');
                if (answeredCount === total) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
                }
            }

            // 回答送信
            async function submitAnswers() {
                if (!confirm('回答を送信します。よろしいですか？\\n送信後は変更できません。')) {
                    return;
                }

                showLoading();

                const answers = currentQuestions.map((q, index) => ({
                    questionId: q.id,
                    userAnswer: userAnswers[index]
                }));

                try {
                    const response = await axios.post(\`\${API_BASE}/events/\${currentEvent.id}/submit\`, {
                        userId: currentUser,
                        answers
                    });

                    showResultScreen(response.data.score, response.data.total, response.data.results);
                } catch (error) {
                    alert(error.response?.data?.error || 'エラーが発生しました');
                    showQuizScreen();
                }
            }

            // 結果画面
            async function showResultScreen(score, total, results = null) {
                const percentage = Math.round((score / total) * 100);
                
                let rankHtml = '';
                try {
                    const rankResponse = await axios.get(\`\${API_BASE}/events/\${currentEvent.id}/result/\${currentUser}\`);
                    rankHtml = \`
                        <div class="bg-yellow-50 rounded-lg p-4 mb-6">
                            <div class="flex items-center justify-center">
                                <i class="fas fa-trophy text-yellow-500 text-3xl mr-3"></i>
                                <div>
                                    <p class="text-sm text-gray-600">現在の順位</p>
                                    <p class="text-2xl font-bold text-gray-800">\${rankResponse.data.rank}位</p>
                                </div>
                            </div>
                        </div>
                    \`;
                } catch (error) {
                    console.error('Failed to fetch rank:', error);
                }

                let detailsHtml = '';
                if (results) {
                    detailsHtml = \`
                        <div class="mt-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-list-check mr-2"></i>
                                回答詳細
                            </h3>
                            <div class="space-y-3">
                                \${results.map((r, index) => \`
                                    <div class="flex items-center p-3 rounded-lg \${r.isCorrect ? 'bg-green-50' : 'bg-red-50'}">
                                        <span class="font-bold mr-3">\${index + 1}.</span>
                                        <span class="mr-3">あなた: <strong>\${r.userAnswer}</strong></span>
                                        <span class="mr-3">正解: <strong>\${r.correctAnswer}</strong></span>
                                        <i class="fas \${r.isCorrect ? 'fa-circle-check text-green-600' : 'fa-circle-xmark text-red-600'} ml-auto"></i>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                    \`;
                }

                document.getElementById('app').innerHTML = \`
                    <div class="bg-white rounded-2xl shadow-xl p-8">
                        <div class="text-center mb-8">
                            <i class="fas fa-flag-checkered text-6xl text-indigo-600 mb-4"></i>
                            <h2 class="text-3xl font-bold text-gray-800 mb-2">お疲れ様でした！</h2>
                            <p class="text-gray-600">クイズが完了しました</p>
                        </div>
                        
                        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center mb-6">
                            <p class="text-lg mb-2">あなたのスコア</p>
                            <p class="text-6xl font-bold mb-2">\${score}<span class="text-3xl">/ \${total}</span></p>
                            <p class="text-2xl">\${percentage}%</p>
                        </div>
                        
                        \${rankHtml}
                        
                        \${detailsHtml}
                        
                        <button 
                            onclick="showRanking()"
                            class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 mt-6"
                        >
                            <i class="fas fa-ranking-star mr-2"></i>
                            ランキングを見る
                        </button>
                    </div>
                \`;
            }

            // ランキング表示
            async function showRanking() {
                showLoading();

                try {
                    const response = await axios.get(\`\${API_BASE}/events/\${currentEvent.id}/ranking\`);
                    const ranking = response.data.ranking;

                    const rankingHtml = ranking.map((user, index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                        const isCurrentUser = user.user_id === currentUser;
                        
                        return \`
                            <div class="flex items-center p-4 rounded-lg \${isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-gray-50'} mb-3">
                                <span class="text-2xl font-bold text-gray-800 w-12">\${medal || (index + 1)}</span>
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-800">\${user.name || user.user_id} \${isCurrentUser ? '(あなた)' : ''}</p>
                                    <p class="text-sm text-gray-500">\${new Date(user.completed_at).toLocaleString('ja-JP')}</p>
                                </div>
                                <span class="text-2xl font-bold text-indigo-600">\${user.score}点</span>
                            </div>
                        \`;
                    }).join('');

                    document.getElementById('app').innerHTML = \`
                        <div class="bg-white rounded-2xl shadow-xl p-8">
                            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                                <i class="fas fa-ranking-star text-yellow-500 mr-2"></i>
                                ランキング
                            </h2>
                            
                            <div class="mb-6">
                                \${rankingHtml || '<p class="text-gray-500 text-center">まだ参加者がいません</p>'}
                            </div>
                            
                            <button 
                                onclick="showLoginScreen()"
                                class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
                            >
                                <i class="fas fa-home mr-2"></i>
                                トップに戻る
                            </button>
                        </div>
                    \`;
                } catch (error) {
                    alert('ランキングの取得に失敗しました');
                }
            }

            // 初期化
            showLoginScreen();
        </script>
    </body>
    </html>
  `)
})

export default app
