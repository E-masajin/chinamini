const API_BASE = '/api';
let currentUser = null;
let currentQuizType = null; // 'async' or 'prediction'
let currentEvent = null;
let currentQuestions = [];
let userAnswers = [];
let startTime = null;

// ==================== ローディング表示 ====================
function showLoading() {
    document.getElementById('app').innerHTML = `
        <div class="flex items-center justify-center h-64">
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
                <p class="text-gray-600">読み込み中...</p>
            </div>
        </div>
    `;
}

// ==================== ログイン画面 ====================
function showLoginScreen() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <div class="text-center mb-8">
                    <i class="fas fa-brain text-6xl text-indigo-600 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">クイズプラットフォーム</h1>
                    <p class="text-gray-600">企業向け学習システム</p>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-id-badge mr-2 text-indigo-600"></i>
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
                            <i class="fas fa-user mr-2 text-indigo-600"></i>
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
                        class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md"
                    >
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        ログイン
                    </button>
                </div>
                
                <div id="loginError" class="mt-4 text-red-600 text-sm text-center hidden"></div>
                
                <div class="mt-6 text-center">
                    <a href="/admin" class="text-sm text-indigo-600 hover:text-indigo-800 transition">
                        <i class="fas fa-cog mr-1"></i>
                        管理者画面
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ログイン処理
async function handleLogin() {
    const userId = document.getElementById('userId').value.trim();
    const userName = document.getElementById('userName').value.trim() || 'ゲスト';
    const errorDiv = document.getElementById('loginError');
    
    if (!userId) {
        errorDiv.textContent = 'ユーザーIDを入力してください';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    // ユーザー情報を保存
    currentUser = {
        user_id: userId,
        name: userName
    };
    
    // クイズ選択画面へ
    showQuizSelection();
}

// ==================== クイズ選択画面 ====================
function showQuizSelection() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div class="max-w-6xl mx-auto">
                <!-- ヘッダー -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-brain text-indigo-600 mr-3"></i>
                        クイズを選択してください
                    </h1>
                    <p class="text-gray-600 text-lg">あなたに最適な学習方法を選んでください</p>
                    <div class="mt-4">
                        <span class="bg-white px-4 py-2 rounded-full text-sm text-gray-700 shadow">
                            <i class="fas fa-user text-indigo-600 mr-2"></i>
                            ${currentUser.name} さん
                        </span>
                        <button onclick="logout()" class="ml-4 text-sm text-red-600 hover:text-red-800">
                            <i class="fas fa-sign-out-alt mr-1"></i>
                            ログアウト
                        </button>
                    </div>
                </div>
                
                <!-- クイズカード -->
                <div class="grid md:grid-cols-2 gap-8">
                    <!-- いつでもクイズ -->
                    <div 
                        onclick="selectQuizType('async')"
                        class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-500 transform hover:scale-105"
                    >
                        <div class="text-center mb-6">
                            <div class="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-clock text-5xl text-indigo-600"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">いつでもクイズ</h2>
                            <p class="text-sm text-indigo-600 font-semibold">非同期参加型</p>
                        </div>
                        
                        <div class="space-y-3 mb-6">
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">期間内ならいつでも参加可能</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">1回のみ回答可能</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">個人戦・チーム戦・企業戦対応</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">カンニング対策済み</p>
                            </div>
                        </div>
                        
                        <button class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                            <i class="fas fa-play mr-2"></i>
                            このクイズを選ぶ
                        </button>
                    </div>
                    
                    <!-- クイズ○○後 -->
                    <div 
                        onclick="selectQuizType('prediction')"
                        class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500 transform hover:scale-105"
                    >
                        <div class="text-center mb-6">
                            <div class="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-crystal-ball text-5xl text-purple-600"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">クイズ○○後</h2>
                            <p class="text-sm text-purple-600 font-semibold">未来予測型</p>
                        </div>
                        
                        <div class="space-y-3 mb-6">
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">未来の状態を予測</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">答えは後日自動で判定</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">天気・株価・スポーツなど</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">予測力を磨く</p>
                            </div>
                        </div>
                        
                        <button class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                            <i class="fas fa-play mr-2"></i>
                            このクイズを選ぶ
                        </button>
                        
                        <div class="mt-3 text-center">
                            <span class="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                                <i class="fas fa-flask mr-1"></i>
                                準備中
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="text-center mt-8">
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-info-circle mr-1"></i>
                        クイズ形式によって楽しみ方が異なります
                    </p>
                </div>
            </div>
        </div>
    `;
}

// クイズタイプ選択
async function selectQuizType(quizType) {
    currentQuizType = quizType;
    
    if (quizType === 'async') {
        // いつでもクイズ：イベント一覧へ
        showAsyncEventList();
    } else if (quizType === 'prediction') {
        // クイズ○○後：準備中メッセージ
        alert('🚧 クイズ○○後は現在準備中です。\nもうしばらくお待ちください！');
    }
}

// ログアウト
function logout() {
    if (confirm('ログアウトしますか？')) {
        currentUser = null;
        currentQuizType = null;
        currentEvent = null;
        currentQuestions = [];
        userAnswers = [];
        startTime = null;
        showLoginScreen();
    }
}

// ==================== いつでもクイズ：イベント一覧 ====================
async function showAsyncEventList() {
    showLoading();
    
    try {
        const response = await axios.get(`${API_BASE}/events/active`);
        const event = response.data;
        
        // イベントが見つかったら詳細表示
        currentEvent = event;
        showEventDetail(event);
        
    } catch (error) {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <i class="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">現在開催中のイベントはありません</h2>
                    <p class="text-gray-600 mb-6">次回のイベントをお楽しみに！</p>
                    <button 
                        onclick="showQuizSelection()"
                        class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        クイズ選択に戻る
                    </button>
                </div>
            </div>
        `;
    }
}

// イベント詳細画面
async function showEventDetail(event) {
    const userId = currentUser.user_id;
    
    // 参加状態を確認
    try {
        const statusResponse = await axios.get(`${API_BASE}/events/${event.id}/status/${userId}`);
        const status = statusResponse.data;
        
        if (status.has_participated) {
            // すでに参加済み：結果表示
            showResult(event, status);
            return;
        }
    } catch (error) {
        // ステータスがない場合は新規参加
    }
    
    // モード別の追加情報を取得
    let modeInfoHtml = '';
    if (event.mode === 'team' || event.mode === 'company') {
        modeInfoHtml = `
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p class="text-sm text-yellow-800">
                    <i class="fas fa-info-circle mr-2"></i>
                    ${event.mode === 'team' ? 'チーム戦モード：チーム名を入力してください' : '企業戦モード：企業名を入力してください'}
                </p>
            </div>
        `;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div class="max-w-3xl mx-auto">
                <!-- ヘッダー -->
                <div class="mb-6">
                    <button 
                        onclick="showQuizSelection()"
                        class="text-indigo-600 hover:text-indigo-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        クイズ選択に戻る
                    </button>
                </div>
                
                <!-- イベントカード -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <i class="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">${event.name}</h1>
                        <p class="text-gray-600">${event.description || ''}</p>
                    </div>
                    
                    <!-- イベント情報 -->
                    <div class="grid md:grid-cols-2 gap-4 mb-8">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-calendar text-blue-600 mr-2"></i>
                                <span class="font-semibold text-gray-700">開催期間</span>
                            </div>
                            <p class="text-sm text-gray-600">
                                ${new Date(event.start_date).toLocaleDateString('ja-JP')} 〜 
                                ${new Date(event.end_date).toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-question-circle text-green-600 mr-2"></i>
                                <span class="font-semibold text-gray-700">問題数</span>
                            </div>
                            <p class="text-sm text-gray-600">${event.questions_per_user}問</p>
                        </div>
                        
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-gamepad text-purple-600 mr-2"></i>
                                <span class="font-semibold text-gray-700">モード</span>
                            </div>
                            <p class="text-sm text-gray-600">
                                ${event.mode === 'individual' ? '個人戦' : event.mode === 'team' ? 'チーム戦' : '企業戦'}
                            </p>
                        </div>
                        
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-users text-yellow-600 mr-2"></i>
                                <span class="font-semibold text-gray-700">最低参加人数</span>
                            </div>
                            <p class="text-sm text-gray-600">${event.min_participants}人</p>
                        </div>
                    </div>
                    
                    ${modeInfoHtml}
                    
                    <!-- モード別フィールド -->
                    <div id="modeFields" class="space-y-4 mb-6"></div>
                    
                    <!-- スタートボタン -->
                    <button 
                        onclick="startQuiz()"
                        class="w-full bg-indigo-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
                    >
                        <i class="fas fa-play-circle mr-2"></i>
                        クイズを開始する
                    </button>
                    
                    <div id="startError" class="mt-4 text-red-600 text-sm text-center hidden"></div>
                </div>
            </div>
        </div>
    `;
    
    // モード別フィールドを追加
    const modeFields = document.getElementById('modeFields');
    if (event.mode === 'team') {
        modeFields.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-users text-indigo-600 mr-2"></i>
                    チーム名
                </label>
                <input 
                    type="text" 
                    id="teamName" 
                    placeholder="例: マーケティングチーム"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        `;
    } else if (event.mode === 'company') {
        modeFields.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-building text-indigo-600 mr-2"></i>
                    企業名
                </label>
                <input 
                    type="text" 
                    id="companyName" 
                    placeholder="例: ○○株式会社"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        `;
    }
}

// クイズ開始
async function startQuiz() {
    const errorDiv = document.getElementById('startError');
    const event = currentEvent;
    const userId = currentUser.user_id;
    const userName = currentUser.name;
    
    let teamName = null;
    let companyName = null;
    
    if (event.mode === 'team') {
        teamName = document.getElementById('teamName')?.value.trim();
        if (!teamName) {
            errorDiv.textContent = 'チーム名を入力してください';
            errorDiv.classList.remove('hidden');
            return;
        }
    } else if (event.mode === 'company') {
        companyName = document.getElementById('companyName')?.value.trim();
        if (!companyName) {
            errorDiv.textContent = '企業名を入力してください';
            errorDiv.classList.remove('hidden');
            return;
        }
    }
    
    try {
        showLoading();
        
        // 問題取得
        const response = await axios.get(`${API_BASE}/events/${event.id}/questions/${userId}`);
        currentQuestions = response.data.questions;
        
        if (!currentQuestions || currentQuestions.length === 0) {
            throw new Error('問題が取得できませんでした');
        }
        
        // 参加登録
        await axios.post(`${API_BASE}/events/${event.id}/participate`, {
            user_id: userId,
            name: userName,
            team_name: teamName,
            company_name: companyName
        });
        
        // クイズ画面表示
        startTime = Date.now();
        userAnswers = [];
        showQuizScreen(0);
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
        showEventDetail(event);
    }
}

// クイズ画面表示
function showQuizScreen(questionIndex) {
    if (questionIndex >= currentQuestions.length) {
        // 全問回答完了
        submitAnswers();
        return;
    }
    
    const question = currentQuestions[questionIndex];
    const progress = ((questionIndex + 1) / currentQuestions.length) * 100;
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div class="max-w-3xl mx-auto">
                <!-- プログレスバー -->
                <div class="mb-8">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>問題 ${questionIndex + 1} / ${currentQuestions.length}</span>
                        <span>${Math.round(progress)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-indigo-600 h-3 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <!-- 問題カード -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        ${question.question_text}
                    </h2>
                    
                    <div class="space-y-4">
                        ${['A', 'B', 'C', 'D'].map(option => `
                            <button 
                                onclick="selectAnswer('${option}', ${questionIndex})"
                                class="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
                            >
                                <span class="font-bold text-indigo-600 mr-3">${option}.</span>
                                <span class="text-gray-700">${question['option_' + option.toLowerCase()]}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 回答選択
function selectAnswer(answer, questionIndex) {
    const question = currentQuestions[questionIndex];
    
    userAnswers.push({
        question_id: question.id,
        user_answer: answer,
        answer_time: Date.now() - startTime
    });
    
    // 次の問題へ
    showQuizScreen(questionIndex + 1);
}

// 回答送信
async function submitAnswers() {
    showLoading();
    
    try {
        const totalTime = Math.floor((Date.now() - startTime) / 1000); // 秒単位
        
        const response = await axios.post(`${API_BASE}/events/${currentEvent.id}/submit`, {
            user_id: currentUser.user_id,
            answers: userAnswers,
            total_time: totalTime
        });
        
        // 結果画面へ
        showResult(currentEvent, response.data);
        
    } catch (error) {
        alert('回答の送信に失敗しました: ' + (error.response?.data?.error || error.message));
    }
}

// 結果画面
async function showResult(event, status) {
    const accuracy = status.questions_count > 0 
        ? Math.round((status.score / status.questions_count) * 100)
        : 0;
    
    // ランキング取得
    let rankHtml = '';
    try {
        const rankResponse = await axios.get(`${API_BASE}/events/${event.id}/ranking`);
        const rankings = rankResponse.data;
        
        if (rankings && rankings.length > 0) {
            rankHtml = `
                <div class="mt-8 bg-white rounded-xl p-6 shadow-md">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-ranking-star text-yellow-500 mr-2"></i>
                        ランキング
                    </h3>
                    <div class="space-y-2">
                        ${rankings.slice(0, 10).map((r, i) => `
                            <div class="flex items-center justify-between p-3 ${r.user_id === currentUser.user_id ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-gray-50'} rounded-lg">
                                <div class="flex items-center">
                                    <span class="text-2xl font-bold ${i < 3 ? 'text-yellow-500' : 'text-gray-400'} mr-3">
                                        ${i + 1}
                                    </span>
                                    <div>
                                        <p class="font-semibold text-gray-800">${r.name || r.user_id}</p>
                                        ${r.team_name ? `<p class="text-xs text-gray-500">${r.team_name}</p>` : ''}
                                        ${r.company_name ? `<p class="text-xs text-gray-500">${r.company_name}</p>` : ''}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-indigo-600">${r.score}点</p>
                                    <p class="text-xs text-gray-500">${r.answer_duration}秒</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('ランキング取得エラー:', error);
    }
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div class="max-w-3xl mx-auto">
                <!-- 結果カード -->
                <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">クイズ完了！</h1>
                    <p class="text-gray-600 mb-8">お疲れ様でした</p>
                    
                    <!-- スコア -->
                    <div class="grid md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-blue-50 p-6 rounded-xl">
                            <i class="fas fa-star text-3xl text-blue-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">スコア</p>
                            <p class="text-3xl font-bold text-blue-600">${status.score}点</p>
                        </div>
                        
                        <div class="bg-green-50 p-6 rounded-xl">
                            <i class="fas fa-percentage text-3xl text-green-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">正解率</p>
                            <p class="text-3xl font-bold text-green-600">${accuracy}%</p>
                        </div>
                        
                        <div class="bg-purple-50 p-6 rounded-xl">
                            <i class="fas fa-clock text-3xl text-purple-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">回答時間</p>
                            <p class="text-3xl font-bold text-purple-600">${status.answer_duration}秒</p>
                        </div>
                    </div>
                    
                    ${rankHtml}
                    
                    <!-- ボタン -->
                    <div class="mt-8 space-y-3">
                        <button 
                            onclick="showQuizSelection()"
                            class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            <i class="fas fa-home mr-2"></i>
                            クイズ選択に戻る
                        </button>
                        
                        <button 
                            onclick="logout()"
                            class="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                        >
                            <i class="fas fa-sign-out-alt mr-2"></i>
                            ログアウト
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 初期化
showLoginScreen();
