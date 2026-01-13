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
                        <button onclick="showMyPage()" class="ml-4 text-sm text-indigo-600 hover:text-indigo-800">
                            <i class="fas fa-trophy mr-1"></i>
                            マイページ
                        </button>
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
                            <div class="bg-purple-50 p-3 rounded-lg mb-4">
                                <p class="text-sm text-purple-900 font-semibold mb-1">
                                    <i class="fas fa-lightbulb mr-1"></i>
                                    こんな問題を予測！
                                </p>
                                <p class="text-xs text-purple-700">
                                    「田中君は2時間後のランチで何を食べる？」<br/>
                                    「今日の営業チームの受注件数は？」
                                </p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-purple-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">未来の出来事を予測</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-purple-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">自信度(1〜5)も回答</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-purple-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">答え合わせ後にランキング表示</p>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-check-circle text-purple-500 mr-3 mt-1"></i>
                                <p class="text-gray-700">予測精度を分析</p>
                            </div>
                        </div>
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
        // クイズ○○後：イベント一覧へ
        showPredictionEventList();
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
        const allEvents = response.data.events || [];
        
        // quiz_type='async'のイベントを抽出
        const asyncEvents = allEvents.filter(e => e.quiz_type === 'async' || !e.quiz_type);
        
        if (asyncEvents.length === 0) {
            throw new Error('現在開催中のイベントはありません');
        }
        
        // 最初のイベントを表示
        const event = asyncEvents[0];
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

// ==================== 未来予測型クイズ（クイズ○○後） ====================

// 予測イベント一覧
async function showPredictionEventList() {
    showLoading();
    
    try {
        const response = await axios.get(`${API_BASE}/events/active`);
        const allEvents = response.data.events || [];
        
        // quiz_type='prediction'のイベントを抽出
        const predictionEvents = allEvents.filter(e => e.quiz_type === 'prediction' && e.is_active);
        
        if (predictionEvents.length === 0) {
            throw new Error('現在開催中の予測クイズはありません');
        }
        
        // 複数のイベント一覧を表示
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
                <div class="max-w-7xl mx-auto">
                    <!-- ヘッダー -->
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-crystal-ball text-purple-600 mr-3"></i>
                            予測クイズを選んでください
                        </h1>
                        <p class="text-gray-600 text-lg">未来を予測して、あなたの直感力を試そう！</p>
                        <div class="mt-4">
                            <span class="bg-white px-4 py-2 rounded-full text-sm text-gray-700 shadow">
                                <i class="fas fa-user text-purple-600 mr-2"></i>
                                ${currentUser.name} さん
                            </span>
                            <button onclick="showQuizSelection()" class="ml-4 text-sm text-gray-600 hover:text-purple-600">
                                <i class="fas fa-arrow-left mr-1"></i>
                                クイズ選択に戻る
                            </button>
                            <button onclick="logout()" class="ml-4 text-sm text-red-600 hover:text-red-800">
                                <i class="fas fa-sign-out-alt mr-1"></i>
                                ログアウト
                            </button>
                        </div>
                    </div>
                    
                    <!-- イベントカード一覧 -->
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${predictionEvents.map((event, index) => {
                            const icons = ['🍜', '☀️', '📊', '☕', '⏰'];
                            const colors = ['indigo', 'yellow', 'red', 'green', 'blue'];
                            const icon = icons[index % icons.length];
                            const color = colors[index % colors.length];
                            
                            return `
                                <div 
                                    onclick="selectPredictionEvent(${event.id})"
                                    class="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 cursor-pointer border-2 border-transparent hover:border-${color}-500 transform hover:scale-105"
                                >
                                    <div class="text-center mb-4">
                                        <div class="text-6xl mb-3">${icon}</div>
                                        <h2 class="text-xl font-bold text-gray-800 mb-2">${event.name}</h2>
                                        <p class="text-sm text-gray-600 mb-4">${event.description}</p>
                                    </div>
                                    
                                    <div class="space-y-2 mb-4">
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-600">
                                                <i class="fas fa-question-circle text-${color}-500 mr-1"></i>
                                                問題数
                                            </span>
                                            <span class="font-semibold text-${color}-600">${event.questions_per_user || 3}問</span>
                                        </div>
                                        <div class="flex items-center justify-between text-sm">
                                            <span class="text-gray-600">
                                                <i class="fas fa-calendar text-${color}-500 mr-1"></i>
                                                期間
                                            </span>
                                            <span class="text-xs text-gray-500">
                                                ${new Date(event.end_date).toLocaleDateString('ja-JP')}まで
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button class="w-full bg-${color}-600 text-white py-3 rounded-lg font-semibold hover:bg-${color}-700 transition">
                                        <i class="fas fa-play mr-2"></i>
                                        このクイズに挑戦
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <i class="fas fa-crystal-ball text-6xl text-purple-300 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">現在開催中の予測クイズはありません</h2>
                    <p class="text-gray-600 mb-6">次回の予測クイズをお楽しみに！</p>
                    <button 
                        onclick="showQuizSelection()"
                        class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        クイズ選択に戻る
                    </button>
                </div>
            </div>
        `;
    }
}

// イベント選択
async function selectPredictionEvent(eventId) {
    try {
        const response = await axios.get(`${API_BASE}/events/active`);
        const allEvents = response.data.events || [];
        const event = allEvents.find(e => e.id === eventId);
        
        if (event) {
            currentEvent = event;
            showPredictionEventDetail(event);
        }
    } catch (error) {
        alert('イベントの読み込みに失敗しました');
    }
}

// 予測イベント詳細
async function showPredictionEventDetail(event) {
    const userId = currentUser.user_id;
    
    // 参加状態を確認
    try {
        const myPredictions = await axios.get(`${API_BASE}/prediction/events/${event.id}/my-predictions/${userId}`);
        
        if (myPredictions.data.predictions && myPredictions.data.predictions.length > 0) {
            // すでに予測済み：結果表示
            showPredictionResults(event, myPredictions.data.predictions);
            return;
        }
    } catch (error) {
        // 予測なし：新規参加
    }
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
            <div class="max-w-3xl mx-auto">
                <!-- ヘッダー -->
                <div class="mb-6">
                    <button 
                        onclick="showQuizSelection()"
                        class="text-purple-600 hover:text-purple-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        クイズ選択に戻る
                    </button>
                </div>
                
                <!-- イベントカード -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <i class="fas fa-crystal-ball text-6xl text-purple-500 mb-4"></i>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">${event.name}</h1>
                        <p class="text-gray-600">${event.description || ''}</p>
                        <div class="mt-4">
                            <span class="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                                <i class="fas fa-crystal-ball mr-2"></i>
                                未来予測型クイズ
                            </span>
                        </div>
                    </div>
                    
                    <!-- イベント情報 -->
                    <div class="grid md:grid-cols-2 gap-4 mb-8">
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-calendar text-purple-600 mr-2"></i>
                                <span class="font-semibold text-gray-700">予測期間</span>
                            </div>
                            <p class="text-sm text-gray-600">
                                ${new Date(event.start_date).toLocaleDateString('ja-JP')} 〜 
                                ${new Date(event.end_date).toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                        
                        <div class="bg-pink-50 p-4 rounded-lg">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-question-circle text-pink-600 mr-2"></i>
                                <span class="font-semibold text-gray-700">予測問題数</span>
                            </div>
                            <p class="text-sm text-gray-600">${event.questions_per_user || 5}問</p>
                        </div>
                    </div>
                    
                    <!-- 説明 -->
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                        <p class="text-sm text-yellow-800 mb-2">
                            <i class="fas fa-info-circle mr-2"></i>
                            <strong>未来予測型クイズとは？</strong>
                        </p>
                        <ul class="text-sm text-yellow-700 space-y-1 ml-6">
                            <li>• 未来の状態や結果を予測します</li>
                            <li>• 答えは指定日時に自動で判定されます</li>
                            <li>• 予測の自信度も入力してください（1-5）</li>
                            <li>• 予測精度ランキングも表示されます</li>
                        </ul>
                    </div>
                    
                    <!-- スタートボタン -->
                    <button 
                        onclick="startPredictionQuiz()"
                        class="w-full bg-purple-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition shadow-lg"
                    >
                        <i class="fas fa-crystal-ball mr-2"></i>
                        予測を開始する
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 予測クイズ開始
async function startPredictionQuiz() {
    const event = currentEvent;
    const userId = currentUser.user_id;
    
    try {
        showLoading();
        
        // 問題取得
        const response = await axios.get(`${API_BASE}/prediction/events/${event.id}/questions`);
        currentQuestions = response.data.questions;
        
        if (!currentQuestions || currentQuestions.length === 0) {
            throw new Error('問題が取得できませんでした');
        }
        
        // 予測画面表示
        userAnswers = [];
        showPredictionQuestionScreen(0);
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
        showPredictionEventDetail(event);
    }
}

// 予測問題画面
function showPredictionQuestionScreen(questionIndex) {
    if (questionIndex >= currentQuestions.length) {
        // 全問回答完了
        submitPredictions();
        return;
    }
    
    const question = currentQuestions[questionIndex];
    const progress = ((questionIndex + 1) / currentQuestions.length) * 100;
    const predictionDate = new Date(question.prediction_date);
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
            <div class="max-w-3xl mx-auto">
                <!-- プログレスバー -->
                <div class="mb-8">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>予測 ${questionIndex + 1} / ${currentQuestions.length}</span>
                        <span>${Math.round(progress)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-purple-600 h-3 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <!-- 問題カード -->
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <!-- 答え合わせ日時 -->
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                        <p class="text-sm text-purple-800">
                            <i class="fas fa-clock mr-2"></i>
                            <strong>答え合わせ日時：</strong> ${predictionDate.toLocaleString('ja-JP')}
                        </p>
                    </div>
                    
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        ${question.question_text}
                    </h2>
                    
                    <div class="space-y-4 mb-6">
                        ${['A', 'B', 'C', 'D'].map(option => `
                            <button 
                                onclick="selectPredictionAnswer('${option}', ${questionIndex})"
                                class="w-full text-left p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition prediction-option"
                                data-option="${option}"
                            >
                                <span class="font-bold text-purple-600 mr-3">${option}.</span>
                                <span class="text-gray-700">${question['option_' + option.toLowerCase()]}</span>
                            </button>
                        `).join('')}
                    </div>
                    
                    <!-- 自信度スライダー -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-chart-line text-purple-600 mr-2"></i>
                            予測の自信度（1-5）
                        </label>
                        <div class="flex items-center space-x-4">
                            <input 
                                type="range" 
                                id="confidenceSlider" 
                                min="1" 
                                max="5" 
                                value="3"
                                class="flex-1"
                            />
                            <span id="confidenceValue" class="text-2xl font-bold text-purple-600 w-12 text-center">3</span>
                        </div>
                        <div class="flex justify-between text-xs text-gray-500 mt-2">
                            <span>低い</span>
                            <span>普通</span>
                            <span>高い</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 自信度スライダーのイベント
    document.getElementById('confidenceSlider').addEventListener('input', (e) => {
        document.getElementById('confidenceValue').textContent = e.target.value;
    });
}

// 予測回答選択
let selectedPrediction = null;

function selectPredictionAnswer(answer, questionIndex) {
    selectedPrediction = answer;
    
    // ボタンの見た目を変更
    document.querySelectorAll('.prediction-option').forEach(btn => {
        btn.classList.remove('border-purple-500', 'bg-purple-50');
        if (btn.dataset.option === answer) {
            btn.classList.add('border-purple-500', 'bg-purple-50');
        }
    });
    
    // 確認ボタンを表示
    const question = currentQuestions[questionIndex];
    const confidence = document.getElementById('confidenceSlider').value;
    
    // 即座に次の問題へ（または確認モーダル）
    setTimeout(() => {
        userAnswers.push({
            question_id: question.id,
            predicted_answer: answer,
            confidence_level: parseInt(confidence)
        });
        
        // 次の問題へ
        showPredictionQuestionScreen(questionIndex + 1);
    }, 500);
}

// 予測送信
async function submitPredictions() {
    showLoading();
    
    try {
        const response = await axios.post(`${API_BASE}/prediction/events/${currentEvent.id}/submit`, {
            user_id: currentUser.user_id,
            predictions: userAnswers
        });
        
        // 完了画面へ
        showPredictionSubmitted();
        
    } catch (error) {
        alert('予測の送信に失敗しました: ' + (error.response?.data?.error || error.message));
    }
}

// 予測送信完了画面
function showPredictionSubmitted() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
            <div class="max-w-3xl mx-auto">
                <!-- 完了カード -->
                <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">予測完了！</h1>
                    <p class="text-gray-600 mb-8">予測を受け付けました</p>
                    
                    <!-- 情報 -->
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8 text-left">
                        <h3 class="font-bold text-purple-900 mb-3">
                            <i class="fas fa-info-circle mr-2"></i>
                            次のステップ
                        </h3>
                        <ul class="space-y-2 text-sm text-purple-800">
                            <li><i class="fas fa-check text-purple-600 mr-2"></i>予測を${userAnswers.length}問送信しました</li>
                            <li><i class="fas fa-clock text-purple-600 mr-2"></i>各問題の答え合わせ日時に自動で判定されます</li>
                            <li><i class="fas fa-bell text-purple-600 mr-2"></i>結果はマイページで確認できます</li>
                            <li><i class="fas fa-trophy text-purple-600 mr-2"></i>予測精度ランキングも更新されます</li>
                        </ul>
                    </div>
                    
                    <!-- スコア表示（仮） -->
                    <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-purple-50 p-6 rounded-xl">
                            <i class="fas fa-brain text-3xl text-purple-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">予測数</p>
                            <p class="text-3xl font-bold text-purple-600">${userAnswers.length}問</p>
                        </div>
                        
                        <div class="bg-pink-50 p-6 rounded-xl">
                            <i class="fas fa-chart-line text-3xl text-pink-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">平均自信度</p>
                            <p class="text-3xl font-bold text-pink-600">
                                ${(userAnswers.reduce((sum, a) => sum + a.confidence_level, 0) / userAnswers.length).toFixed(1)}/5
                            </p>
                        </div>
                    </div>
                    
                    <!-- ボタン -->
                    <div class="space-y-3">
                        <button 
                            onclick="showQuizSelection()"
                            class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
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

// 予測結果表示
function showPredictionResults(event, predictions) {
    const verified = predictions.filter(p => p.is_correct !== null);
    const pending = predictions.filter(p => p.is_correct === null);
    const correct = predictions.filter(p => p.is_correct === 1);
    const accuracy = verified.length > 0 ? Math.round((correct.length / verified.length) * 100) : 0;
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
            <div class="max-w-4xl mx-auto">
                <!-- ヘッダー -->
                <div class="mb-6">
                    <button 
                        onclick="showQuizSelection()"
                        class="text-purple-600 hover:text-purple-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        クイズ選択に戻る
                    </button>
                </div>
                
                <!-- 結果カード -->
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <div class="text-center mb-8">
                        <i class="fas fa-crystal-ball text-6xl text-purple-500 mb-4"></i>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">${event.name}</h1>
                        <p class="text-gray-600">あなたの予測結果</p>
                    </div>
                    
                    <!-- スコア -->
                    <div class="grid md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-blue-50 p-6 rounded-xl text-center">
                            <i class="fas fa-list text-3xl text-blue-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">総予測数</p>
                            <p class="text-3xl font-bold text-blue-600">${predictions.length}問</p>
                        </div>
                        
                        <div class="bg-green-50 p-6 rounded-xl text-center">
                            <i class="fas fa-check-circle text-3xl text-green-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">判定済み</p>
                            <p class="text-3xl font-bold text-green-600">${verified.length}問</p>
                        </div>
                        
                        <div class="bg-purple-50 p-6 rounded-xl text-center">
                            <i class="fas fa-percentage text-3xl text-purple-600 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">予測精度</p>
                            <p class="text-3xl font-bold text-purple-600">${accuracy}%</p>
                        </div>
                    </div>
                    
                    <!-- 予測一覧 -->
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-list mr-2"></i>
                        予測詳細
                    </h3>
                    
                    <div class="space-y-3">
                        ${predictions.map((p, i) => {
                            const statusIcon = p.is_correct === 1 ? 'fa-check-circle text-green-500' :
                                             p.is_correct === 0 ? 'fa-times-circle text-red-500' :
                                             'fa-clock text-gray-400';
                            const statusText = p.is_correct === 1 ? '正解' :
                                              p.is_correct === 0 ? '不正解' :
                                              '判定待ち';
                            const statusClass = p.is_correct === 1 ? 'bg-green-50 border-green-200' :
                                               p.is_correct === 0 ? 'bg-red-50 border-red-200' :
                                               'bg-gray-50 border-gray-200';
                            
                            return `
                                <div class="border-2 ${statusClass} rounded-lg p-4">
                                    <div class="flex items-start justify-between mb-2">
                                        <div class="flex-1">
                                            <p class="font-semibold text-gray-800">${i + 1}. ${p.question_text}</p>
                                            <p class="text-sm text-gray-600 mt-2">
                                                <span class="font-semibold">あなたの予測:</span> ${p.predicted_answer}
                                                ${p.actual_answer ? ` | <span class="font-semibold">正解:</span> ${p.actual_answer}` : ''}
                                            </p>
                                        </div>
                                        <div class="ml-4 text-center">
                                            <i class="fas ${statusIcon} text-2xl mb-1"></i>
                                            <p class="text-xs text-gray-600">${statusText}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
                                        <span>
                                            <i class="fas fa-chart-line mr-1"></i>
                                            自信度: ${p.confidence_level}/5
                                        </span>
                                        <span>
                                            <i class="fas fa-calendar mr-1"></i>
                                            ${p.verified_at ? new Date(p.verified_at).toLocaleDateString('ja-JP') : '判定日時: ' + new Date(p.prediction_date).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${pending.length > 0 ? `
                        <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                            <p class="text-sm text-yellow-800">
                                <i class="fas fa-clock mr-2"></i>
                                ${pending.length}問の答え合わせ待ちです。各問題の判定日時になると自動で結果が更新されます。
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ==================== マイページ（ゲーミフィケーション） ====================

// マイページ表示
async function showMyPage() {
    showLoading();
    
    try {
        const userId = currentUser.user_id;
        
        // ポイント情報取得
        const pointsRes = await axios.get(`${API_BASE}/gamification/users/${userId}/points`);
        const pointsData = pointsRes.data;
        
        // バッジ情報取得
        const badgesRes = await axios.get(`${API_BASE}/gamification/users/${userId}/badges`);
        const badgesData = badgesRes.data;
        
        // 統計情報取得
        const statsRes = await axios.get(`${API_BASE}/gamification/users/${userId}/statistics`);
        const statsData = statsRes.data;
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
                <div class="max-w-7xl mx-auto">
                    <!-- ヘッダー -->
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold text-gray-800">
                            <i class="fas fa-trophy text-yellow-500 mr-2"></i>
                            マイページ
                        </h1>
                        <button onclick="showQuizSelection()" class="text-gray-600 hover:text-indigo-600">
                            <i class="fas fa-arrow-left mr-2"></i>
                            クイズ選択に戻る
                        </button>
                    </div>
                    
                    <!-- ユーザー情報 -->
                    <div class="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <div class="flex items-center">
                            <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
                                <i class="fas fa-user text-indigo-600"></i>
                            </div>
                            <div class="ml-6">
                                <h2 class="text-2xl font-bold text-gray-800">${currentUser.name}</h2>
                                <p class="text-gray-600">ユーザーID: ${currentUser.user_id}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ポイントサマリー -->
                    <div class="grid md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">総合ポイント</div>
                            <div class="text-4xl font-bold">${pointsData.total_points}</div>
                            <div class="text-sm opacity-90 mt-2">
                                <i class="fas fa-star mr-1"></i>
                                累計獲得
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-xl p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">週間ポイント</div>
                            <div class="text-4xl font-bold">${pointsData.weekly_points}</div>
                            <div class="text-sm opacity-90 mt-2">
                                <i class="fas fa-calendar-week mr-1"></i>
                                今週の獲得
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-xl p-6 text-white">
                            <div class="text-sm opacity-90 mb-2">月間ポイント</div>
                            <div class="text-4xl font-bold">${pointsData.monthly_points}</div>
                            <div class="text-sm opacity-90 mt-2">
                                <i class="fas fa-calendar-alt mr-1"></i>
                                今月の獲得
                            </div>
                        </div>
                    </div>
                    
                    <!-- 統計情報 -->
                    <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-indigo-600 mr-2"></i>
                            あなたの予測統計
                        </h3>
                        <div class="grid md:grid-cols-4 gap-4">
                            <div class="text-center p-4 bg-indigo-50 rounded-lg">
                                <div class="text-2xl font-bold text-indigo-600">${statsData.total_predictions}</div>
                                <div class="text-sm text-gray-600 mt-1">総予測回数</div>
                            </div>
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">${statsData.total_correct}</div>
                                <div class="text-sm text-gray-600 mt-1">正解数</div>
                            </div>
                            <div class="text-center p-4 bg-yellow-50 rounded-lg">
                                <div class="text-2xl font-bold text-yellow-600">${statsData.accuracy_rate}%</div>
                                <div class="text-sm text-gray-600 mt-1">正答率</div>
                            </div>
                            <div class="text-center p-4 bg-red-50 rounded-lg">
                                <div class="text-2xl font-bold text-red-600">${statsData.max_streak}</div>
                                <div class="text-sm text-gray-600 mt-1">最高連続正解</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- バッジコレクション -->
                    <div class="bg-white rounded-2xl shadow-xl p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-medal text-yellow-500 mr-2"></i>
                            獲得バッジ (${badgesData.earned_count} / ${badgesData.total_count})
                        </h3>
                        
                        ${badgesData.earned.length > 0 ? `
                            <div class="grid md:grid-cols-3 gap-4 mb-6">
                                ${badgesData.earned.map(badge => `
                                    <div class="p-4 border-2 border-yellow-400 bg-yellow-50 rounded-lg text-center">
                                        <div class="text-4xl mb-2">${badge.icon}</div>
                                        <div class="font-bold text-gray-800">${badge.name}</div>
                                        <div class="text-xs text-gray-600 mt-1">${badge.description}</div>
                                        <div class="text-xs text-gray-500 mt-2">
                                            獲得日: ${new Date(badge.earned_at).toLocaleDateString('ja-JP')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-gray-500 text-center py-8">まだバッジを獲得していません</p>
                        `}
                        
                        <h4 class="text-lg font-semibold text-gray-700 mb-3 mt-6">未獲得バッジ</h4>
                        <div class="grid md:grid-cols-4 gap-3">
                            ${badgesData.all.filter(b => !badgesData.earned.find(e => e.id === b.id)).map(badge => `
                                <div class="p-3 border-2 border-gray-200 bg-gray-50 rounded-lg text-center opacity-60">
                                    <div class="text-3xl mb-1 grayscale">${badge.icon}</div>
                                    <div class="text-sm font-semibold text-gray-600">${badge.name}</div>
                                    <div class="text-xs text-gray-500 mt-1">${badge.description}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('MyPage Error:', error);
        alert('マイページの読み込みに失敗しました');
        showQuizSelection();
    }
}
