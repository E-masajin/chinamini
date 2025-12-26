const API_BASE = '/api';
let currentUser = null;
let currentEvent = null;
let currentQuestions = [];
let userAnswers = [];
let startTime = null;

// ローディング表示
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

// ログイン画面
function showLoginScreen() {
    document.getElementById('app').innerHTML = `
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
                
                <div id="modeFields" class="hidden space-y-4"></div>
                
                <button 
                    onclick="checkEventAndProceed()"
                    class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                >
                    <i class="fas fa-sign-in-alt mr-2"></i>
                    次へ
                </button>
            </div>
            
            <div id="loginError" class="mt-4 text-red-600 text-sm text-center hidden"></div>
            
            <div class="mt-6 text-center">
                <a href="/admin" class="text-sm text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-cog mr-1"></i>
                    管理者画面
                </a>
            </div>
        </div>
    `;
}

// イベント確認してモード別フィールド表示
async function checkEventAndProceed() {
    const userId = document.getElementById('userId').value.trim();
    const errorDiv = document.getElementById('loginError');
    
    if (!userId) {
        errorDiv.textContent = 'ユーザーIDを入力してください';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    try {
        const response = await axios.get(`${API_BASE}/events/active`);
        const event = response.data;
        
        const modeFields = document.getElementById('modeFields');
        modeFields.innerHTML = '';
        
        if (event.mode === 'team') {
            modeFields.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-users text-indigo-600 mr-1"></i>
                        チーム名（必須）
                    </label>
                    <input 
                        type="text" 
                        id="teamName" 
                        placeholder="例: 営業部"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            `;
            modeFields.classList.remove('hidden');
            
            // ボタンをログイン処理に変更
            document.querySelector('button[onclick="checkEventAndProceed()"]').setAttribute('onclick', 'handleLogin()');
            document.querySelector('button[onclick="checkEventAndProceed()"]').innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>ログイン';
        } else if (event.mode === 'company') {
            modeFields.innerHTML = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        <i class="fas fa-building text-indigo-600 mr-1"></i>
                        企業名（必須）
                    </label>
                    <input 
                        type="text" 
                        id="companyName" 
                        placeholder="例: ABC株式会社"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            `;
            modeFields.classList.remove('hidden');
            
            // ボタンをログイン処理に変更
            document.querySelector('button[onclick="checkEventAndProceed()"]').setAttribute('onclick', 'handleLogin()');
            document.querySelector('button[onclick="checkEventAndProceed()"]').innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>ログイン';
        } else {
            // 個人戦の場合は直接ログイン
            handleLogin();
        }
    } catch (error) {
        errorDiv.textContent = error.response?.data?.error || 'エラーが発生しました';
        errorDiv.classList.remove('hidden');
    }
}

// ログイン処理
async function handleLogin() {
    const userId = document.getElementById('userId').value.trim();
    const userName = document.getElementById('userName').value.trim();
    const teamName = document.getElementById('teamName')?.value.trim() || null;
    const companyName = document.getElementById('companyName')?.value.trim() || null;
    const errorDiv = document.getElementById('loginError');

    if (!userId) {
        errorDiv.textContent = 'ユーザーIDを入力してください';
        errorDiv.classList.remove('hidden');
        return;
    }

    showLoading();

    try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
            userId,
            name: userName,
            teamName,
            companyName
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
    const modeText = currentEvent.mode === 'individual' ? '個人戦' : 
                     currentEvent.mode === 'team' ? 'チーム戦' : '企業戦';
    
    document.getElementById('app').innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
                <i class="fas fa-info-circle text-5xl text-indigo-600 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${currentEvent.name}</h2>
                <p class="text-gray-600">${currentEvent.description}</p>
                <span class="inline-block mt-2 px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                    ${modeText}
                </span>
            </div>
            
            <div class="bg-indigo-50 rounded-lg p-6 mb-6">
                <h3 class="font-semibold text-gray-800 mb-3">
                    <i class="fas fa-clipboard-list mr-2"></i>
                    クイズについて
                </h3>
                <ul class="space-y-2 text-gray-700">
                    <li><i class="fas fa-check text-green-600 mr-2"></i>問題数: <strong>${currentEvent.questions_per_user}問</strong></li>
                    <li><i class="fas fa-check text-green-600 mr-2"></i>回答制限: <strong>1回のみ</strong></li>
                    <li><i class="fas fa-check text-green-600 mr-2"></i>あなたの問題群: <strong>グループ${poolGroup}</strong></li>
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
    `;
}

// クイズ開始
async function startQuiz() {
    showLoading();

    try {
        const response = await axios.get(`${API_BASE}/events/${currentEvent.id}/questions`, {
            params: { userId: currentUser }
        });

        currentQuestions = response.data.questions;
        startTime = new Date(response.data.startTime);
        userAnswers = new Array(currentQuestions.length).fill(null);
        showQuizScreen();
    } catch (error) {
        alert(error.response?.data?.error || 'エラーが発生しました');
        showEventInfo(0);
    }
}

// クイズ画面（既存と同じ）
function showQuizScreen() {
    const questionsHtml = currentQuestions.map((q, index) => `
        <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <div class="flex items-start mb-4">
                <span class="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    ${index + 1}
                </span>
                <h3 class="text-lg font-semibold text-gray-800">${q.question_text}</h3>
            </div>
            
            <div class="space-y-2 ml-11">
                ${['A', 'B', 'C', 'D'].map(option => `
                    <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition duration-150">
                        <input 
                            type="radio" 
                            name="question_${index}" 
                            value="${option}"
                            onchange="setAnswer(${index}, '${option}')"
                            class="mr-3 w-5 h-5 text-indigo-600"
                        />
                        <span class="font-medium text-gray-700 mr-2">${option}.</span>
                        <span class="text-gray-700">${q['option_' + option.toLowerCase()]}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('app').innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-question-circle text-indigo-600 mr-2"></i>
                クイズに挑戦
            </h2>
            
            <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-600">回答進捗</span>
                    <span class="text-sm font-medium text-indigo-600" id="progress">0/${currentQuestions.length}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div id="progressBar" class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>
        </div>
        
        <div class="space-y-6">
            ${questionsHtml}
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
    `;
}

function setAnswer(index, answer) {
    userAnswers[index] = answer;
    updateProgress();
}

function updateProgress() {
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const total = currentQuestions.length;
    const percentage = (answeredCount / total) * 100;

    document.getElementById('progress').textContent = `${answeredCount}/${total}`;
    document.getElementById('progressBar').style.width = `${percentage}%`;

    const submitBtn = document.getElementById('submitBtn');
    if (answeredCount === total) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
    }
}

async function submitAnswers() {
    if (!confirm('回答を送信します。よろしいですか？\n送信後は変更できません。')) {
        return;
    }

    showLoading();

    const answers = currentQuestions.map((q, index) => ({
        questionId: q.id,
        userAnswer: userAnswers[index]
    }));

    try {
        const response = await axios.post(`${API_BASE}/events/${currentEvent.id}/submit`, {
            userId: currentUser,
            answers
        });

        showResultScreen(response.data.score, response.data.total, response.data.results, response.data.answerDuration);
    } catch (error) {
        alert(error.response?.data?.error || 'エラーが発生しました');
        showQuizScreen();
    }
}

async function showResultScreen(score, total, results = null, answerDuration = 0) {
    const percentage = Math.round((score / total) * 100);
    const minutes = Math.floor(answerDuration / 60);
    const seconds = answerDuration % 60;
    
    let rankHtml = '';
    try {
        const rankResponse = await axios.get(`${API_BASE}/events/${currentEvent.id}/result/${currentUser}`);
        rankHtml = `
            <div class="bg-yellow-50 rounded-lg p-4 mb-6">
                <div class="flex items-center justify-center">
                    <i class="fas fa-trophy text-yellow-500 text-3xl mr-3"></i>
                    <div>
                        <p class="text-sm text-gray-600">個人順位</p>
                        <p class="text-2xl font-bold text-gray-800">${rankResponse.data.rank}位</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to fetch rank:', error);
    }

    let detailsHtml = '';
    if (results) {
        detailsHtml = `
            <div class="mt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-list-check mr-2"></i>
                    回答詳細
                </h3>
                <div class="space-y-3">
                    ${results.map((r, index) => `
                        <div class="flex items-center p-3 rounded-lg ${r.isCorrect ? 'bg-green-50' : 'bg-red-50'}">
                            <span class="font-bold mr-3">${index + 1}.</span>
                            <span class="mr-3">あなた: <strong>${r.userAnswer}</strong></span>
                            <span class="mr-3">正解: <strong>${r.correctAnswer}</strong></span>
                            <i class="fas ${r.isCorrect ? 'fa-circle-check text-green-600' : 'fa-circle-xmark text-red-600'} ml-auto"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById('app').innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
                <i class="fas fa-flag-checkered text-6xl text-indigo-600 mb-4"></i>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">お疲れ様でした！</h2>
                <p class="text-gray-600">クイズが完了しました</p>
            </div>
            
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center mb-6">
                <p class="text-lg mb-2">あなたのスコア</p>
                <p class="text-6xl font-bold mb-2">${score}<span class="text-3xl">/ ${total}</span></p>
                <p class="text-2xl mb-4">${percentage}%</p>
                <p class="text-sm opacity-90">回答時間: ${minutes}分${seconds}秒</p>
            </div>
            
            ${rankHtml}
            
            ${detailsHtml}
            
            <button 
                onclick="showRanking()"
                class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 mt-6"
            >
                <i class="fas fa-ranking-star mr-2"></i>
                ランキングを見る
            </button>
        </div>
    `;
}

async function showRanking() {
    showLoading();

    try {
        const mode = currentEvent.mode;
        let rankingHtml = '';
        
        // 個人ランキング
        const individualResponse = await axios.get(`${API_BASE}/events/${currentEvent.id}/ranking/individual`);
        const individualRanking = individualResponse.data.ranking;
        
        rankingHtml += `
            <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-user text-indigo-600 mr-2"></i>
                    個人ランキング
                </h3>
                ${individualRanking.map((user, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    const isCurrentUser = user.user_id === currentUser;
                    const minutes = Math.floor(user.answer_duration / 60);
                    const seconds = user.answer_duration % 60;
                    
                    return `
                        <div class="flex items-center p-4 rounded-lg ${isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-gray-50'} mb-3">
                            <span class="text-2xl font-bold text-gray-800 w-12">${medal || (index + 1)}</span>
                            <div class="flex-1">
                                <p class="font-semibold text-gray-800">${user.name || user.user_id} ${isCurrentUser ? '(あなた)' : ''}</p>
                                <p class="text-sm text-gray-500">${minutes}分${seconds}秒 | ${new Date(user.completed_at).toLocaleString('ja-JP')}</p>
                            </div>
                            <span class="text-2xl font-bold text-indigo-600">${user.score}点</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // チーム/企業ランキング
        if (mode === 'team') {
            const teamResponse = await axios.get(`${API_BASE}/events/${currentEvent.id}/ranking/team`);
            const teamRanking = teamResponse.data.ranking;
            
            rankingHtml += `
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-users text-indigo-600 mr-2"></i>
                        チームランキング
                    </h3>
                    ${teamRanking.map((team, index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                        const avgMinutes = Math.floor(team.avg_duration / 60);
                        const avgSeconds = Math.floor(team.avg_duration % 60);
                        
                        return `
                            <div class="flex items-center p-4 rounded-lg bg-gray-50 mb-3">
                                <span class="text-2xl font-bold text-gray-800 w-12">${medal || (index + 1)}</span>
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-800">${team.team_name}</p>
                                    <p class="text-sm text-gray-500">メンバー: ${team.member_count}人 | 平均時間: ${avgMinutes}分${avgSeconds}秒</p>
                                </div>
                                <span class="text-2xl font-bold text-indigo-600">${Math.round(team.avg_accuracy)}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (mode === 'company') {
            const companyResponse = await axios.get(`${API_BASE}/events/${currentEvent.id}/ranking/company`);
            const companyRanking = companyResponse.data.ranking;
            
            rankingHtml += `
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-building text-indigo-600 mr-2"></i>
                        企業ランキング
                    </h3>
                    ${companyRanking.map((company, index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                        const avgMinutes = Math.floor(company.avg_duration / 60);
                        const avgSeconds = Math.floor(company.avg_duration % 60);
                        
                        return `
                            <div class="flex items-center p-4 rounded-lg bg-gray-50 mb-3">
                                <span class="text-2xl font-bold text-gray-800 w-12">${medal || (index + 1)}</span>
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-800">${company.company_name}</p>
                                    <p class="text-sm text-gray-500">メンバー: ${company.member_count}人 | 平均時間: ${avgMinutes}分${avgSeconds}秒</p>
                                </div>
                                <span class="text-2xl font-bold text-indigo-600">${Math.round(company.avg_accuracy)}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        document.getElementById('app').innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    <i class="fas fa-ranking-star text-yellow-500 mr-2"></i>
                    ランキング
                </h2>
                
                ${rankingHtml || '<p class="text-gray-500 text-center">まだ参加者がいません</p>'}
                
                <button 
                    onclick="showLoginScreen()"
                    class="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
                >
                    <i class="fas fa-home mr-2"></i>
                    トップに戻る
                </button>
            </div>
        `;
    } catch (error) {
        alert('ランキングの取得に失敗しました');
    }
}

// 初期化
showLoginScreen();
