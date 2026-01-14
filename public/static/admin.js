const ADMIN_API = '/admin/api';
let currentAdmin = null;
let currentView = 'dashboard'; // dashboard, async, prediction, knowledge
let currentEvents = [];
let selectedEvent = null;

// ==================== ログイン画面 ====================
function showAdminLogin() {
    document.getElementById('admin-app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
            <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div class="text-center mb-8">
                    <i class="fas fa-shield-alt text-6xl text-indigo-600 mb-4"></i>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">管理者ログイン</h1>
                    <p class="text-gray-600">クイズ管理システム</p>
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <p class="text-sm text-yellow-800 font-semibold mb-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        デモ用アカウント
                    </p>
                    <p class="text-xs text-yellow-700">
                        <strong>ユーザー名:</strong> admin<br/>
                        <strong>パスワード:</strong> admin123
                    </p>
                </div>
                
                <div class="space-y-4">
                    <input 
                        type="text" 
                        id="adminUsername" 
                        placeholder="ユーザー名"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <input 
                        type="password" 
                        id="adminPassword" 
                        placeholder="パスワード"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onclick="handleAdminLogin()"
                        class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
                    >
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        ログイン
                    </button>
                    <div id="adminLoginError" class="text-red-600 text-sm hidden"></div>
                    <div class="text-center mt-4">
                        <a href="/" class="text-sm text-gray-600 hover:text-indigo-600 transition">
                            <i class="fas fa-arrow-left mr-1"></i>
                            ユーザー画面に戻る
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleAdminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    
    try {
        const response = await axios.post(`${ADMIN_API}/login`, { username, password });
        currentAdmin = response.data.admin;
        currentView = 'dashboard';
        showMainLayout();
    } catch (error) {
        errorDiv.textContent = '認証に失敗しました';
        errorDiv.classList.remove('hidden');
    }
}

// ==================== メインレイアウト ====================
function showMainLayout() {
    document.getElementById('admin-app').innerHTML = `
        <div class="min-h-screen bg-gray-100">
            <!-- トップバー -->
            <div class="bg-white shadow-md">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-brain text-3xl text-indigo-600"></i>
                            <h1 class="text-2xl font-bold text-gray-800">クイズ管理システム</h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-600">
                                <i class="fas fa-user-shield mr-1"></i>
                                ${currentAdmin.username}
                            </span>
                            <button 
                                onclick="logout()"
                                class="text-sm text-red-600 hover:text-red-800 transition"
                            >
                                <i class="fas fa-sign-out-alt mr-1"></i>
                                ログアウト
                            </button>
                        </div>
                    </div>
                    
                    <!-- ナビゲーションタブ -->
                    <div class="flex space-x-1 border-t border-gray-200 pt-2">
                        <button 
                            onclick="switchView('dashboard')"
                            class="nav-tab ${currentView === 'dashboard' ? 'active' : ''}"
                        >
                            <i class="fas fa-chart-line mr-2"></i>
                            ダッシュボード
                        </button>
                        <button 
                            onclick="switchView('async')"
                            class="nav-tab ${currentView === 'async' ? 'active' : ''}"
                        >
                            <i class="fas fa-clock mr-2"></i>
                            いつでもクイズ管理
                        </button>
                        <button 
                            onclick="switchView('prediction')"
                            class="nav-tab ${currentView === 'prediction' ? 'active' : ''}"
                        >
                            <i class="fas fa-crystal-ball mr-2"></i>
                            クイズ○○後管理
                        </button>
                        <button 
                            onclick="switchView('knowledge')"
                            class="nav-tab ${currentView === 'knowledge' ? 'active' : ''}"
                        >
                            <i class="fas fa-book mr-2"></i>
                            ナレッジ管理
                        </button>
                        <button 
                            onclick="switchView('stats')"
                            class="nav-tab ${currentView === 'stats' ? 'active' : ''}"
                        >
                            <i class="fas fa-chart-pie mr-2"></i>
                            問題統計
                        </button>
                        <button 
                            onclick="switchView('import')"
                            class="nav-tab ${currentView === 'import' ? 'active' : ''}"
                        >
                            <i class="fas fa-file-import mr-2"></i>
                            情報インプット
                        </button>
                        <button 
                            onclick="switchView('analysis')"
                            class="nav-tab ${currentView === 'analysis' ? 'active' : ''}"
                        >
                            <i class="fas fa-lightbulb mr-2"></i>
                            分析イメージ
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- コンテンツエリア -->
            <div id="content-area" class="container mx-auto px-4 py-8">
                <!-- ここに各ビューのコンテンツが表示される -->
            </div>
        </div>
        
        <style>
            .nav-tab {
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem 0.5rem 0 0;
                border: none;
                background: transparent;
                color: #6b7280;
                font-weight: 500;
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .nav-tab:hover {
                background: #f3f4f6;
                color: #4f46e5;
            }
            
            .nav-tab.active {
                background: #eef2ff;
                color: #4f46e5;
                border-bottom: 3px solid #4f46e5;
            }
        </style>
    `;
    
    // 初期ビューを表示
    renderView();
}

// ビュー切り替え
function switchView(view) {
    currentView = view;
    showMainLayout();
}

// ログアウト
function logout() {
    if (confirm('ログアウトしますか？')) {
        currentAdmin = null;
        currentView = 'dashboard';
        currentEvents = [];
        selectedEvent = null;
        showAdminLogin();
    }
}

// ビューをレンダリング
async function renderView() {
    const contentArea = document.getElementById('content-area');
    
    switch (currentView) {
        case 'dashboard':
            await renderDashboard();
            break;
        case 'async':
            await renderAsyncQuizManagement();
            break;
        case 'prediction':
            await renderPredictionQuizManagement();
            break;
        case 'knowledge':
            await renderKnowledgeManagement();
            break;
        case 'stats':
            await renderQuestionStats();
            break;
        case 'import':
            await renderKnowledgeImport();
            break;
        case 'analysis':
            await renderAnalysisDemo();
            break;
    }
}

// ==================== ダッシュボードビュー ====================
async function renderDashboard() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>';
    
    try {
        // 統計データを取得
        const eventsResponse = await axios.get(`${ADMIN_API}/events`);
        const events = eventsResponse.data.events;
        
        const totalEvents = events.length;
        const activeEvents = events.filter(e => e.is_active).length;
        
        // 簡易的な統計（実際はAPIから取得すべき）
        const asyncEvents = events.filter(e => (e.quiz_type || 'async') === 'async').length;
        const predictionEvents = events.filter(e => e.quiz_type === 'prediction').length;
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800 mb-8">
                    <i class="fas fa-chart-line text-indigo-600 mr-3"></i>
                    ダッシュボード
                </h2>
                
                <!-- 統計カード -->
                <div class="grid md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">総イベント数</p>
                                <p class="text-3xl font-bold text-indigo-600">${totalEvents}</p>
                            </div>
                            <i class="fas fa-calendar-alt text-4xl text-indigo-200"></i>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">アクティブ</p>
                                <p class="text-3xl font-bold text-green-600">${activeEvents}</p>
                            </div>
                            <i class="fas fa-check-circle text-4xl text-green-200"></i>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">いつでもクイズ</p>
                                <p class="text-3xl font-bold text-blue-600">${asyncEvents}</p>
                            </div>
                            <i class="fas fa-clock text-4xl text-blue-200"></i>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-gray-600 mb-1">クイズ○○後</p>
                                <p class="text-3xl font-bold text-purple-600">${predictionEvents}</p>
                            </div>
                            <i class="fas fa-crystal-ball text-4xl text-purple-200"></i>
                        </div>
                    </div>
                </div>
                
                <!-- クイック アクション -->
                <div class="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-bolt text-yellow-500 mr-2"></i>
                        クイックアクション
                    </h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <button 
                            onclick="switchView('async')"
                            class="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
                        >
                            <i class="fas fa-plus-circle text-2xl text-indigo-600 mb-2"></i>
                            <p class="font-semibold text-gray-800">いつでもクイズ作成</p>
                        </button>
                        
                        <button 
                            onclick="switchView('prediction')"
                            class="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                        >
                            <i class="fas fa-plus-circle text-2xl text-purple-600 mb-2"></i>
                            <p class="font-semibold text-gray-800">未来予測クイズ作成</p>
                        </button>
                        
                        <button 
                            onclick="switchView('knowledge')"
                            class="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
                        >
                            <i class="fas fa-book-open text-2xl text-green-600 mb-2"></i>
                            <p class="font-semibold text-gray-800">ナレッジ管理</p>
                        </button>
                    </div>
                </div>
                
                <!-- 最近のイベント -->
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-history text-blue-500 mr-2"></i>
                        最近のイベント
                    </h3>
                    ${events.length > 0 ? `
                        <div class="space-y-3">
                            ${events.slice(0, 5).map(event => {
                                const statusClass = event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                                const statusText = event.is_active ? 'アクティブ' : '非アクティブ';
                                return `
                                    <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-gray-800">${event.name}</h4>
                                            <p class="text-sm text-gray-600">${event.description || ''}</p>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold">${statusText}</span>
                                            <button 
                                                onclick="switchView('async')"
                                                class="text-indigo-600 hover:text-indigo-800"
                                            >
                                                <i class="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : '<p class="text-gray-500 text-center py-4">イベントがありません</p>'}
                </div>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = '<div class="text-center text-red-600 py-8">データの読み込みに失敗しました</div>';
    }
}

// ==================== いつでもクイズ管理ビュー ====================
async function renderAsyncQuizManagement() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>';
    
    try {
        const response = await axios.get(`${ADMIN_API}/events`);
        const events = response.data.events.filter(e => (e.quiz_type || 'async') === 'async');
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-clock text-indigo-600 mr-3"></i>
                        いつでもクイズ管理
                    </h2>
                    <button 
                        onclick="showCreateAsyncEventModal()"
                        class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        新規イベント作成
                    </button>
                </div>
                
                ${events.length > 0 ? `
                    <div class="space-y-4">
                        ${events.map(event => {
                            const modeText = event.mode === 'individual' ? '個人戦' : 
                                            event.mode === 'team' ? 'チーム戦' : '企業戦';
                            const statusClass = event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                            const statusText = event.is_active ? 'アクティブ' : '非アクティブ';
                            
                            return `
                                <div class="bg-white p-6 rounded-xl shadow-md">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h3 class="text-xl font-bold text-gray-800 mb-2">${event.name}</h3>
                                            <p class="text-gray-600 mb-4">${event.description || ''}</p>
                                            <div class="flex gap-2 flex-wrap">
                                                <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold">${statusText}</span>
                                                <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">${modeText}</span>
                                                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">${event.questions_per_user}問</span>
                                                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">最低${event.min_participants}人</span>
                                            </div>
                                            <p class="text-sm text-gray-500 mt-3">
                                                <i class="fas fa-calendar mr-2"></i>
                                                ${new Date(event.start_date).toLocaleDateString('ja-JP')} 〜 ${new Date(event.end_date).toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                        <div class="flex flex-col gap-2 ml-4">
                                            <button 
                                                onclick="editEvent(${event.id})"
                                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                            >
                                                <i class="fas fa-edit mr-1"></i>
                                                編集
                                            </button>
                                            <button 
                                                onclick="manageAsyncQuestions(${event.id})"
                                                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                            >
                                                <i class="fas fa-question-circle mr-1"></i>
                                                問題管理
                                            </button>
                                            <button 
                                                onclick="viewAsyncParticipants(${event.id})"
                                                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                                            >
                                                <i class="fas fa-users mr-1"></i>
                                                参加者
                                            </button>
                                            <button 
                                                onclick="viewAsyncStats(${event.id})"
                                                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                                            >
                                                <i class="fas fa-chart-bar mr-1"></i>
                                                統計
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="bg-white rounded-xl shadow-md p-12 text-center">
                        <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">イベントがありません</h3>
                        <p class="text-gray-600 mb-6">新規イベントを作成してクイズを開始しましょう</p>
                        <button 
                            onclick="showCreateAsyncEventModal()"
                            class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <i class="fas fa-plus mr-2"></i>
                            最初のイベントを作成
                        </button>
                    </div>
                `}
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = '<div class="text-center text-red-600 py-8">データの読み込みに失敗しました</div>';
    }
}

// ==================== クイズ○○後管理ビュー ====================
async function renderPredictionQuizManagement() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i></div>';
    
    try {
        // イベント一覧を取得
        const response = await axios.get(`${ADMIN_API}/events`);
        const allEvents = response.data.events || [];
        const predictionEvents = allEvents.filter(e => e.quiz_type === 'prediction');
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-crystal-ball text-purple-600 mr-3"></i>
                        クイズ○○後管理（未来予測型）
                    </h2>
                    <div class="flex space-x-3">
                        <button 
                            onclick="showAIQuestionGeneratorModal()"
                            class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
                        >
                            <i class="fas fa-magic mr-2"></i>
                            AI問題生成
                        </button>
                        <button 
                            onclick="showCreatePredictionEventModal()"
                            class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
                        >
                            <i class="fas fa-plus mr-2"></i>
                            新規イベント作成
                        </button>
                    </div>
                </div>
                
                ${predictionEvents.length === 0 ? `
                    <div class="bg-white rounded-xl shadow-md p-12 text-center">
                        <i class="fas fa-crystal-ball text-6xl text-purple-300 mb-4"></i>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">予測クイズがありません</h3>
                        <p class="text-gray-600 mb-6">
                            「新規イベント作成」または「AI問題生成」ボタンから始めましょう！
                        </p>
                    </div>
                ` : `
                    <!-- イベント一覧 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${predictionEvents.map(event => `
                            <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 border-l-4 border-purple-500">
                                <div class="flex items-start justify-between mb-4">
                                    <h3 class="text-xl font-bold text-gray-800 flex-1">
                                        ${event.name}
                                    </h3>
                                    <span class="${event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} px-3 py-1 rounded-full text-xs font-semibold">
                                        ${event.is_active ? '開催中' : '終了'}
                                    </span>
                                </div>
                                
                                <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                                    ${event.description || '説明なし'}
                                </p>
                                
                                <div class="space-y-2 text-sm text-gray-600 mb-4">
                                    <div>
                                        <i class="fas fa-calendar text-purple-600 mr-2"></i>
                                        ${new Date(event.start_date).toLocaleDateString('ja-JP')} 〜 ${new Date(event.end_date).toLocaleDateString('ja-JP')}
                                    </div>
                                    <div>
                                        <i class="fas fa-question-circle text-purple-600 mr-2"></i>
                                        問題数: ${event.questions_per_user || 5}問
                                    </div>
                                </div>
                                
                                <div class="flex space-x-2">
                                    <button 
                                        onclick="managePredictionQuestions(${event.id})"
                                        class="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition text-sm font-semibold"
                                    >
                                        <i class="fas fa-tasks mr-1"></i>
                                        問題管理
                                    </button>
                                    <button 
                                        onclick="editEvent(${event.id})"
                                        class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition text-sm"
                                    >
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading prediction events:', error);
        contentArea.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <p class="text-red-800">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    エラーが発生しました: ${error.response?.data?.error || error.message}
                </p>
            </div>
        `;
    }
}

// AI問題生成モーダル
function showAIQuestionGeneratorModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-xl">
                <h3 class="text-2xl font-bold flex items-center">
                    <i class="fas fa-magic mr-3"></i>
                    AI問題生成（未来予測型）
                </h3>
                <p class="text-purple-100 text-sm mt-2">
                    テーマを入力するだけで、AIが自動で予測問題を生成します
                </p>
            </div>
            
            <div class="p-6">
                <!-- イベント選択 -->
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-calendar text-purple-600 mr-2"></i>
                        対象イベント
                    </label>
                    <select id="aiEventSelect" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
                        <option value="">イベントを選択...</option>
                    </select>
                </div>
                
                <!-- テーマ入力 -->
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        テーマ
                    </label>
                    <input 
                        type="text" 
                        id="aiThemeInput" 
                        class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        placeholder="例: オフィスでの身近な予測、天気予測、売上予測"
                    />
                </div>
                
                <!-- 問題数 -->
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-list-ol text-blue-500 mr-2"></i>
                        生成する問題数
                    </label>
                    <select id="aiCountSelect" class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
                        <option value="3">3問</option>
                        <option value="5">5問</option>
                        <option value="10">10問</option>
                    </select>
                </div>
                
                <!-- 例 -->
                <div class="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                    <h4 class="font-bold text-purple-900 mb-2">
                        <i class="fas fa-info-circle mr-2"></i>
                        テーマ例
                    </h4>
                    <div class="text-sm text-purple-800 space-y-1">
                        <div>• オフィスでの身近な予測（同僚の行動、会議時間など）</div>
                        <div>• 天気予測（明日の最高気温、降水確率など）</div>
                        <div>• 営業成績予測（今日の受注件数、売上金額など）</div>
                        <div>• イベント予測（参加人数、人気メニューなど）</div>
                    </div>
                </div>
                
                <!-- ボタン -->
                <div class="flex space-x-3">
                    <button 
                        onclick="generateAIQuestions()"
                        class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg"
                        id="generateBtn"
                    >
                        <i class="fas fa-magic mr-2"></i>
                        生成開始
                    </button>
                    <button 
                        onclick="this.closest('.fixed').remove()"
                        class="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition"
                    >
                        キャンセル
                    </button>
                </div>
                
                <!-- 結果表示エリア -->
                <div id="aiResultArea" class="mt-6"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // イベント一覧を取得して選択肢に追加
    loadEventsForAI();
}

// イベント一覧を取得
async function loadEventsForAI() {
    try {
        const response = await axios.get(`${ADMIN_API}/events`);
        const events = response.data.events || [];
        const predictionEvents = events.filter(e => e.quiz_type === 'prediction');
        
        const select = document.getElementById('aiEventSelect');
        predictionEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// AI問題生成実行
async function generateAIQuestions() {
    const eventId = document.getElementById('aiEventSelect').value;
    const theme = document.getElementById('aiThemeInput').value.trim();
    const count = document.getElementById('aiCountSelect').value;
    const resultArea = document.getElementById('aiResultArea');
    const generateBtn = document.getElementById('generateBtn');
    
    if (!eventId) {
        alert('イベントを選択してください');
        return;
    }
    
    if (!theme) {
        alert('テーマを入力してください');
        return;
    }
    
    // ローディング表示
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
    resultArea.innerHTML = `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p class="text-blue-800">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                AIが問題を生成しています... (約5〜10秒)
            </p>
        </div>
    `;
    
    try {
        const response = await axios.post(`${ADMIN_API}/ai/generate-prediction-questions`, {
            theme,
            count: parseInt(count),
            event_id: parseInt(eventId)
        });
        
        const questions = response.data.questions;
        
        // 成功表示
        resultArea.innerHTML = `
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4">
                <p class="text-green-800 font-semibold">
                    <i class="fas fa-check-circle mr-2"></i>
                    ${questions.length}問の問題を生成しました！
                </p>
            </div>
            
            <!-- 生成された問題 -->
            <div class="space-y-4">
                ${questions.map((q, i) => `
                    <div class="bg-gray-50 border border-gray-300 rounded-lg p-4">
                        <div class="flex items-start justify-between mb-2">
                            <h4 class="font-bold text-gray-800">問題${i + 1}</h4>
                            <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">${q.answer_type === 'free_text' ? '記入式' : '4択'}</span>
                        </div>
                        <p class="text-gray-700 mb-2">${q.question_text}</p>
                        <div class="text-sm text-gray-600">
                            <div>回答例: ${q.example_answer || 'なし'}</div>
                            <div>参加期限: ${q.participation_deadline_hours}時間後</div>
                            <div>答え発表: ${q.answer_reveal_hours}時間後</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button 
                onclick="savegeneratedQuestions(${eventId}, ${JSON.stringify(questions).replace(/"/g, '&quot;')})"
                class="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition shadow-lg mt-4"
            >
                <i class="fas fa-save mr-2"></i>
                この${questions.length}問を保存する
            </button>
        `;
        
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>再生成';
        
    } catch (error) {
        console.error('AI Generation Error:', error);
        resultArea.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p class="text-red-800">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    エラーが発生しました: ${error.response?.data?.error || error.message}
                </p>
                ${error.response?.data?.setup_required ? `
                    <p class="text-red-700 text-sm mt-2">
                        OpenAI APIキーが設定されていません。.dev.varsファイルでOPENAI_API_KEYを設定してください。
                    </p>
                ` : ''}
            </div>
        `;
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>生成開始';
    }
}

// 生成された問題を保存
async function saveGeneratedQuestions(eventId, questions) {
    try {
        for (const q of questions) {
            const now = new Date();
            const participationDeadline = new Date(now.getTime() + q.participation_deadline_hours * 60 * 60 * 1000);
            const answerRevealTime = new Date(now.getTime() + q.answer_reveal_hours * 60 * 60 * 1000);
            
            await axios.post(`${ADMIN_API}/prediction/questions`, {
                event_id: eventId,
                question_text: q.question_text,
                answer_type: q.answer_type || 'free_text',
                pool_group: q.pool_group || 1,
                participation_deadline: participationDeadline.toISOString().slice(0, 16),
                answer_reveal_time: answerRevealTime.toISOString().slice(0, 16),
                verification_source: q.verification_source || 'manual',
                category_id: 6
            });
        }
        
        alert(`${questions.length}問を保存しました！`);
        document.querySelector('.fixed').remove();
        renderPredictionQuizManagement();
        
    } catch (error) {
        console.error('Save Error:', error);
        alert('保存に失敗しました: ' + (error.response?.data?.error || error.message));
    }
}

// ==================== ナレッジ管理ビュー ====================
async function renderKnowledgeManagement() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>';
    
    try {
        const response = await axios.get(`${ADMIN_API}/knowledge`);
        const knowledgeList = response.data.knowledge;
        
        // カテゴリ別に分類
        const companyHistory = knowledgeList.filter(k => k.category === 'company_history');
        const knowledge = knowledgeList.filter(k => k.category === 'knowledge');
        const communication = knowledgeList.filter(k => k.category === 'communication' || k.category === 'people' || k.category === 'compliance');
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-book text-green-600 mr-3"></i>
                        ナレッジ管理
                    </h2>
                    <button 
                        onclick="alert('ナレッジ作成機能は準備中です')"
                        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        新規ナレッジ作成
                    </button>
                </div>
                
                <!-- カテゴリタブ -->
                <div class="bg-white rounded-t-xl shadow-md">
                    <div class="flex border-b">
                        <button 
                            onclick="showKnowledgeCategory('company_history')"
                            class="knowledge-category-tab active flex-1 px-6 py-4 font-semibold transition"
                            data-category="company_history"
                        >
                            <i class="fas fa-building mr-2"></i>
                            社史（${companyHistory.length}）
                        </button>
                        <button 
                            onclick="showKnowledgeCategory('knowledge')"
                            class="knowledge-category-tab flex-1 px-6 py-4 font-semibold transition"
                            data-category="knowledge"
                        >
                            <i class="fas fa-lightbulb mr-2"></i>
                            ナレッジ（${knowledge.length}）
                        </button>
                        <button 
                            onclick="showKnowledgeCategory('communication')"
                            class="knowledge-category-tab flex-1 px-6 py-4 font-semibold transition"
                            data-category="communication"
                        >
                            <i class="fas fa-comments mr-2"></i>
                            コミュニケーション（${communication.length}）
                        </button>
                    </div>
                </div>
                
                <!-- カテゴリコンテンツ -->
                <div class="bg-white rounded-b-xl shadow-md p-6">
                    <div id="knowledge-category-content">
                        ${renderKnowledgeCategoryContent('company_history', companyHistory)}
                    </div>
                </div>
            </div>
            
            <style>
                .knowledge-category-tab {
                    background: transparent;
                    color: #6b7280;
                    border: none;
                    cursor: pointer;
                }
                
                .knowledge-category-tab:hover {
                    background: #f3f4f6;
                    color: #16a34a;
                }
                
                .knowledge-category-tab.active {
                    background: #f0fdf4;
                    color: #16a34a;
                    border-bottom: 3px solid #16a34a;
                }
            </style>
        `;
        
        // カテゴリデータを保存
        window.knowledgeData = {
            company_history: companyHistory,
            knowledge: knowledge,
            communication: communication
        };
        
    } catch (error) {
        contentArea.innerHTML = '<div class="text-center text-red-600 py-8">データの読み込みに失敗しました</div>';
    }
}

// カテゴリ切り替え
function showKnowledgeCategory(category) {
    // タブのアクティブ状態を更新
    document.querySelectorAll('.knowledge-category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    // コンテンツを更新
    const contentDiv = document.getElementById('knowledge-category-content');
    const knowledgeList = window.knowledgeData[category] || [];
    contentDiv.innerHTML = renderKnowledgeCategoryContent(category, knowledgeList);
}

// カテゴリコンテンツをレンダリング
function renderKnowledgeCategoryContent(category, knowledgeList) {
    const categoryInfo = {
        company_history: {
            title: '社史',
            icon: 'fa-building',
            color: 'blue',
            description: '会社の歴史や重要なマイルストーンに関するナレッジ'
        },
        knowledge: {
            title: 'ナレッジ',
            icon: 'fa-lightbulb',
            color: 'yellow',
            description: '業務知識や製品情報など、業務に役立つナレッジ'
        },
        communication: {
            title: 'コミュニケーション',
            icon: 'fa-comments',
            color: 'purple',
            description: '人物情報やコンプライアンスなど、コミュニケーションに関するナレッジ'
        }
    };
    
    const info = categoryInfo[category] || categoryInfo.knowledge;
    
    if (knowledgeList.length === 0) {
        return `
            <div class="text-center py-12">
                <i class="fas ${info.icon} text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800 mb-2">ナレッジがありません</h3>
                <p class="text-gray-600 mb-6">${info.description}</p>
                <button 
                    onclick="alert('ナレッジ作成機能は準備中です')"
                    class="bg-${info.color}-600 text-white px-6 py-3 rounded-lg hover:bg-${info.color}-700 transition"
                >
                    <i class="fas fa-plus mr-2"></i>
                    最初のナレッジを作成
                </button>
            </div>
        `;
    }
    
    return `
        <div class="mb-4">
            <p class="text-gray-600">
                <i class="fas ${info.icon} text-${info.color}-600 mr-2"></i>
                ${info.description}
            </p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-4">
            ${knowledgeList.map(k => {
                const statusClass = k.status === 'published' ? 'bg-green-100 text-green-800' : 
                                   k.status === 'review' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-gray-100 text-gray-800';
                const statusText = k.status === 'published' ? '公開' : 
                                  k.status === 'review' ? 'レビュー待ち' : 
                                  '下書き';
                
                return `
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-${info.color}-500 transition">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-bold text-gray-800 flex-1">${k.title}</h4>
                            <span class="${statusClass} px-2 py-1 rounded text-xs font-semibold">${statusText}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-3 line-clamp-2">${k.content.substring(0, 100)}...</p>
                        <div class="flex justify-between items-center">
                            <div class="flex gap-2 text-xs text-gray-500">
                                <span><i class="fas fa-star text-yellow-500"></i> ${k.value_score || 0}/5</span>
                                <span><i class="fas fa-percentage"></i> ${k.recognition_rate || 0}%</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="text-red-600 hover:text-red-800 text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 初期化
showAdminLogin();

// ==================== 予測クイズ管理機能の書き換え ====================

// グローバル変数
let currentPredictionEvent = null;
let currentPredictionQuestions = [];

// renderPredictionQuizManagementを書き換え
async function renderPredictionQuizManagement() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i></div>';
    
    try {
        const response = await axios.get(`${ADMIN_API}/events`);
        const events = response.data.events.filter(e => e.quiz_type === 'prediction');
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-crystal-ball text-purple-600 mr-3"></i>
                        クイズ○○後管理（未来予測型）
                    </h2>
                    <button 
                        onclick="showCreatePredictionEventModal()"
                        class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        新規イベント作成
                    </button>
                </div>
                
                ${events.length > 0 ? `
                    <div class="space-y-4">
                        ${events.map(event => {
                            const statusClass = event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                            const statusText = event.is_active ? 'アクティブ' : '非アクティブ';
                            
                            return `
                                <div class="bg-white p-6 rounded-xl shadow-md">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <h3 class="text-xl font-bold text-gray-800 mb-2">${event.name}</h3>
                                            <p class="text-gray-600 mb-4">${event.description || ''}</p>
                                            <div class="flex gap-2 flex-wrap">
                                                <span class="${statusClass} px-3 py-1 rounded-full text-xs font-semibold">${statusText}</span>
                                                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                    <i class="fas fa-crystal-ball mr-1"></i>
                                                    未来予測型
                                                </span>
                                                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">${event.questions_per_user || 5}問</span>
                                            </div>
                                            <p class="text-sm text-gray-500 mt-3">
                                                <i class="fas fa-calendar mr-2"></i>
                                                ${new Date(event.start_date).toLocaleDateString('ja-JP')} 〜 ${new Date(event.end_date).toLocaleDateString('ja-JP')}
                                            </p>
                                        </div>
                                        <div class="flex flex-col gap-2 ml-4">
                                            <button 
                                                onclick="managePredictionQuestions(${event.id})"
                                                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                                            >
                                                <i class="fas fa-question-circle mr-1"></i>
                                                問題管理
                                            </button>
                                            <button 
                                                onclick="viewPredictionParticipants(${event.id})"
                                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                            >
                                                <i class="fas fa-users mr-1"></i>
                                                参加者
                                            </button>
                                            <button 
                                                onclick="viewPredictionRanking(${event.id})"
                                                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                                            >
                                                <i class="fas fa-trophy mr-1"></i>
                                                ランキング
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="bg-white rounded-xl shadow-md p-12 text-center">
                        <i class="fas fa-crystal-ball text-6xl text-purple-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">予測イベントがありません</h3>
                        <p class="text-gray-600 mb-6">新規イベントを作成して未来予測クイズを開始しましょう</p>
                        <button 
                            onclick="showCreatePredictionEventModal()"
                            class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            <i class="fas fa-plus mr-2"></i>
                            最初のイベントを作成
                        </button>
                    </div>
                `}
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = '<div class="text-center text-red-600 py-8">データの読み込みに失敗しました</div>';
    }
}

// イベント作成モーダル
function showCreatePredictionEventModal() {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7日後
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-crystal-ball text-purple-600 mr-2"></i>
                新規予測イベント作成
            </h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">イベント名</label>
                    <input 
                        type="text" 
                        id="predEventName" 
                        placeholder="例: 田中君の今日のランチ予測"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">説明</label>
                    <textarea 
                        id="predEventDesc" 
                        placeholder="例: 田中君が今日のランチで何を食べるか予測しよう！"
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    ></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">開始日時</label>
                        <input 
                            type="datetime-local" 
                            id="predEventStart" 
                            value="${now.toISOString().slice(0, 16)}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">終了日時</label>
                        <input 
                            type="datetime-local" 
                            id="predEventEnd" 
                            value="${endDate.toISOString().slice(0, 16)}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">問題数</label>
                    <input 
                        type="number" 
                        id="predEventQuestions" 
                        value="5"
                        min="1"
                        max="20"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="createPredictionEvent()"
                    class="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                    <i class="fas fa-check mr-2"></i>
                    作成
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// イベント作成
async function createPredictionEvent() {
    const name = document.getElementById('predEventName').value.trim();
    const description = document.getElementById('predEventDesc').value.trim();
    const startDate = document.getElementById('predEventStart').value;
    const endDate = document.getElementById('predEventEnd').value;
    const questionsPerUser = parseInt(document.getElementById('predEventQuestions').value);
    
    if (!name) {
        alert('イベント名を入力してください');
        return;
    }
    
    try {
        await axios.post(`${ADMIN_API}/events`, {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            is_active: 1,
            questions_per_user: questionsPerUser,
            mode: 'individual',
            min_participants: 1,
            quiz_type: 'prediction'
        });
        
        alert('イベントを作成しました！');
        document.querySelector('.fixed').remove();
        renderPredictionQuizManagement();
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 問題管理
async function managePredictionQuestions(eventId) {
    try {
        // イベント情報を取得
        const eventResponse = await axios.get(`${ADMIN_API}/events`);
        currentPredictionEvent = eventResponse.data.events.find(e => e.id === eventId);
        
        // 問題一覧を取得
        const questionsResponse = await axios.get(`/api/prediction/events/${eventId}/questions`);
        currentPredictionQuestions = questionsResponse.data.questions || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="mb-6">
                    <button 
                        onclick="renderPredictionQuizManagement()"
                        class="text-purple-600 hover:text-purple-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        イベント一覧に戻る
                    </button>
                </div>
                
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-question-circle text-purple-600 mr-2"></i>
                        問題管理：${currentPredictionEvent.name}
                    </h2>
                    <button 
                        onclick="showCreatePredictionQuestionModal()"
                        class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        問題を追加
                    </button>
                </div>
                
                ${currentPredictionQuestions.length > 0 ? `
                    <div class="space-y-4">
                        ${currentPredictionQuestions.map((q, i) => {
                            const verifiedClass = q.is_verified ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200';
                            const verifiedText = q.is_verified ? '判定済み' : '判定待ち';
                            const verifiedIcon = q.is_verified ? 'fa-check-circle text-green-600' : 'fa-clock text-gray-400';
                            
                            return `
                                <div class="bg-white p-6 rounded-xl shadow-md border-2 ${verifiedClass}">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                    問題 ${i + 1}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    <i class="fas ${verifiedIcon} mr-1"></i>
                                                    ${verifiedText}
                                                </span>
                                            </div>
                                            <h3 class="text-lg font-bold text-gray-800 mb-2">${q.question_text}</h3>
                                        </div>
                                        ${!q.is_verified ? `
                                            <button 
                                                onclick="showVerifyQuestionModal(${q.id})"
                                                class="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                            >
                                                <i class="fas fa-check mr-1"></i>
                                                答え合わせ
                                            </button>
                                        ` : `
                                            <span class="ml-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                                                <i class="fas fa-check-circle mr-1"></i>
                                                正解: ${q.correct_answer}
                                            </span>
                                        `}
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-2 mb-4">
                                        <div class="text-sm">
                                            <span class="font-semibold text-gray-700">A:</span> ${q.option_a}
                                        </div>
                                        <div class="text-sm">
                                            <span class="font-semibold text-gray-700">B:</span> ${q.option_b}
                                        </div>
                                        <div class="text-sm">
                                            <span class="font-semibold text-gray-700">C:</span> ${q.option_c}
                                        </div>
                                        <div class="text-sm">
                                            <span class="font-semibold text-gray-700">D:</span> ${q.option_d}
                                        </div>
                                    </div>
                                    
                                    <div class="text-xs text-gray-500 flex items-center gap-4">
                                        <span>
                                            <i class="fas fa-clock mr-1"></i>
                                            答え合わせ日時: ${new Date(q.prediction_date).toLocaleString('ja-JP')}
                                        </span>
                                        ${q.verification_source ? `
                                            <span>
                                                <i class="fas fa-database mr-1"></i>
                                                ソース: ${q.verification_source}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : `
                    <div class="bg-white rounded-xl shadow-md p-12 text-center">
                        <i class="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">問題がありません</h3>
                        <p class="text-gray-600 mb-6">最初の予測問題を作成しましょう</p>
                        <button 
                            onclick="showCreatePredictionQuestionModal()"
                            class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                        >
                            <i class="fas fa-plus mr-2"></i>
                            問題を追加
                        </button>
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 問題作成モーダル
function showCreatePredictionQuestionModal() {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 my-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-crystal-ball text-purple-600 mr-2"></i>
                新規予測問題作成
            </h3>
            
            <!-- テンプレート選択 -->
            <div class="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl">
                <p class="text-sm font-semibold text-purple-900 mb-3">
                    <i class="fas fa-magic mr-1"></i>
                    よくある予測問題テンプレート
                </p>
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="useTemplate('lunch')" class="px-3 py-2 bg-white text-left rounded-lg hover:bg-purple-100 transition text-sm shadow-sm">
                        <i class="fas fa-utensils text-orange-500 mr-2"></i>
                        <strong>ランチ予測</strong><br/>
                        <span class="text-xs text-gray-600">誰かのランチメニュー</span>
                    </button>
                    <button onclick="useTemplate('meeting')" class="px-3 py-2 bg-white text-left rounded-lg hover:bg-purple-100 transition text-sm shadow-sm">
                        <i class="fas fa-clock text-blue-500 mr-2"></i>
                        <strong>時間予測</strong><br/>
                        <span class="text-xs text-gray-600">会議終了時刻など</span>
                    </button>
                    <button onclick="useTemplate('vending')" class="px-3 py-2 bg-white text-left rounded-lg hover:bg-purple-100 transition text-sm shadow-sm">
                        <i class="fas fa-coffee text-green-500 mr-2"></i>
                        <strong>人気商品予測</strong><br/>
                        <span class="text-xs text-gray-600">自販機で一番売れる飲み物</span>
                    </button>
                    <button onclick="useTemplate('weather')" class="px-3 py-2 bg-white text-left rounded-lg hover:bg-purple-100 transition text-sm shadow-sm">
                        <i class="fas fa-cloud-sun text-yellow-500 mr-2"></i>
                        <strong>天気予測</strong><br/>
                        <span class="text-xs text-gray-600">明日の天気</span>
                    </button>
                    <button onclick="useTemplate('sales')" class="px-3 py-2 bg-white text-left rounded-lg hover:bg-purple-100 transition text-sm shadow-sm">
                        <i class="fas fa-chart-line text-red-500 mr-2"></i>
                        <strong>営業成績予測</strong><br/>
                        <span class="text-xs text-gray-600">今日の受注件数</span>
                    </button>
                    <button onclick="useTemplate('firstword')" class="px-3 py-2 bg-white text-left rounded-lg hover:bg-purple-100 transition text-sm shadow-sm">
                        <i class="fas fa-comment text-purple-500 mr-2"></i>
                        <strong>発言予測</strong><br/>
                        <span class="text-xs text-gray-600">朝礼での第一声</span>
                    </button>
                </div>
            </div>
            
            <div class="space-y-4">
                <!-- 問題種別選択 -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                    <div class="flex justify-between items-center mb-3">
                        <label class="block text-sm font-bold text-blue-900">
                            <i class="fas fa-tags mr-2"></i>
                            問題種別
                        </label>
                        <button 
                            onclick="aiClassifyCurrentQuestion()" 
                            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-sm font-semibold shadow-md"
                        >
                            <i class="fas fa-magic mr-2"></i>
                            AI自動分類
                        </button>
                    </div>
                    <select 
                        id="predQuestionType" 
                        class="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="entertainment" selected>🎮 エンタメ系（未来予測、ゲーム要素、短期保持7日）</option>
                        <option value="learning">📚 学習系（業務知識、スキル、永久保持）</option>
                        <option value="knowledge">💡 ナレッジ系（社内情報、手順、永久保持・要更新）</option>
                        <option value="history">🏛️ 社史系（企業歴史、文化、永久保持）</option>
                    </select>
                    <div id="aiClassificationResult" class="mt-3 hidden">
                        <div class="bg-white p-3 rounded-lg border border-blue-200">
                            <p class="text-sm font-semibold text-gray-700 mb-1">
                                <i class="fas fa-robot text-purple-600 mr-1"></i>
                                AI分類結果
                            </p>
                            <div id="aiClassificationContent" class="text-sm text-gray-600"></div>
                        </div>
                    </div>
                    <p class="text-xs text-blue-700 mt-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        エンタメ系は7日後に自動削除、その他は永久保持されます
                    </p>
                </div>
                
                <!-- 問題文 -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">問題文</label>
                    <textarea 
                        id="predQuestionText" 
                        placeholder="例: 田中君は2時間後のランチで何を食べるでしょうか？"
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    ></textarea>
                </div>
                
                <!-- 選択肢 -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 A</label>
                        <input 
                            type="text" 
                            id="predOptionA" 
                            placeholder="例: ラーメン"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 B</label>
                        <input 
                            type="text" 
                            id="predOptionB" 
                            placeholder="例: カレー"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 C</label>
                        <input 
                            type="text" 
                            id="predOptionC" 
                            placeholder="例: そば"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 D</label>
                        <input 
                            type="text" 
                            id="predOptionD" 
                            placeholder="例: おにぎり"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <!-- 答え合わせ日時 -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">答え合わせ日時</label>
                    <input 
                        type="datetime-local" 
                        id="predPredictionDate" 
                        value="${twoHoursLater.toISOString().slice(0, 16)}"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        <i class="fas fa-info-circle mr-1"></i>
                        この日時になったら答え合わせを行います
                    </p>
                </div>
                
                <!-- クイック選択 -->
                <div class="bg-purple-50 p-4 rounded-lg">
                    <p class="text-sm font-semibold text-purple-900 mb-2">クイック選択</p>
                    <div class="flex gap-2 flex-wrap">
                        <button onclick="setQuickTime(0.5)" class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">30分後</button>
                        <button onclick="setQuickTime(1)" class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">1時間後</button>
                        <button onclick="setQuickTime(2)" class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">2時間後</button>
                        <button onclick="setQuickTime(6)" class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">6時間後</button>
                        <button onclick="setQuickTime(24)" class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">明日</button>
                        <button onclick="setQuickTime(168)" class="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">1週間後</button>
                    </div>
                </div>
                
                <!-- データソース -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">データソース（オプション）</label>
                    <input 
                        type="text" 
                        id="predVerificationSource" 
                        placeholder="例: manual, weather_api, stock_api など"
                        value="manual"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="createPredictionQuestion()"
                    class="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                    <i class="fas fa-check mr-2"></i>
                    作成
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// テンプレート使用
function useTemplate(templateType) {
    const templates = {
        lunch: {
            question: '田中君は2時間後のランチで何を食べるでしょうか？',
            options: ['ラーメン', 'カレー', 'そば', 'おにぎり'],
            hours: 2
        },
        meeting: {
            question: '現在行われている営業会議は何時に終わるでしょうか？',
            options: ['14:00', '14:30', '15:00', '15:30'],
            hours: 1
        },
        vending: {
            question: '今日の休憩時間、自販機で一番売れる飲み物は何でしょうか？',
            options: ['コーヒー', 'お茶', 'コーラ', 'エナジードリンク'],
            hours: 6
        },
        weather: {
            question: '明日の東京の最高気温は何度でしょうか？',
            options: ['10度未満', '10〜15度', '16〜20度', '21度以上'],
            hours: 24
        },
        sales: {
            question: '営業チームは今日何件の受注を獲得するでしょうか？',
            options: ['0〜2件', '3〜5件', '6〜8件', '9件以上'],
            hours: 8
        },
        firstword: {
            question: '明日の朝礼、部長の最初の一言は何でしょうか？',
            options: ['おはようございます', 'さあ今日も頑張ろう', '皆さん調子はどうですか', 'それでは始めます'],
            hours: 24
        }
    };
    
    const template = templates[templateType];
    if (template) {
        document.getElementById('predQuestionText').value = template.question;
        document.getElementById('predOptionA').value = template.options[0];
        document.getElementById('predOptionB').value = template.options[1];
        document.getElementById('predOptionC').value = template.options[2];
        document.getElementById('predOptionD').value = template.options[3];
        setQuickTime(template.hours);
    }
}

// クイック時間設定
function setQuickTime(hours) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    document.getElementById('predPredictionDate').value = futureTime.toISOString().slice(0, 16);
}

// AI自動分類
async function aiClassifyCurrentQuestion() {
    const questionText = document.getElementById('predQuestionText').value.trim();
    const optionA = document.getElementById('predOptionA').value.trim();
    const optionB = document.getElementById('predOptionB').value.trim();
    const optionC = document.getElementById('predOptionC').value.trim();
    const optionD = document.getElementById('predOptionD').value.trim();
    
    if (!questionText) {
        alert('問題文を入力してください');
        return;
    }
    
    const resultDiv = document.getElementById('aiClassificationResult');
    const contentDiv = document.getElementById('aiClassificationContent');
    
    try {
        resultDiv.classList.remove('hidden');
        contentDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI分析中...';
        
        const response = await axios.post(`${ADMIN_API}/ai/classify-question`, {
            question_text: questionText,
            options: [optionA, optionB, optionC, optionD].filter(o => o)
        });
        
        const { type, confidence, reason } = response.data.classification;
        
        // 種別を自動選択
        document.getElementById('predQuestionType').value = type;
        
        // 結果を表示
        const typeLabels = {
            entertainment: '🎮 エンタメ系',
            learning: '📚 学習系',
            knowledge: '💡 ナレッジ系',
            history: '🏛️ 社史系'
        };
        
        contentDiv.innerHTML = `
            <div class="space-y-2">
                <div class="flex items-center">
                    <span class="font-semibold text-gray-800">分類: </span>
                    <span class="ml-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                        ${typeLabels[type]}
                    </span>
                    <span class="ml-2 text-xs text-gray-600">信頼度: ${(confidence * 100).toFixed(0)}%</span>
                </div>
                <div>
                    <span class="text-xs text-gray-600">理由: ${reason}</span>
                </div>
            </div>
        `;
        
    } catch (error) {
        contentDiv.innerHTML = `<span class="text-red-600"><i class="fas fa-exclamation-triangle mr-1"></i>${error.response?.data?.error || error.message}</span>`;
    }
}

// 問題作成
async function createPredictionQuestion() {
    const questionText = document.getElementById('predQuestionText').value.trim();
    const optionA = document.getElementById('predOptionA').value.trim();
    const optionB = document.getElementById('predOptionB').value.trim();
    const optionC = document.getElementById('predOptionC').value.trim();
    const optionD = document.getElementById('predOptionD').value.trim();
    const predictionDate = document.getElementById('predPredictionDate').value;
    const verificationSource = document.getElementById('predVerificationSource').value.trim();
    const questionType = document.getElementById('predQuestionType').value;
    
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        alert('すべての項目を入力してください');
        return;
    }
    
    try {
        await axios.post(`${ADMIN_API}/prediction/questions`, {
            event_id: currentPredictionEvent.id,
            question_text: questionText,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            prediction_date: predictionDate,
            verification_source: verificationSource || 'manual',
            category_id: 6,
            source_material: '予測問題',
            detailed_explanation: '',
            question_type: questionType,
            retention_policy: questionType === 'entertainment' ? 'short' : 'permanent'
        });
        
        alert('問題を作成しました！');
        document.querySelector('.fixed').remove();
        managePredictionQuestions(currentPredictionEvent.id);
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 答え合わせモーダル
function showVerifyQuestionModal(questionId) {
    const question = currentPredictionQuestions.find(q => q.id === questionId);
    const isFreeText = question.answer_type === 'free_text';
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                答え合わせ
            </h3>
            
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <div class="flex items-start justify-between mb-2">
                    <p class="font-semibold text-gray-800 flex-1">${question.question_text}</p>
                    <span class="${isFreeText ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} px-3 py-1 rounded-full text-xs font-semibold">
                        ${isFreeText ? '記入式' : '4択'}
                    </span>
                </div>
                ${!isFreeText ? `
                    <div class="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div>A: ${question.option_a}</div>
                        <div>B: ${question.option_b}</div>
                        <div>C: ${question.option_c}</div>
                        <div>D: ${question.option_d}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="space-y-4">
                ${isFreeText ? `
                    <!-- 記入式の答え -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-pen text-purple-600 mr-2"></i>
                            実際の答え
                        </label>
                        <input 
                            type="text" 
                            id="verifyActualValue" 
                            placeholder="例: カレー、12:30、800"
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                        />
                        <p class="text-xs text-gray-500 mt-1">
                            この値を基準にユーザーの回答を判定します
                        </p>
                    </div>
                    
                    <!-- AI柔軟判定オプション -->
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                        <div class="flex items-start">
                            <input 
                                type="checkbox" 
                                id="useAIJudgment" 
                                class="mt-1 mr-3 h-5 w-5 text-purple-600 rounded"
                                checked
                            />
                            <div class="flex-1">
                                <label for="useAIJudgment" class="font-bold text-purple-900 flex items-center cursor-pointer">
                                    <i class="fas fa-magic text-purple-600 mr-2"></i>
                                    AI柔軟判定を使用
                                </label>
                                <p class="text-sm text-purple-800 mt-1">
                                    AIが表記揺れを許容して判定します（例: 「カレー」「カレーライス」を同じと判定）
                                </p>
                                <div class="mt-2 text-xs text-purple-700 space-y-1">
                                    <div>✓ 表記揺れ許容（カレー/カレーライス/チキンカレー）</div>
                                    <div>✓ 時刻揺れ許容（12:30/12時30分/午後0時半）</div>
                                    <div>✓ 数値範囲判定（±5%以内なら正解）</div>
                                    <div>✓ 単位無視（800/800円）</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- 4択の答え -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">正解の選択肢</label>
                        <select 
                            id="verifyCorrectAnswer" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">-- 選択してください --</option>
                            <option value="A">A: ${question.option_a}</option>
                            <option value="B">B: ${question.option_b}</option>
                            <option value="C">C: ${question.option_c}</option>
                            <option value="D">D: ${question.option_d}</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">実際の値（オプション）</label>
                        <input 
                            type="text" 
                            id="verifyActualValue" 
                            placeholder="例: 田中君はラーメンを食べました"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                `}
                
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p class="text-sm text-yellow-800">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        答え合わせを実行すると、全ユーザーの予測が自動的に判定されます。この操作は取り消せません。
                    </p>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="verifyQuestion(${questionId})"
                    class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition font-semibold shadow-lg"
                    id="verifyBtn"
                >
                    <i class="fas fa-check mr-2"></i>
                    ${isFreeText ? 'AI判定を実行' : '答え合わせを実行'}
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 答え合わせ実行
async function verifyQuestion(questionId) {
    const question = currentPredictionQuestions.find(q => q.id === questionId);
    const isFreeText = question.answer_type === 'free_text';
    const verifyBtn = document.getElementById('verifyBtn');
    
    if (isFreeText) {
        // 記入式の答え合わせ
        const actualValue = document.getElementById('verifyActualValue').value.trim();
        const useAI = document.getElementById('useAIJudgment')?.checked;
        
        if (!actualValue) {
            alert('実際の答えを入力してください');
            return;
        }
        
        if (!confirm(`本当に答え合わせを実行しますか？\n実際の答え: ${actualValue}\n${useAI ? 'AI柔軟判定: 有効' : 'AI柔軟判定: 無効'}\nこの操作は取り消せません。`)) {
            return;
        }
        
        // ローディング表示
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>判定中...';
        
        try {
            const response = await axios.post(`${ADMIN_API}/prediction/questions/${questionId}/verify`, {
                actual_value: actualValue,
                actual_option: '',
                data_source: 'manual',
                raw_data: JSON.stringify({ 
                    verified_at: new Date().toISOString(),
                    use_ai: useAI
                })
            });
            
            alert(`答え合わせが完了しました！\n${response.data.verified_users}人のユーザーの予測を判定しました。`);
            document.querySelector('.fixed').remove();
            managePredictionQuestions(currentPredictionEvent.id);
            
        } catch (error) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>AI判定を実行';
            alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
        }
        
    } else {
        // 4択の答え合わせ
        const correctAnswer = document.getElementById('verifyCorrectAnswer').value;
        const actualValue = document.getElementById('verifyActualValue').value.trim();
        
        if (!correctAnswer) {
            alert('正解の選択肢を選んでください');
            return;
        }
        
        if (!confirm('本当に答え合わせを実行しますか？\nこの操作は取り消せません。')) {
            return;
        }
        
        try {
            const response = await axios.post(`${ADMIN_API}/prediction/questions/${questionId}/verify`, {
                actual_option: correctAnswer,
                actual_value: actualValue || correctAnswer,
                data_source: 'manual',
                raw_data: JSON.stringify({ verified_at: new Date().toISOString() })
            });
            
            alert(`答え合わせが完了しました！\n${response.data.verified_users}人のユーザーの予測を判定しました。`);
            document.querySelector('.fixed').remove();
            managePredictionQuestions(currentPredictionEvent.id);
            
        } catch (error) {
            alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
        }
    }
}

// イベント編集モーダル
function editEvent(eventId) {
    // イベント情報を取得
    axios.get(`${ADMIN_API}/events`)
        .then(response => {
            const event = response.data.events.find(e => e.id === eventId);
            if (!event) {
                alert('イベントが見つかりません');
                return;
            }
            showEditEventModal(event);
        })
        .catch(error => {
            alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
        });
}

// イベント編集モーダル表示
function showEditEventModal(event) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-edit text-blue-600 mr-2"></i>
                イベント編集
            </h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">イベント名</label>
                    <input 
                        type="text" 
                        id="editEventName" 
                        value="${event.name || ''}"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">説明</label>
                    <textarea 
                        id="editEventDesc" 
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >${event.description || ''}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">開始日時</label>
                        <input 
                            type="datetime-local" 
                            id="editEventStart" 
                            value="${event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ''}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">終了日時</label>
                        <input 
                            type="datetime-local" 
                            id="editEventEnd" 
                            value="${event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ''}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">問題数</label>
                        <input 
                            type="number" 
                            id="editEventQuestions" 
                            value="${event.questions_per_user || 10}"
                            min="1"
                            max="100"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">モード</label>
                        <select 
                            id="editEventMode" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="individual" ${event.mode === 'individual' ? 'selected' : ''}>個人戦</option>
                            <option value="team" ${event.mode === 'team' ? 'selected' : ''}>チーム戦</option>
                            <option value="company" ${event.mode === 'company' ? 'selected' : ''}>企業戦</option>
                        </select>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">クイズ種別</label>
                        <select 
                            id="editEventQuizType" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="async" ${(event.quiz_type || 'async') === 'async' ? 'selected' : ''}>いつでもクイズ</option>
                            <option value="prediction" ${event.quiz_type === 'prediction' ? 'selected' : ''}>クイズ○○後（未来予測型）</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">最低参加人数</label>
                        <input 
                            type="number" 
                            id="editEventMinParticipants" 
                            value="${event.min_participants || 1}"
                            min="1"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div class="flex items-center">
                    <input 
                        type="checkbox" 
                        id="editEventActive" 
                        ${event.is_active ? 'checked' : ''}
                        class="mr-2 h-5 w-5"
                    />
                    <label class="text-sm font-semibold text-gray-700">アクティブ（有効）</label>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="updateEvent(${event.id})"
                    class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                    <i class="fas fa-save mr-2"></i>
                    保存
                </button>
                <button 
                    onclick="deleteEventConfirm(${event.id})"
                    class="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                    <i class="fas fa-trash mr-2"></i>
                    削除
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// イベント更新
async function updateEvent(eventId) {
    const name = document.getElementById('editEventName').value.trim();
    const description = document.getElementById('editEventDesc').value.trim();
    const startDate = document.getElementById('editEventStart').value;
    const endDate = document.getElementById('editEventEnd').value;
    const questionsPerUser = parseInt(document.getElementById('editEventQuestions').value);
    const mode = document.getElementById('editEventMode').value;
    const quizType = document.getElementById('editEventQuizType').value;
    const minParticipants = parseInt(document.getElementById('editEventMinParticipants').value);
    const isActive = document.getElementById('editEventActive').checked;
    
    if (!name) {
        alert('イベント名を入力してください');
        return;
    }
    
    try {
        await axios.put(`${ADMIN_API}/events/${eventId}`, {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            questions_per_user: questionsPerUser,
            mode,
            quiz_type: quizType,
            min_participants: minParticipants,
            is_active: isActive
        });
        
        alert('イベントを更新しました！');
        document.querySelector('.fixed').remove();
        renderView(); // 現在のビューを再描画
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// イベント削除確認
function deleteEventConfirm(eventId) {
    if (!confirm('本当にこのイベントを削除しますか？\nこの操作は取り消せません。')) {
        return;
    }
    
    axios.delete(`${ADMIN_API}/events/${eventId}`)
        .then(() => {
            alert('イベントを削除しました');
            document.querySelector('.fixed').remove();
            renderView();
        })
        .catch(error => {
            alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
        });
}

// 参加者一覧（簡易版）
async function viewPredictionParticipants(eventId) {
    alert('参加者一覧機能は準備中です');
}

// ランキング（簡易版）
async function viewPredictionRanking(eventId) {
    try {
        const response = await axios.get(`/api/prediction/events/${eventId}/ranking`);
        const rankings = response.data.rankings || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="max-w-5xl mx-auto">
                <div class="mb-6">
                    <button 
                        onclick="renderPredictionQuizManagement()"
                        class="text-purple-600 hover:text-purple-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        イベント一覧に戻る
                    </button>
                </div>
                
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-trophy text-yellow-500 mr-2"></i>
                        予測精度ランキング
                    </h2>
                    
                    ${rankings.length > 0 ? `
                        <div class="space-y-3">
                            ${rankings.map((r, i) => {
                                const medalClass = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-300';
                                return `
                                    <div class="flex items-center justify-between p-4 border-2 rounded-lg ${i < 3 ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}">
                                        <div class="flex items-center gap-4">
                                            <span class="text-2xl font-bold ${medalClass}">
                                                ${i + 1}
                                            </span>
                                            <div>
                                                <p class="font-semibold text-gray-800">${r.name || r.user_id}</p>
                                                <p class="text-xs text-gray-500">
                                                    ${r.total_predictions}問予測 | 平均自信度: ${r.avg_confidence.toFixed(1)}/5
                                                </p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-2xl font-bold text-purple-600">${r.accuracy_rate.toFixed(1)}%</p>
                                            <p class="text-xs text-gray-500">${r.correct_predictions}/${r.total_predictions}問正解</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <i class="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-600">まだランキングデータがありません</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// ==================== 問題統計ビュー ====================
async function renderQuestionStats() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i></div>';
    
    try {
        const response = await axios.get(`${ADMIN_API}/classification/stats`);
        const stats = response.data.stats;
        
        // 種別ごとの集計
        const byType = stats.by_type.reduce((acc, item) => {
            acc[item.question_type || 'unclassified'] = item.count;
            return acc;
        }, {});
        
        const typeLabels = {
            entertainment: '🎮 エンタメ系',
            learning: '📚 学習系',
            knowledge: '💡 ナレッジ系',
            history: '🏛️ 社史系',
            unclassified: '❓ 未分類'
        };
        
        const typeColors = {
            entertainment: 'from-pink-500 to-rose-500',
            learning: 'from-blue-500 to-indigo-500',
            knowledge: 'from-green-500 to-emerald-500',
            history: 'from-purple-500 to-violet-500',
            unclassified: 'from-gray-400 to-gray-500'
        };
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-800 mb-8">
                    <i class="fas fa-chart-pie text-purple-600 mr-3"></i>
                    問題統計・分類管理
                </h2>
                
                <!-- 総問題数 -->
                <div class="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-lg mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-purple-100 text-lg mb-2">総問題数</p>
                            <p class="text-6xl font-bold">${stats.total}</p>
                            <p class="text-purple-100 mt-2">
                                <i class="fas fa-check-circle mr-2"></i>
                                アクティブ: ${stats.by_active.find(a => a.is_active === 1)?.count || 0}
                            </p>
                        </div>
                        <div class="text-right">
                            <button 
                                onclick="bulkClassifyQuestions()" 
                                class="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition shadow-md mb-3"
                            >
                                <i class="fas fa-magic mr-2"></i>
                                未分類問題を一括AI分類
                            </button>
                            <p class="text-purple-100 text-sm">
                                ${byType.unclassified || 0}問が未分類
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- 種別ごとの統計 -->
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    ${Object.entries(typeLabels).map(([type, label]) => {
                        const count = byType[type] || 0;
                        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
                        
                        return `
                            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                                <div class="bg-gradient-to-r ${typeColors[type]} p-4">
                                    <h3 class="text-white text-lg font-bold">${label}</h3>
                                </div>
                                <div class="p-6">
                                    <div class="flex items-end justify-between mb-3">
                                        <span class="text-5xl font-bold text-gray-800">${count}</span>
                                        <span class="text-2xl text-gray-500">${percentage}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="bg-gradient-to-r ${typeColors[type]} h-2 rounded-full" style="width: ${percentage}%"></div>
                                    </div>
                                    ${type === 'entertainment' ? `
                                        <p class="text-xs text-gray-500 mt-2">
                                            <i class="fas fa-clock mr-1"></i>
                                            7日後に自動削除
                                        </p>
                                    ` : type === 'unclassified' ? `
                                        <button 
                                            onclick="classifyUnclassifiedQuestions('${type}')" 
                                            class="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm"
                                        >
                                            <i class="fas fa-robot mr-1"></i>
                                            AI分類を実行
                                        </button>
                                    ` : `
                                        <p class="text-xs text-gray-500 mt-2">
                                            <i class="fas fa-infinity mr-1"></i>
                                            永久保持
                                        </p>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- 保持ポリシー別 -->
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-database mr-2 text-blue-600"></i>
                        データ保持ポリシー別
                    </h3>
                    <div class="space-y-3">
                        ${stats.by_retention.map(item => {
                            const policy = item.retention_policy || 'not_set';
                            const policyLabels = {
                                short: '短期（7日）',
                                medium: '中期（30日）',
                                permanent: '永久',
                                not_set: '未設定'
                            };
                            return `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span class="font-semibold text-gray-700">${policyLabels[policy]}</span>
                                    <span class="text-2xl font-bold text-gray-800">${item.count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        contentArea.innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p>エラーが発生しました: ${error.response?.data?.error || error.message}</p>
            </div>
        `;
    }
}

// 一括AI分類
async function bulkClassifyQuestions() {
    if (!confirm('未分類の問題を一括でAI分類しますか？（APIコストがかかります）')) {
        return;
    }
    
    alert('この機能は実装中です。現在は個別の問題作成時にAI分類が可能です。');
}

// ==================== 情報インプットビュー ====================
async function renderKnowledgeImport() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-800 mb-8">
                <i class="fas fa-file-import text-purple-600 mr-3"></i>
                情報インプット → AI問題生成
            </h2>
            
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg mb-8">
                <p class="text-gray-700 mb-4">
                    <i class="fas fa-info-circle text-purple-600 mr-2"></i>
                    社内資料やテキストから、AIが自動でクイズ問題を生成します
                </p>
                <div class="grid md:grid-cols-3 gap-4 text-sm">
                    <div class="bg-white p-4 rounded-lg">
                        <i class="fas fa-file-pdf text-red-500 text-2xl mb-2"></i>
                        <p class="font-semibold">ファイルから生成</p>
                        <p class="text-xs text-gray-600">PDF、テキストファイル</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg">
                        <i class="fas fa-keyboard text-blue-500 text-2xl mb-2"></i>
                        <p class="font-semibold">テキストから生成</p>
                        <p class="text-xs text-gray-600">直接入力した情報</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg">
                        <i class="fas fa-link text-green-500 text-2xl mb-2"></i>
                        <p class="font-semibold">URLから生成</p>
                        <p class="text-xs text-gray-600">Webページの内容</p>
                    </div>
                </div>
            </div>
            
            <!-- インプットフォーム -->
            <div class="bg-white rounded-xl shadow-md p-8">
                <!-- インプット種別選択 -->
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-3">インプット方法</label>
                    <div class="grid grid-cols-3 gap-4">
                        <button 
                            onclick="selectImportType('text')" 
                            id="importTypeText"
                            class="import-type-btn active px-4 py-3 border-2 border-purple-600 bg-purple-50 text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition"
                        >
                            <i class="fas fa-keyboard mr-2"></i>
                            テキスト
                        </button>
                        <button 
                            onclick="selectImportType('file')" 
                            id="importTypeFile"
                            class="import-type-btn px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            <i class="fas fa-file mr-2"></i>
                            ファイル
                        </button>
                        <button 
                            onclick="selectImportType('url')" 
                            id="importTypeUrl"
                            class="import-type-btn px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                        >
                            <i class="fas fa-link mr-2"></i>
                            URL
                        </button>
                    </div>
                </div>
                
                <!-- インプットエリア -->
                <div id="importInputArea" class="mb-6">
                    <!-- テキスト入力 -->
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">情報を入力</label>
                        <textarea 
                            id="importContent" 
                            rows="10"
                            placeholder="例：社内ルール、業務手順、製品情報などを入力してください&#10;&#10;【経費申請について】&#10;経費申請は毎月末日までに提出してください。&#10;交通費は1,000円以上の場合、領収書が必要です。&#10;申請方法は経費システムから行います。"
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        ></textarea>
                    </div>
                </div>
                
                <!-- タイトル -->
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">タイトル</label>
                    <input 
                        type="text" 
                        id="importTitle" 
                        placeholder="例: 経費申請ルール"
                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                </div>
                
                <!-- 問題種別 -->
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">問題種別</label>
                    <select 
                        id="importQuestionType" 
                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                    >
                        <option value="learning">📚 学習系（業務知識、スキル）</option>
                        <option value="knowledge">💡 ナレッジ系（社内情報、手順）</option>
                        <option value="history">🏛️ 社史系（企業歴史、文化）</option>
                    </select>
                </div>
                
                <!-- 生成問題数 -->
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">生成する問題数</label>
                    <select 
                        id="importQuestionCount" 
                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                    >
                        <option value="3">3問</option>
                        <option value="5" selected>5問</option>
                        <option value="10">10問</option>
                        <option value="15">15問</option>
                        <option value="20">20問</option>
                    </select>
                </div>
                
                <!-- イベント選択 -->
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">追加先イベント</label>
                    <select 
                        id="importEventId" 
                        class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500"
                    >
                        <option value="">イベントを選択してください</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">
                        <i class="fas fa-info-circle mr-1"></i>
                        問題を追加するイベントを選択してください
                    </p>
                </div>
                
                <!-- 生成ボタン -->
                <button 
                    onclick="generateQuestionsFromContent()" 
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                >
                    <i class="fas fa-magic mr-2"></i>
                    AI問題生成を実行
                </button>
            </div>
            
            <!-- 生成結果プレビュー -->
            <div id="generatedQuestionsPreview" class="hidden mt-8">
                <!-- ここに生成結果が表示される -->
            </div>
        </div>
    `;
    
    // イベント一覧を読み込み
    try {
        const response = await axios.get(`${ADMIN_API}/events`);
        const events = response.data.events;
        const eventSelect = document.getElementById('importEventId');
        
        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.name}（${event.quiz_type || 'async'}）`;
            eventSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}

// インポート種別選択
let selectedImportType = 'text';

function selectImportType(type) {
    selectedImportType = type;
    
    // ボタンのスタイル更新
    document.querySelectorAll('.import-type-btn').forEach(btn => {
        btn.classList.remove('active', 'border-purple-600', 'bg-purple-50', 'text-purple-700');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });
    
    const selectedBtn = document.getElementById(`importType${type.charAt(0).toUpperCase() + type.slice(1)}`);
    selectedBtn.classList.add('active', 'border-purple-600', 'bg-purple-50', 'text-purple-700');
    selectedBtn.classList.remove('border-gray-300', 'text-gray-700');
    
    // インプットエリアを更新
    const inputArea = document.getElementById('importInputArea');
    
    if (type === 'text') {
        inputArea.innerHTML = `
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">情報を入力</label>
                <textarea 
                    id="importContent" 
                    rows="10"
                    placeholder="例：社内ルール、業務手順、製品情報などを入力してください"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                ></textarea>
            </div>
        `;
    } else if (type === 'file') {
        inputArea.innerHTML = `
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">ファイルをアップロード</label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition cursor-pointer">
                    <input type="file" id="importFile" accept=".txt,.pdf,.doc,.docx" class="hidden" onchange="handleFileSelect(event)"/>
                    <label for="importFile" class="cursor-pointer">
                        <i class="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
                        <p class="text-gray-600 font-semibold">クリックしてファイルを選択</p>
                        <p class="text-xs text-gray-500 mt-2">対応形式: TXT, PDF, DOC, DOCX</p>
                    </label>
                    <div id="filePreview" class="mt-4 hidden">
                        <p class="text-sm text-gray-700"><i class="fas fa-file mr-2"></i><span id="fileName"></span></p>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'url') {
        inputArea.innerHTML = `
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">URLを入力</label>
                <input 
                    type="url" 
                    id="importUrl" 
                    placeholder="https://example.com/article"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
                <p class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-info-circle mr-1"></i>
                    WebページのURLを入力してください（現在は実装中）
                </p>
            </div>
        `;
    }
}

// ファイル選択ハンドラ
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('filePreview').classList.remove('hidden');
        document.getElementById('fileName').textContent = file.name;
        
        // ファイル読み込み（テキストのみ対応）
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                // contentとして保存
                window.fileContent = e.target.result;
            };
            reader.readAsText(file);
        } else {
            alert('現在はテキストファイル（.txt）のみ対応しています');
        }
    }
}

// AI問題生成実行
async function generateQuestionsFromContent() {
    let content = '';
    
    if (selectedImportType === 'text') {
        content = document.getElementById('importContent').value.trim();
    } else if (selectedImportType === 'file') {
        content = window.fileContent || '';
    } else if (selectedImportType === 'url') {
        alert('URL読み込みは現在実装中です');
        return;
    }
    
    const title = document.getElementById('importTitle').value.trim();
    const questionType = document.getElementById('importQuestionType').value;
    const count = parseInt(document.getElementById('importQuestionCount').value);
    const eventId = document.getElementById('importEventId').value;
    
    if (!content) {
        alert('情報を入力してください');
        return;
    }
    
    if (!title) {
        alert('タイトルを入力してください');
        return;
    }
    
    if (!eventId) {
        alert('イベントを選択してください');
        return;
    }
    
    try {
        // ローディング表示
        const previewArea = document.getElementById('generatedQuestionsPreview');
        previewArea.classList.remove('hidden');
        previewArea.innerHTML = `
            <div class="bg-white rounded-xl shadow-md p-8 text-center">
                <i class="fas fa-spinner fa-spin text-6xl text-purple-600 mb-4"></i>
                <p class="text-xl font-bold text-gray-800">AI問題生成中...</p>
                <p class="text-sm text-gray-600 mt-2">約10-20秒かかります</p>
            </div>
        `;
        
        const response = await axios.post(`${ADMIN_API}/knowledge-base/bulk-create`, {
            input_type: selectedImportType,
            content: content,
            title: title,
            question_type: questionType,
            count: count,
            event_id: parseInt(eventId)
        });
        
        const questions = response.data.questions;
        
        // 結果を表示
        previewArea.innerHTML = `
            <div class="bg-white rounded-xl shadow-md p-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-check-circle text-green-600 mr-2"></i>
                        ${questions.length}問を生成しました
                    </h3>
                    <button 
                        onclick="location.reload()" 
                        class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        <i class="fas fa-sync mr-2"></i>
                        さらに生成
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${questions.map((q, i) => `
                        <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                            <p class="font-bold text-gray-800 mb-3">
                                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">Q${i+1}</span>
                                ${q.question_text}
                            </p>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div class="bg-gray-50 p-2 rounded">A. ${q.option_a}</div>
                                <div class="bg-gray-50 p-2 rounded">B. ${q.option_b}</div>
                                <div class="bg-gray-50 p-2 rounded">C. ${q.option_c}</div>
                                <div class="bg-gray-50 p-2 rounded">D. ${q.option_d}</div>
                            </div>
                            <div class="mt-2 text-sm">
                                <span class="text-green-600 font-semibold">正解: ${q.correct_answer}</span>
                                <span class="text-gray-500 ml-4">解説: ${q.detailed_explanation}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 bg-green-50 p-4 rounded-lg">
                    <p class="text-green-800">
                        <i class="fas fa-check mr-2"></i>
                        すべての問題がイベントに追加されました
                    </p>
                </div>
            </div>
        `;
        
    } catch (error) {
        const previewArea = document.getElementById('generatedQuestionsPreview');
        previewArea.classList.remove('hidden');
        previewArea.innerHTML = `
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-600 mb-4"></i>
                <p class="text-xl font-bold text-red-800">エラーが発生しました</p>
                <p class="text-sm text-red-600 mt-2">${error.response?.data?.error || error.message}</p>
            </div>
        `;
    }
}

// ==================== いつでもクイズ用機能 ====================

// いつでもクイズ用イベント作成モーダル
function showCreateAsyncEventModal() {
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7日後
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-clock text-indigo-600 mr-2"></i>
                新規いつでもクイズ作成
            </h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">イベント名</label>
                    <input 
                        type="text" 
                        id="asyncEventName" 
                        placeholder="例: 4月社内クイズ大会"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">説明</label>
                    <textarea 
                        id="asyncEventDesc" 
                        placeholder="例: 今月の社内ナレッジを楽しく学べるクイズです！"
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    ></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">開始日時</label>
                        <input 
                            type="datetime-local" 
                            id="asyncEventStart" 
                            value="${now.toISOString().slice(0, 16)}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">終了日時</label>
                        <input 
                            type="datetime-local" 
                            id="asyncEventEnd" 
                            value="${endDate.toISOString().slice(0, 16)}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">問題数（1人あたり）</label>
                        <input 
                            type="number" 
                            id="asyncEventQuestions" 
                            value="10"
                            min="1"
                            max="100"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">対戦モード</label>
                        <select 
                            id="asyncEventMode" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="individual">個人戦</option>
                            <option value="team">チーム戦</option>
                            <option value="company">企業戦</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">最小参加人数（チーム/企業戦時）</label>
                    <input 
                        type="number" 
                        id="asyncEventMinParticipants" 
                        value="1"
                        min="1"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="createAsyncEvent()"
                    class="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                    <i class="fas fa-check mr-2"></i>
                    作成
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// いつでもクイズイベント作成
async function createAsyncEvent() {
    const name = document.getElementById('asyncEventName').value.trim();
    const description = document.getElementById('asyncEventDesc').value.trim();
    const startDate = document.getElementById('asyncEventStart').value;
    const endDate = document.getElementById('asyncEventEnd').value;
    const questionsPerUser = parseInt(document.getElementById('asyncEventQuestions').value);
    const mode = document.getElementById('asyncEventMode').value;
    const minParticipants = parseInt(document.getElementById('asyncEventMinParticipants').value);
    
    if (!name) {
        alert('イベント名を入力してください');
        return;
    }
    
    try {
        await axios.post(`${ADMIN_API}/events`, {
            name,
            description,
            start_date: startDate,
            end_date: endDate,
            is_active: 1,
            questions_per_user: questionsPerUser,
            mode,
            min_participants: minParticipants,
            quiz_type: 'async'  // いつでもクイズタイプ
        });
        
        alert('イベントを作成しました！');
        document.querySelector('.fixed').remove();
        renderAsyncQuizManagement();
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// いつでもクイズ問題管理
let currentAsyncEvent = null;
let currentAsyncQuestions = [];

async function manageAsyncQuestions(eventId) {
    try {
        // イベント情報を取得
        const eventResponse = await axios.get(`${ADMIN_API}/events`);
        currentAsyncEvent = eventResponse.data.events.find(e => e.id === eventId);
        
        // 問題一覧を取得
        const questionsResponse = await axios.get(`${ADMIN_API}/events/${eventId}/questions`);
        currentAsyncQuestions = questionsResponse.data.questions || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="mb-6">
                    <button 
                        onclick="renderAsyncQuizManagement()"
                        class="text-indigo-600 hover:text-indigo-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        イベント一覧に戻る
                    </button>
                </div>
                
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-question-circle text-indigo-600 mr-2"></i>
                        問題管理：${currentAsyncEvent.name}
                    </h2>
                    <button 
                        onclick="showCreateAsyncQuestionModal()"
                        class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                        <i class="fas fa-plus mr-2"></i>
                        問題を追加
                    </button>
                </div>
                
                ${currentAsyncQuestions.length > 0 ? `
                    <div class="space-y-4">
                        ${currentAsyncQuestions.map((q, i) => `
                            <div class="bg-white p-6 rounded-xl shadow-md">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-2">
                                            <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                問題 ${i + 1}
                                            </span>
                                            <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                問題群 ${q.pool_group}
                                            </span>
                                        </div>
                                        <h3 class="text-lg font-bold text-gray-800 mb-2">${q.question_text}</h3>
                                    </div>
                                    <div class="flex gap-2">
                                        <button 
                                            onclick="editAsyncQuestion(${q.id})"
                                            class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                        >
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            onclick="deleteAsyncQuestion(${q.id})"
                                            class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                        >
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-2 mb-4">
                                    <div class="text-sm ${q.correct_answer === 'A' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-50 text-gray-700'} p-2 rounded">
                                        <span class="font-semibold">A:</span> ${q.option_a}
                                    </div>
                                    <div class="text-sm ${q.correct_answer === 'B' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-50 text-gray-700'} p-2 rounded">
                                        <span class="font-semibold">B:</span> ${q.option_b}
                                    </div>
                                    <div class="text-sm ${q.correct_answer === 'C' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-50 text-gray-700'} p-2 rounded">
                                        <span class="font-semibold">C:</span> ${q.option_c}
                                    </div>
                                    <div class="text-sm ${q.correct_answer === 'D' ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-50 text-gray-700'} p-2 rounded">
                                        <span class="font-semibold">D:</span> ${q.option_d}
                                    </div>
                                </div>
                                
                                <div class="text-sm text-gray-500">
                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                                        正解: ${q.correct_answer}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="bg-white rounded-xl shadow-md p-12 text-center">
                        <i class="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">問題がありません</h3>
                        <p class="text-gray-600 mb-6">最初の問題を作成しましょう</p>
                        <button 
                            onclick="showCreateAsyncQuestionModal()"
                            class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <i class="fas fa-plus mr-2"></i>
                            問題を追加
                        </button>
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// いつでもクイズ問題作成モーダル
function showCreateAsyncQuestionModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 my-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-plus-circle text-indigo-600 mr-2"></i>
                新規問題作成
            </h3>
            
            <div class="space-y-4">
                <!-- 問題文 -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">問題文</label>
                    <textarea 
                        id="asyncQuestionText" 
                        placeholder="問題文を入力してください"
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    ></textarea>
                </div>
                
                <!-- 選択肢 -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 A</label>
                        <input 
                            type="text" 
                            id="asyncOptionA" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 B</label>
                        <input 
                            type="text" 
                            id="asyncOptionB" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 C</label>
                        <input 
                            type="text" 
                            id="asyncOptionC" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 D</label>
                        <input 
                            type="text" 
                            id="asyncOptionD" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <!-- 正解 -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">正解</label>
                        <select 
                            id="asyncCorrectAnswer" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">問題群 (0-9)</label>
                        <input 
                            type="number" 
                            id="asyncPoolGroup" 
                            value="0"
                            min="0"
                            max="9"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <p class="text-xs text-gray-500 mt-1">ユーザーIDの末尾に対応（カンニング防止用）</p>
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="createAsyncQuestion()"
                    class="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                    <i class="fas fa-check mr-2"></i>
                    作成
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 問題作成
async function createAsyncQuestion() {
    const questionText = document.getElementById('asyncQuestionText').value.trim();
    const optionA = document.getElementById('asyncOptionA').value.trim();
    const optionB = document.getElementById('asyncOptionB').value.trim();
    const optionC = document.getElementById('asyncOptionC').value.trim();
    const optionD = document.getElementById('asyncOptionD').value.trim();
    const correctAnswer = document.getElementById('asyncCorrectAnswer').value;
    const poolGroup = parseInt(document.getElementById('asyncPoolGroup').value);
    
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        alert('すべての項目を入力してください');
        return;
    }
    
    try {
        await axios.post(`${ADMIN_API}/events/${currentAsyncEvent.id}/questions`, {
            question_text: questionText,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_answer: correctAnswer,
            pool_group: poolGroup
        });
        
        alert('問題を作成しました！');
        document.querySelector('.fixed').remove();
        manageAsyncQuestions(currentAsyncEvent.id);
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 問題編集
async function editAsyncQuestion(questionId) {
    const question = currentAsyncQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 my-8">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-edit text-blue-600 mr-2"></i>
                問題編集
            </h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">問題文</label>
                    <textarea 
                        id="editAsyncQuestionText" 
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >${question.question_text}</textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 A</label>
                        <input 
                            type="text" 
                            id="editAsyncOptionA" 
                            value="${question.option_a}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 B</label>
                        <input 
                            type="text" 
                            id="editAsyncOptionB" 
                            value="${question.option_b}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 C</label>
                        <input 
                            type="text" 
                            id="editAsyncOptionC" 
                            value="${question.option_c}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選択肢 D</label>
                        <input 
                            type="text" 
                            id="editAsyncOptionD" 
                            value="${question.option_d}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">正解</label>
                        <select 
                            id="editAsyncCorrectAnswer" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="A" ${question.correct_answer === 'A' ? 'selected' : ''}>A</option>
                            <option value="B" ${question.correct_answer === 'B' ? 'selected' : ''}>B</option>
                            <option value="C" ${question.correct_answer === 'C' ? 'selected' : ''}>C</option>
                            <option value="D" ${question.correct_answer === 'D' ? 'selected' : ''}>D</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">問題群 (0-9)</label>
                        <input 
                            type="number" 
                            id="editAsyncPoolGroup" 
                            value="${question.pool_group}"
                            min="0"
                            max="9"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>
            </div>
            
            <div class="flex gap-3 mt-6">
                <button 
                    onclick="updateAsyncQuestion(${questionId})"
                    class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                    <i class="fas fa-save mr-2"></i>
                    保存
                </button>
                <button 
                    onclick="this.closest('.fixed').remove()"
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                    キャンセル
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 問題更新
async function updateAsyncQuestion(questionId) {
    const questionText = document.getElementById('editAsyncQuestionText').value.trim();
    const optionA = document.getElementById('editAsyncOptionA').value.trim();
    const optionB = document.getElementById('editAsyncOptionB').value.trim();
    const optionC = document.getElementById('editAsyncOptionC').value.trim();
    const optionD = document.getElementById('editAsyncOptionD').value.trim();
    const correctAnswer = document.getElementById('editAsyncCorrectAnswer').value;
    const poolGroup = parseInt(document.getElementById('editAsyncPoolGroup').value);
    
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        alert('すべての項目を入力してください');
        return;
    }
    
    try {
        await axios.put(`${ADMIN_API}/questions/${questionId}`, {
            question_text: questionText,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_answer: correctAnswer,
            pool_group: poolGroup
        });
        
        alert('問題を更新しました！');
        document.querySelector('.fixed').remove();
        manageAsyncQuestions(currentAsyncEvent.id);
        
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 問題削除
async function deleteAsyncQuestion(questionId) {
    if (!confirm('この問題を削除しますか？')) {
        return;
    }
    
    try {
        await axios.delete(`${ADMIN_API}/questions/${questionId}`);
        alert('問題を削除しました');
        manageAsyncQuestions(currentAsyncEvent.id);
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 参加者一覧
async function viewAsyncParticipants(eventId) {
    try {
        const response = await axios.get(`${ADMIN_API}/events/${eventId}/participants`);
        const participants = response.data.participants || [];
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `
            <div class="max-w-5xl mx-auto">
                <div class="mb-6">
                    <button 
                        onclick="renderAsyncQuizManagement()"
                        class="text-indigo-600 hover:text-indigo-800 transition"
                    >
                        <i class="fas fa-arrow-left mr-2"></i>
                        イベント一覧に戻る
                    </button>
                </div>
                
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">
                        <i class="fas fa-users text-purple-500 mr-2"></i>
                        参加者一覧
                    </h2>
                    
                    ${participants.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b-2 border-gray-200">
                                        <th class="text-left p-3 font-semibold text-gray-700">ユーザーID</th>
                                        <th class="text-left p-3 font-semibold text-gray-700">名前</th>
                                        <th class="text-left p-3 font-semibold text-gray-700">チーム</th>
                                        <th class="text-left p-3 font-semibold text-gray-700">スコア</th>
                                        <th class="text-left p-3 font-semibold text-gray-700">回答時間</th>
                                        <th class="text-left p-3 font-semibold text-gray-700">完了日時</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${participants.map(p => `
                                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                                            <td class="p-3 font-mono text-sm">${p.user_id}</td>
                                            <td class="p-3">${p.name || '-'}</td>
                                            <td class="p-3">${p.team_name || '-'}</td>
                                            <td class="p-3 font-bold ${p.score >= 7 ? 'text-green-600' : p.score >= 4 ? 'text-yellow-600' : 'text-red-600'}">${p.score}点</td>
                                            <td class="p-3">${p.answer_duration}秒</td>
                                            <td class="p-3 text-sm text-gray-500">${p.completed_at ? new Date(p.completed_at).toLocaleString('ja-JP') : '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-600">まだ参加者がいません</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    } catch (error) {
        alert('エラーが発生しました: ' + (error.response?.data?.error || error.message));
    }
}

// 統計表示
async function viewAsyncStats(eventId) {
    alert('統計機能は準備中です');
}

// ==================== 分析イメージデモ画面 ====================

async function renderAnalysisDemo() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>';
    
    try {
        // コミュニケーション情報とナレッジを取得
        const [personsResponse, knowledgeResponse, conversationResponse] = await Promise.all([
            axios.get('/api/communication/persons'),
            axios.get(`${ADMIN_API}/knowledge`),
            axios.get('/api/communication/conversation-starters')
        ]);
        
        const persons = personsResponse.data.persons || [];
        const knowledge = knowledgeResponse.data.knowledge || [];
        const conversationStarters = conversationResponse.data.starters || [];
        
        // カテゴリごとにナレッジを分類
        const companyHistory = knowledge.filter(k => k.category === 'company_history');
        const knowledgeItems = knowledge.filter(k => k.category === 'knowledge');
        const communicationItems = knowledge.filter(k => k.category === 'communication');
        const complianceItems = knowledge.filter(k => k.category === 'compliance');
        
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-3xl font-bold text-gray-800">
                        <i class="fas fa-lightbulb text-yellow-500 mr-3"></i>
                        分析イメージ（プロトタイプデモ）
                    </h2>
                    <button 
                        onclick="runOrganizationAnalysis()"
                        class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                    >
                        <i class="fas fa-brain mr-2"></i>
                        組織全体をAI分析
                    </button>
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                    <p class="text-yellow-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        <strong>このページは仮説ベースのサンプルデータです。</strong>
                        クイズ回答結果から分析すると、このような情報が蓄積・活用できるイメージをお見せしています。
                        各項目をクリックすると詳細が見られます。
                    </p>
                </div>
                
                <!-- タブナビゲーション -->
                <div class="flex space-x-2 mb-6 border-b border-gray-200 pb-2">
                    <button onclick="showAnalysisTab('communication')" class="analysis-tab active px-4 py-2 rounded-t-lg bg-purple-100 text-purple-800 font-semibold">
                        <i class="fas fa-users mr-2"></i>コミュニケーション情報
                    </button>
                    <button onclick="showAnalysisTab('history')" class="analysis-tab px-4 py-2 rounded-t-lg hover:bg-gray-100">
                        <i class="fas fa-landmark mr-2"></i>社史
                    </button>
                    <button onclick="showAnalysisTab('knowledge')" class="analysis-tab px-4 py-2 rounded-t-lg hover:bg-gray-100">
                        <i class="fas fa-book mr-2"></i>ナレッジ
                    </button>
                    <button onclick="showAnalysisTab('compliance')" class="analysis-tab px-4 py-2 rounded-t-lg hover:bg-gray-100">
                        <i class="fas fa-shield-alt mr-2"></i>コンプライアンス
                    </button>
                </div>
                
                <!-- コミュニケーション情報タブ -->
                <div id="tab-communication" class="analysis-content">
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-magic text-purple-600 mr-2"></i>
                            クイズ結果から見えてくるもの
                        </h3>
                        <p class="text-gray-700 mb-4">
                            「田中君は何を食べるでしょう？」→ 正解は「ラーメン」<br>
                            このようなクイズの答え合わせを繰り返すことで、以下のような情報が自動的に蓄積されます：
                        </p>
                        <div class="grid md:grid-cols-3 gap-4">
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <div class="text-4xl font-bold text-purple-600 mb-2">${persons.length}</div>
                                <div class="text-sm text-gray-600">人物プロフィール</div>
                            </div>
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <div class="text-4xl font-bold text-pink-600 mb-2">${conversationStarters.length}+</div>
                                <div class="text-sm text-gray-600">会話のきっかけ</div>
                            </div>
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <div class="text-4xl font-bold text-indigo-600 mb-2">∞</div>
                                <div class="text-sm text-gray-600">コミュニケーション促進</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 人物プロフィール一覧 -->
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-user-circle text-purple-600 mr-2"></i>
                        蓄積された人物プロフィール
                    </h4>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        ${persons.map(person => `
                            <div class="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition cursor-pointer" onclick="showPersonDetail(${person.id})">
                                <div class="flex items-center mb-3">
                                    <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        ${person.name.charAt(0)}
                                    </div>
                                    <div class="ml-3">
                                        <h5 class="font-bold text-gray-800">${person.name}さん</h5>
                                        <p class="text-sm text-gray-500">${person.department}</p>
                                    </div>
                                </div>
                                <div class="flex items-center text-sm text-gray-600">
                                    <span class="mr-4">
                                        <i class="fas fa-tag text-purple-400 mr-1"></i>
                                        特性 ${person.trait_count}件
                                    </span>
                                    <span>
                                        <i class="fas fa-lightbulb text-yellow-400 mr-1"></i>
                                        洞察 ${person.insight_count}件
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 会話のきっかけ提案 -->
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-comments text-pink-600 mr-2"></i>
                        会話のきっかけ提案（自動生成）
                    </h4>
                    <div class="bg-white rounded-xl shadow-md p-6 mb-8">
                        <p class="text-gray-600 mb-4">
                            蓄積されたプロフィール情報から、AIが会話のきっかけを提案します。
                            「この人と話したいけど何を話せばいいかわからない」という場面で活用できます。
                        </p>
                        <div class="space-y-4">
                            ${conversationStarters.slice(0, 5).map(starter => `
                                <div class="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r-lg">
                                    <div class="flex items-center mb-2">
                                        <span class="bg-purple-600 text-white px-2 py-1 rounded text-sm font-semibold mr-2">
                                            ${starter.personName}さんへ
                                        </span>
                                        <span class="text-xs text-gray-500">${starter.topic}</span>
                                    </div>
                                    <p class="text-gray-800 font-medium">"${starter.suggestedOpener}"</p>
                                    <p class="text-xs text-gray-500 mt-1">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        ${starter.description}
                                    </p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- データ蓄積の仕組み説明 -->
                    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                        <h4 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-database text-indigo-600 mr-2"></i>
                            データ蓄積の仕組み
                        </h4>
                        <div class="grid md:grid-cols-4 gap-4">
                            <div class="bg-white p-4 rounded-lg text-center">
                                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <i class="fas fa-question text-blue-600 text-xl"></i>
                                </div>
                                <p class="font-semibold text-sm">1. クイズ出題</p>
                                <p class="text-xs text-gray-500">「田中君のランチは？」</p>
                            </div>
                            <div class="bg-white p-4 rounded-lg text-center">
                                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <i class="fas fa-check text-green-600 text-xl"></i>
                                </div>
                                <p class="font-semibold text-sm">2. 答え合わせ</p>
                                <p class="text-xs text-gray-500">正解「ラーメン」を登録</p>
                            </div>
                            <div class="bg-white p-4 rounded-lg text-center">
                                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <i class="fas fa-layer-group text-purple-600 text-xl"></i>
                                </div>
                                <p class="font-semibold text-sm">3. 特性蓄積</p>
                                <p class="text-xs text-gray-500">田中+ランチ+ラーメン</p>
                            </div>
                            <div class="bg-white p-4 rounded-lg text-center">
                                <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <i class="fas fa-lightbulb text-yellow-600 text-xl"></i>
                                </div>
                                <p class="font-semibold text-sm">4. 洞察生成</p>
                                <p class="text-xs text-gray-500">「ラーメン好き」を自動認識</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 社史タブ -->
                <div id="tab-history" class="analysis-content hidden">
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-landmark text-amber-600 mr-2"></i>
                            社史・会社の歴史
                        </h3>
                        <p class="text-gray-700">
                            クイズを通じて社員が会社の歴史を学び、認知度を測定できます。
                            どの項目が知られていないかを可視化し、社内教育に活用できます。
                        </p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        ${companyHistory.map(item => `
                            <div class="bg-white rounded-xl shadow-md p-5 hover:shadow-lg hover:border-amber-300 border-2 border-transparent transition cursor-pointer" onclick="showKnowledgeDetail(${item.id}, 'company_history')">
                                <div class="flex items-center justify-between mb-3">
                                    <h5 class="font-bold text-gray-800">${item.title}</h5>
                                    <span class="text-xs px-2 py-1 rounded-full ${item.recognition_rate >= 70 ? 'bg-green-100 text-green-800' : item.recognition_rate >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                        認知率 ${item.recognition_rate}%
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.content || '内容が登録されていません'}</p>
                                <div class="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                                        価値スコア: ${item.value_score}/5
                                    </span>
                                    <span class="text-amber-600"><i class="fas fa-arrow-right"></i> 詳細を見る</span>
                                </div>
                            </div>
                        `).join('') || '<p class="text-gray-500 col-span-2 text-center py-8">社史データがありません</p>'}
                    </div>
                </div>
                
                <!-- ナレッジタブ -->
                <div id="tab-knowledge" class="analysis-content hidden">
                    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-book text-blue-600 mr-2"></i>
                            業務ナレッジ
                        </h3>
                        <p class="text-gray-700">
                            社内ルール、業務手順、システムの使い方など、業務に必要な知識をクイズ化。
                            正答率から「周知が必要な項目」を特定できます。
                        </p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        ${knowledgeItems.map(item => `
                            <div class="bg-white rounded-xl shadow-md p-5 hover:shadow-lg hover:border-blue-300 border-2 border-transparent transition cursor-pointer" onclick="showKnowledgeDetail(${item.id}, 'knowledge')">
                                <div class="flex items-center justify-between mb-3">
                                    <h5 class="font-bold text-gray-800">${item.title}</h5>
                                    <span class="text-xs px-2 py-1 rounded-full ${item.recognition_rate >= 70 ? 'bg-green-100 text-green-800' : item.recognition_rate >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                        正答率 ${item.recognition_rate}%
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.content || '内容が登録されていません'}</p>
                                <div class="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                                        重要度: ${item.value_score}/5
                                        ${item.recognition_rate < 60 ? '<span class="text-red-600 font-semibold ml-2"><i class="fas fa-exclamation-triangle mr-1"></i>要周知</span>' : ''}
                                    </span>
                                    <span class="text-blue-600"><i class="fas fa-arrow-right"></i> 詳細を見る</span>
                                </div>
                            </div>
                        `).join('') || '<p class="text-gray-500 col-span-2 text-center py-8">ナレッジデータがありません</p>'}
                    </div>
                </div>
                
                <!-- コンプライアンスタブ -->
                <div id="tab-compliance" class="analysis-content hidden">
                    <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 mb-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-shield-alt text-red-600 mr-2"></i>
                            コンプライアンス
                        </h3>
                        <p class="text-gray-700">
                            セキュリティ、個人情報保護、社内規則など、コンプライアンスに関する知識の定着度を測定。
                            低い項目は研修などの対策が必要です。
                        </p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        ${complianceItems.map(item => `
                            <div class="bg-white rounded-xl shadow-md p-5 border-l-4 ${item.recognition_rate >= 80 ? 'border-green-500' : item.recognition_rate >= 60 ? 'border-yellow-500' : 'border-red-500'} hover:shadow-lg transition cursor-pointer" onclick="showKnowledgeDetail(${item.id}, 'compliance')">
                                <div class="flex items-center justify-between mb-3">
                                    <h5 class="font-bold text-gray-800">${item.title}</h5>
                                    <span class="text-xs px-2 py-1 rounded-full ${item.recognition_rate >= 80 ? 'bg-green-100 text-green-800' : item.recognition_rate >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                        理解度 ${item.recognition_rate}%
                                    </span>
                                </div>
                                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${item.content || '内容が登録されていません'}</p>
                                <div class="flex items-center justify-between text-xs text-gray-500">
                                    <span class="${item.recognition_rate < 80 ? 'text-red-600 font-semibold' : 'text-green-600'}">
                                        ${item.recognition_rate < 80 ? '<i class="fas fa-exclamation-circle mr-1"></i>研修推奨' : '<i class="fas fa-check-circle mr-1"></i>良好'}
                                    </span>
                                    <span class="text-red-600"><i class="fas fa-arrow-right"></i> 詳細を見る</span>
                                </div>
                            </div>
                        `).join('') || '<p class="text-gray-500 col-span-2 text-center py-8">コンプライアンスデータがありません</p>'}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        contentArea.innerHTML = `
            <div class="bg-red-50 p-6 rounded-xl text-center">
                <i class="fas fa-exclamation-triangle text-red-600 text-4xl mb-4"></i>
                <p class="text-red-800">データの取得に失敗しました: ${error.message}</p>
            </div>
        `;
    }
}

// 分析タブ切り替え
function showAnalysisTab(tabName) {
    // すべてのタブコンテンツを非表示
    document.querySelectorAll('.analysis-content').forEach(el => el.classList.add('hidden'));
    // すべてのタブボタンを非アクティブ
    document.querySelectorAll('.analysis-tab').forEach(el => {
        el.classList.remove('active', 'bg-purple-100', 'text-purple-800', 'font-semibold');
    });
    
    // 選択されたタブを表示
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // ボタンをアクティブに
    event.target.classList.add('active', 'bg-purple-100', 'text-purple-800', 'font-semibold');
}

// 人物詳細表示
async function showPersonDetail(personId) {
    try {
        const response = await axios.get(`/api/communication/persons/${personId}`);
        const person = response.data;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 my-8">
                <div class="flex items-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        ${person.profile.name.charAt(0)}
                    </div>
                    <div class="ml-4">
                        <h3 class="text-2xl font-bold text-gray-800">${person.profile.name}さん</h3>
                        <p class="text-gray-500">${person.profile.department}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="ml-auto text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                ${person.traits && person.traits.length > 0 ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-700 mb-3">
                            <i class="fas fa-tags text-purple-500 mr-2"></i>
                            蓄積された特性
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${person.traits.map(trait => `
                                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                    ${trait.category}: ${trait.value}
                                    <span class="text-xs text-purple-500 ml-1">(${trait.occurrence_count}回)</span>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${person.insights && person.insights.length > 0 ? `
                    <div>
                        <h4 class="font-bold text-gray-700 mb-3">
                            <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                            洞察・会話のヒント
                        </h4>
                        <div class="space-y-3">
                            ${person.insights.map(insight => `
                                <div class="bg-yellow-50 p-4 rounded-lg">
                                    <div class="font-semibold text-gray-800 mb-1">${insight.title}</div>
                                    <p class="text-sm text-gray-600 mb-2">${insight.description}</p>
                                    ${insight.conversation_hints ? `
                                        <div class="text-xs text-gray-500">
                                            <strong>会話例:</strong>
                                            ${JSON.parse(insight.conversation_hints).map(hint => `"${hint}"`).join(', ')}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        alert('詳細の取得に失敗しました: ' + error.message);
    }
}

// ==================== AI分析機能 ====================

// 組織全体のAI分析を実行
async function runOrganizationAnalysis() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-brain text-indigo-600 mr-2"></i>
                    組織分析レポート（AI生成デモ）
                </h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div id="ai-analysis-content">
                <div class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-6xl text-indigo-600 mb-4"></i>
                    <p class="text-xl text-gray-600">AI分析を実行中...</p>
                    <p class="text-sm text-gray-500 mt-2">蓄積されたデータから組織の傾向を分析しています</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // デモ用の遅延（実際はAPIコールに置き換え）
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // AI分析結果（デモ用のサンプル）
    const analysisContent = document.getElementById('ai-analysis-content');
    analysisContent.innerHTML = `
        <div class="space-y-6">
            <!-- サマリー -->
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4">
                    <i class="fas fa-chart-pie text-indigo-600 mr-2"></i>
                    エグゼクティブサマリー
                </h4>
                <p class="text-gray-700 leading-relaxed">
                    組織全体の分析結果から、<strong>コミュニケーション活性化の余地</strong>が見られます。
                    特にランチタイムを中心とした交流機会の創出が効果的と考えられます。
                    また、業務知識の定着率に部署間で差があり、特に<strong>リモートワーク規定</strong>と
                    <strong>備品購入フロー</strong>の周知強化が推奨されます。
                </p>
            </div>
            
            <!-- コミュニケーション傾向 -->
            <div class="bg-white border-2 border-purple-200 rounded-xl p-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4">
                    <i class="fas fa-users text-purple-600 mr-2"></i>
                    コミュニケーション傾向分析
                </h4>
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="text-3xl font-bold text-purple-600 mb-1">68%</div>
                        <div class="text-sm text-gray-600">ランチ関連の話題</div>
                        <div class="text-xs text-gray-500 mt-1">食事の好みが最も把握しやすい</div>
                    </div>
                    <div class="bg-pink-50 p-4 rounded-lg">
                        <div class="text-3xl font-bold text-pink-600 mb-1">24%</div>
                        <div class="text-sm text-gray-600">趣味・休日の話題</div>
                        <div class="text-xs text-gray-500 mt-1">登山、ヨガなどの共通趣味</div>
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-700">
                        <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        <strong>AIの提案:</strong> 
                        「ラーメン好き」「カレー好き」など食の好みが共通する社員同士のランチ会を企画すると、
                        部署を超えた交流が生まれやすいでしょう。特に田中さん(営業部)と佐藤さん(開発部)は
                        食への関心が高く、キーパーソンになりえます。
                    </p>
                </div>
            </div>
            
            <!-- ナレッジ定着分析 -->
            <div class="bg-white border-2 border-blue-200 rounded-xl p-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4">
                    <i class="fas fa-book text-blue-600 mr-2"></i>
                    ナレッジ定着度分析
                </h4>
                <div class="space-y-3">
                    <div class="flex items-center">
                        <span class="w-32 text-sm text-gray-600">経費精算</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                            <div class="bg-green-500 h-4 rounded-full" style="width: 92%"></div>
                        </div>
                        <span class="text-sm font-bold text-green-600">92%</span>
                    </div>
                    <div class="flex items-center">
                        <span class="w-32 text-sm text-gray-600">有給休暇</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                            <div class="bg-green-500 h-4 rounded-full" style="width: 88%"></div>
                        </div>
                        <span class="text-sm font-bold text-green-600">88%</span>
                    </div>
                    <div class="flex items-center">
                        <span class="w-32 text-sm text-gray-600">会議室予約</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                            <div class="bg-yellow-500 h-4 rounded-full" style="width: 75%"></div>
                        </div>
                        <span class="text-sm font-bold text-yellow-600">75%</span>
                    </div>
                    <div class="flex items-center">
                        <span class="w-32 text-sm text-gray-600">リモートワーク</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                            <div class="bg-yellow-500 h-4 rounded-full" style="width: 70%"></div>
                        </div>
                        <span class="text-sm font-bold text-yellow-600">70%</span>
                    </div>
                    <div class="flex items-center">
                        <span class="w-32 text-sm text-gray-600">備品購入</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-4 mx-3">
                            <div class="bg-red-500 h-4 rounded-full" style="width: 60%"></div>
                        </div>
                        <span class="text-sm font-bold text-red-600">60%</span>
                    </div>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg mt-4">
                    <p class="text-sm text-gray-700">
                        <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                        <strong>要対応:</strong> 
                        「備品購入フロー」「リモートワーク規定」の認知率が低めです。
                        次回の全体ミーティングでの周知、またはSlackでの定期リマインドを推奨します。
                    </p>
                </div>
            </div>
            
            <!-- 社史認知度 -->
            <div class="bg-white border-2 border-amber-200 rounded-xl p-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4">
                    <i class="fas fa-landmark text-amber-600 mr-2"></i>
                    社史認知度分析
                </h4>
                <div class="grid md:grid-cols-3 gap-4 mb-4">
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">82%</div>
                        <div class="text-xs text-gray-600">社名の由来</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">78%</div>
                        <div class="text-xs text-gray-600">創業の原点</div>
                    </div>
                    <div class="text-center p-4 bg-yellow-50 rounded-lg">
                        <div class="text-2xl font-bold text-yellow-600">65%</div>
                        <div class="text-xs text-gray-600">上場への道のり</div>
                    </div>
                </div>
                <p class="text-sm text-gray-600">
                    <i class="fas fa-info-circle text-blue-500 mr-1"></i>
                    新入社員の入社タイミングに合わせて社史クイズを実施すると、帰属意識の向上に効果的です。
                </p>
            </div>
            
            <!-- アクションプラン -->
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4">
                    <i class="fas fa-tasks text-green-600 mr-2"></i>
                    推奨アクションプラン
                </h4>
                <div class="space-y-3">
                    <div class="flex items-start bg-white p-3 rounded-lg">
                        <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mr-3">優先</span>
                        <div>
                            <p class="font-semibold text-gray-800">備品購入フローの再周知</p>
                            <p class="text-sm text-gray-600">認知率60%は業務支障の可能性あり。動画マニュアル作成を推奨。</p>
                        </div>
                    </div>
                    <div class="flex items-start bg-white p-3 rounded-lg">
                        <span class="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded mr-3">推奨</span>
                        <div>
                            <p class="font-semibold text-gray-800">部署横断ランチ会の実施</p>
                            <p class="text-sm text-gray-600">食の好みデータを活用し、月1回のシャッフルランチを企画。</p>
                        </div>
                    </div>
                    <div class="flex items-start bg-white p-3 rounded-lg">
                        <span class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded mr-3">検討</span>
                        <div>
                            <p class="font-semibold text-gray-800">趣味サークルの活性化支援</p>
                            <p class="text-sm text-gray-600">朝ヨガ部、登山好きグループなど、共通趣味での交流促進。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
            <button onclick="alert('PDF出力機能は準備中です')" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
                <i class="fas fa-file-pdf mr-2"></i>
                PDF出力
            </button>
            <button onclick="this.closest('.fixed').remove()" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                閉じる
            </button>
        </div>
    `;
}

// ナレッジ詳細表示
async function showKnowledgeDetail(knowledgeId, category) {
    // まずAPI呼び出し前にモーダルを表示
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 my-8">
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
                <p class="text-gray-600">読み込み中...</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    try {
        const response = await axios.get(`${ADMIN_API}/knowledge/${knowledgeId}`);
        const item = response.data.knowledge;
        
        // カテゴリ別の色とアイコン
        const categoryConfig = {
            company_history: { color: 'amber', icon: 'fa-landmark', label: '社史' },
            knowledge: { color: 'blue', icon: 'fa-book', label: '業務ナレッジ' },
            communication: { color: 'purple', icon: 'fa-users', label: 'コミュニケーション' },
            compliance: { color: 'red', icon: 'fa-shield-alt', label: 'コンプライアンス' }
        };
        const config = categoryConfig[item.category] || categoryConfig.knowledge;
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-${config.color}-100 rounded-full flex items-center justify-center mr-4">
                            <i class="fas ${config.icon} text-${config.color}-600 text-xl"></i>
                        </div>
                        <div>
                            <span class="text-xs bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded">${config.label}</span>
                            <h3 class="text-2xl font-bold text-gray-800 mt-1">${item.title}</h3>
                        </div>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <!-- 認知率バー -->
                <div class="bg-gray-50 rounded-xl p-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-semibold text-gray-700">認知率（正答率）</span>
                        <span class="text-2xl font-bold ${item.recognition_rate >= 70 ? 'text-green-600' : item.recognition_rate >= 50 ? 'text-yellow-600' : 'text-red-600'}">${item.recognition_rate || 0}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="h-4 rounded-full ${item.recognition_rate >= 70 ? 'bg-green-500' : item.recognition_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}" style="width: ${item.recognition_rate || 0}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>
                
                <!-- コンテンツ -->
                <div class="mb-6">
                    <h4 class="font-bold text-gray-700 mb-3">
                        <i class="fas fa-align-left text-gray-400 mr-2"></i>
                        内容
                    </h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${item.content}</p>
                    </div>
                </div>
                
                <!-- メタ情報 -->
                <div class="grid md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-gray-50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 mb-1">重要度スコア</div>
                        <div class="text-xl font-bold text-gray-800">
                            ${'★'.repeat(item.value_score || 0)}${'☆'.repeat(5 - (item.value_score || 0))}
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 mb-1">ステータス</div>
                        <div class="text-sm font-semibold ${item.status === 'published' ? 'text-green-600' : 'text-gray-600'}">
                            ${item.status === 'published' ? '公開中' : item.status === 'review' ? 'レビュー待ち' : '下書き'}
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg text-center">
                        <div class="text-xs text-gray-500 mb-1">登録日</div>
                        <div class="text-sm text-gray-700">${new Date(item.created_at).toLocaleDateString('ja-JP')}</div>
                    </div>
                </div>
                
                <!-- AI分析セクション -->
                <div class="border-t pt-6">
                    <h4 class="font-bold text-gray-700 mb-3">
                        <i class="fas fa-robot text-indigo-500 mr-2"></i>
                        AI分析・提案
                    </h4>
                    <div id="ai-knowledge-analysis-${knowledgeId}" class="bg-indigo-50 p-4 rounded-lg">
                        <button onclick="runKnowledgeAIAnalysis(${knowledgeId}, '${item.title}', ${item.recognition_rate || 0})" class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                            <i class="fas fa-magic mr-2"></i>
                            このナレッジをAI分析
                        </button>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4">
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <p class="text-red-600">データの取得に失敗しました</p>
                    <button onclick="this.closest('.fixed').remove()" class="mt-4 bg-gray-200 px-6 py-2 rounded-lg">閉じる</button>
                </div>
            </div>
        `;
    }
}

// ナレッジのAI分析
async function runKnowledgeAIAnalysis(knowledgeId, title, recognitionRate) {
    const container = document.getElementById(`ai-knowledge-analysis-${knowledgeId}`);
    container.innerHTML = `
        <div class="text-center py-4">
            <i class="fas fa-spinner fa-spin text-2xl text-indigo-600 mb-2"></i>
            <p class="text-sm text-gray-600">AI分析中...</p>
        </div>
    `;
    
    // デモ用の遅延
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 認知率に応じた分析結果を生成
    let analysis = '';
    if (recognitionRate >= 80) {
        analysis = `
            <div class="space-y-3">
                <div class="flex items-start">
                    <span class="bg-green-500 text-white text-xs px-2 py-1 rounded mr-2">良好</span>
                    <p class="text-sm text-gray-700">「${title}」は組織内で十分に認知されています。現状の周知方法が効果的です。</p>
                </div>
                <div class="bg-white p-3 rounded-lg">
                    <p class="text-xs text-gray-600">
                        <strong>💡 提案:</strong> この項目をベストプラクティスとして、他の低認知率項目の周知方法の参考にしてください。
                        また、定期的なリマインドで認知率を維持することを推奨します。
                    </p>
                </div>
            </div>
        `;
    } else if (recognitionRate >= 60) {
        analysis = `
            <div class="space-y-3">
                <div class="flex items-start">
                    <span class="bg-yellow-500 text-white text-xs px-2 py-1 rounded mr-2">要注意</span>
                    <p class="text-sm text-gray-700">「${title}」の認知率は平均的ですが、改善の余地があります。</p>
                </div>
                <div class="bg-white p-3 rounded-lg">
                    <p class="text-xs text-gray-600">
                        <strong>💡 提案:</strong> 
                        ① Slackでの定期リマインド（月1回）<br>
                        ② 関連業務の発生タイミングでのポップアップ通知<br>
                        ③ クイズ形式での再出題で記憶定着を促進
                    </p>
                </div>
            </div>
        `;
    } else {
        analysis = `
            <div class="space-y-3">
                <div class="flex items-start">
                    <span class="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2">要対応</span>
                    <p class="text-sm text-gray-700">「${title}」の認知率が低く、業務に支障が出る可能性があります。</p>
                </div>
                <div class="bg-white p-3 rounded-lg">
                    <p class="text-xs text-gray-600">
                        <strong>💡 緊急提案:</strong> 
                        ① 全体ミーティングでの説明（次回推奨）<br>
                        ② 動画マニュアルの作成と共有<br>
                        ③ FAQ形式でのまとめ資料配布<br>
                        ④ 部署ごとの担当者を設けてフォローアップ
                    </p>
                </div>
                <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p class="text-xs text-red-700">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <strong>リスク:</strong> この項目の低認知は、業務ミスや非効率につながる可能性があります。
                        早急な対応を推奨します。
                    </p>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = analysis;
}

// 人物のAI分析
async function runPersonAIAnalysis(personId, personName) {
    const container = document.getElementById(`ai-person-analysis-${personId}`);
    if (!container) return;
    
    container.innerHTML = `
        <div class="text-center py-4">
            <i class="fas fa-spinner fa-spin text-2xl text-purple-600 mb-2"></i>
            <p class="text-sm text-gray-600">${personName}さんのデータを分析中...</p>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // デモ用の分析結果（実際はAPIで生成）
    const analyses = {
        '田中': `
            <div class="space-y-3">
                <div class="bg-purple-100 p-3 rounded-lg">
                    <p class="font-semibold text-purple-800 mb-1">🍜 グルメ志向タイプ</p>
                    <p class="text-sm text-gray-700">食への関心が高く、特にラーメンへのこだわりが見られます。ランチタイムの会話のきっかけとして効果的です。</p>
                </div>
                <div class="bg-white p-3 rounded-lg border">
                    <p class="text-sm text-gray-600">
                        <strong>コミュニケーション戦略:</strong><br>
                        ・ランチのお誘いが効果的（12:30頃がベスト）<br>
                        ・新しいラーメン店の情報共有で関係構築<br>
                        ・グルメ系のSlackチャンネルへの招待推奨
                    </p>
                </div>
            </div>
        `,
        '山田': `
            <div class="space-y-3">
                <div class="bg-green-100 p-3 rounded-lg">
                    <p class="font-semibold text-green-800 mb-1">🏔️ アクティブ派リーダー</p>
                    <p class="text-sm text-gray-700">早起き習慣と登山趣味から、規律正しく行動力のあるタイプ。部下との1on1を重視する姿勢あり。</p>
                </div>
                <div class="bg-white p-3 rounded-lg border">
                    <p class="text-sm text-gray-600">
                        <strong>コミュニケーション戦略:</strong><br>
                        ・朝の時間帯（7:00-8:00）が話しやすい<br>
                        ・アウトドア系の話題で親近感UP<br>
                        ・結論から話す簡潔なコミュニケーションを好む傾向
                    </p>
                </div>
            </div>
        `,
        '佐藤': `
            <div class="space-y-3">
                <div class="bg-blue-100 p-3 rounded-lg">
                    <p class="font-semibold text-blue-800 mb-1">💻 テクノロジー×グルメ</p>
                    <p class="text-sm text-gray-700">技術への探究心が高く、カレーへの情熱も。知識共有に積極的で、勉強会の主催者。</p>
                </div>
                <div class="bg-white p-3 rounded-lg border">
                    <p class="text-sm text-gray-600">
                        <strong>コミュニケーション戦略:</strong><br>
                        ・技術的な質問は歓迎される傾向<br>
                        ・勉強会への参加で関係構築<br>
                        ・カレー屋の情報交換も効果的
                    </p>
                </div>
            </div>
        `
    };
    
    container.innerHTML = analyses[personName] || `
        <div class="bg-gray-100 p-3 rounded-lg">
            <p class="text-sm text-gray-600">
                <i class="fas fa-info-circle mr-1"></i>
                データが蓄積されると、AIが傾向を分析して最適なコミュニケーション方法を提案します。
            </p>
        </div>
    `;
}
