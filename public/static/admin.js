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
                        onclick="alert('イベント作成機能は準備中です')"
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
                                            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                                                <i class="fas fa-edit mr-1"></i>
                                                編集
                                            </button>
                                            <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                                                <i class="fas fa-question-circle mr-1"></i>
                                                問題管理
                                            </button>
                                            <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                                                <i class="fas fa-users mr-1"></i>
                                                参加者
                                            </button>
                                            <button class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm">
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
                            onclick="alert('イベント作成機能は準備中です')"
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
    
    contentArea.innerHTML = `
        <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-crystal-ball text-purple-600 mr-3"></i>
                    クイズ○○後管理（未来予測型）
                </h2>
                <button 
                    onclick="alert('未来予測型クイズは準備中です')"
                    class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-md"
                >
                    <i class="fas fa-plus mr-2"></i>
                    新規イベント作成
                </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-md p-12 text-center">
                <i class="fas fa-flask text-6xl text-purple-300 mb-4"></i>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">準備中の機能です</h3>
                <p class="text-gray-600 mb-6">
                    未来の状態を予測するクイズシステムを開発中です。<br/>
                    天気予測、株価予測、スポーツ結果予測など、様々な未来予測クイズを作成できるようになります。
                </p>
                
                <div class="max-w-2xl mx-auto bg-purple-50 border-l-4 border-purple-500 p-6 text-left">
                    <h4 class="font-bold text-purple-900 mb-3">
                        <i class="fas fa-lightbulb mr-2"></i>
                        実装予定の機能
                    </h4>
                    <ul class="space-y-2 text-sm text-purple-800">
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>未来の状態を問う問題作成</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>答え合わせ日時の設定</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>外部APIからの自動答え合わせ</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>予測精度の分析</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>予測力ランキング</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
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
        const communication = knowledgeList.filter(k => k.category === 'people' || k.category === 'compliance');
        
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
            
            <div class="space-y-4">
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

// クイック時間設定
function setQuickTime(hours) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    document.getElementById('predPredictionDate').value = futureTime.toISOString().slice(0, 16);
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
            detailed_explanation: ''
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
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                答え合わせ
            </h3>
            
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <p class="font-semibold text-gray-800 mb-2">${question.question_text}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>A: ${question.option_a}</div>
                    <div>B: ${question.option_b}</div>
                    <div>C: ${question.option_c}</div>
                    <div>D: ${question.option_d}</div>
                </div>
            </div>
            
            <div class="space-y-4">
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
                    class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                    <i class="fas fa-check mr-2"></i>
                    答え合わせを実行
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
