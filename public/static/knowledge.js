// ==================== ナレッジベース画面 ====================

let currentCategory = 'all';
let knowledgeList = [];

// 初期化
async function init() {
    await loadKnowledge();
}

// ナレッジ読み込み
async function loadKnowledge() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-emerald-600 mb-4"></i>
            <p class="text-gray-600">読み込み中...</p>
        </div>
    `;
    
    try {
        const [knowledgeRes, categoriesRes] = await Promise.all([
            axios.get('/api/knowledge'),
            axios.get('/api/knowledge-categories')
        ]);
        
        knowledgeList = knowledgeRes.data.knowledge || [];
        const categories = categoriesRes.data.categories || [];
        
        renderPage(categories);
        
    } catch (error) {
        app.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p class="text-red-600">データの読み込みに失敗しました</p>
                <button onclick="loadKnowledge()" class="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg">
                    再試行
                </button>
            </div>
        `;
    }
}

// ページ全体をレンダリング
function renderPage(categories) {
    const app = document.getElementById('app');
    
    // カテゴリタブを生成
    const categoryTabs = [
        { id: 'all', name: 'すべて', icon: 'fa-th-large', color: 'emerald' },
        { id: 'company_history', name: '社史', icon: 'fa-landmark', color: 'amber' },
        { id: 'knowledge', name: '業務ナレッジ', icon: 'fa-book', color: 'blue' },
        { id: 'communication', name: 'コミュニケーション', icon: 'fa-users', color: 'purple' },
        { id: 'compliance', name: 'コンプライアンス', icon: 'fa-shield-alt', color: 'red' }
    ];
    
    app.innerHTML = `
        <!-- ヘッダー -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <i class="fas fa-book-open text-4xl text-emerald-600 mr-4"></i>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">ナレッジベース</h1>
                        <p class="text-gray-500 text-sm">社内の知識を学ぼう</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <a href="/people" class="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition">
                        <i class="fas fa-users mr-2"></i>社内のなかま
                    </a>
                    <a href="/" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                        <i class="fas fa-home mr-2"></i>ホーム
                    </a>
                </div>
            </div>
            
            <!-- カテゴリタブ -->
            <div class="flex flex-wrap gap-2">
                ${categoryTabs.map(tab => `
                    <button 
                        onclick="filterByCategory('${tab.id}')"
                        class="category-tab px-4 py-2 rounded-lg font-medium transition ${currentCategory === tab.id ? `bg-${tab.color}-100 text-${tab.color}-700 border-2 border-${tab.color}-500` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
                        data-category="${tab.id}"
                    >
                        <i class="fas ${tab.icon} mr-2"></i>${tab.name}
                        <span class="ml-1 text-xs">(${tab.id === 'all' ? knowledgeList.length : knowledgeList.filter(k => k.category === tab.id).length})</span>
                    </button>
                `).join('')}
            </div>
        </div>
        
        <!-- ナレッジ一覧 -->
        <div id="knowledge-list" class="grid md:grid-cols-2 gap-4">
            ${renderKnowledgeCards()}
        </div>
    `;
}

// ナレッジカードをレンダリング
function renderKnowledgeCards() {
    const filteredList = currentCategory === 'all' 
        ? knowledgeList 
        : knowledgeList.filter(k => k.category === currentCategory);
    
    if (filteredList.length === 0) {
        return `
            <div class="col-span-2 text-center py-12">
                <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">このカテゴリにはまだナレッジがありません</p>
            </div>
        `;
    }
    
    return filteredList.map(item => {
        const categoryConfig = {
            company_history: { icon: 'fa-landmark', color: 'amber', label: '社史' },
            knowledge: { icon: 'fa-book', color: 'blue', label: '業務' },
            communication: { icon: 'fa-users', color: 'purple', label: 'コミュ' },
            compliance: { icon: 'fa-shield-alt', color: 'red', label: 'コンプラ' }
        };
        const config = categoryConfig[item.category] || { icon: 'fa-file', color: 'gray', label: 'その他' };
        
        return `
            <div 
                class="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition cursor-pointer border-l-4 border-${config.color}-500"
                onclick="showKnowledgeDetail(${item.id})"
            >
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-${config.color}-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas ${config.icon} text-${config.color}-600"></i>
                        </div>
                        <div>
                            <span class="text-xs bg-${config.color}-100 text-${config.color}-700 px-2 py-0.5 rounded">${config.label}</span>
                            <h3 class="font-bold text-gray-800 mt-1">${item.title}</h3>
                        </div>
                    </div>
                    <div class="flex items-center">
                        ${'<i class="fas fa-star text-yellow-400 text-xs"></i>'.repeat(item.value_score || 0)}
                    </div>
                </div>
                <p class="text-sm text-gray-600 line-clamp-3 mb-3">${item.content || ''}</p>
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>
                        <i class="fas fa-chart-line mr-1"></i>
                        認知率 ${item.recognition_rate || 0}%
                    </span>
                    <span class="text-${config.color}-600">
                        <i class="fas fa-arrow-right"></i> 詳しく見る
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// カテゴリでフィルター
function filterByCategory(category) {
    currentCategory = category;
    
    // タブの見た目を更新
    document.querySelectorAll('.category-tab').forEach(tab => {
        const tabCategory = tab.dataset.category;
        if (tabCategory === category) {
            tab.classList.remove('bg-gray-100', 'text-gray-600');
            tab.classList.add('border-2');
        } else {
            tab.classList.add('bg-gray-100', 'text-gray-600');
            tab.classList.remove('border-2');
        }
    });
    
    // カード一覧を更新
    document.getElementById('knowledge-list').innerHTML = renderKnowledgeCards();
}

// ナレッジ詳細表示
async function showKnowledgeDetail(knowledgeId) {
    try {
        const response = await axios.get(`/api/knowledge/${knowledgeId}`);
        const item = response.data.knowledge;
        
        const categoryConfig = {
            company_history: { icon: 'fa-landmark', color: 'amber', label: '社史' },
            knowledge: { icon: 'fa-book', color: 'blue', label: '業務ナレッジ' },
            communication: { icon: 'fa-users', color: 'purple', label: 'コミュニケーション' },
            compliance: { icon: 'fa-shield-alt', color: 'red', label: 'コンプライアンス' }
        };
        const config = categoryConfig[item.category] || { icon: 'fa-file', color: 'gray', label: 'その他' };
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <!-- ヘッダー -->
                <div class="bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 p-6 rounded-t-2xl text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                                <i class="fas ${config.icon} text-2xl"></i>
                            </div>
                            <div>
                                <span class="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">${config.label}</span>
                                <h2 class="text-xl font-bold mt-1">${item.title}</h2>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <!-- コンテンツ -->
                <div class="p-6">
                    <!-- 認知率 -->
                    <div class="bg-gray-50 rounded-xl p-4 mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium text-gray-600">みんなの認知率</span>
                            <span class="text-2xl font-bold ${item.recognition_rate >= 70 ? 'text-green-600' : item.recognition_rate >= 50 ? 'text-yellow-600' : 'text-red-600'}">${item.recognition_rate || 0}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="h-3 rounded-full transition-all ${item.recognition_rate >= 70 ? 'bg-green-500' : item.recognition_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}" style="width: ${item.recognition_rate || 0}%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            ${item.recognition_rate >= 70 ? 'みんなよく知っています！' : item.recognition_rate >= 50 ? 'もう少し周知が必要かも' : 'ぜひ覚えておきましょう！'}
                        </p>
                    </div>
                    
                    <!-- 本文 -->
                    <div class="mb-6">
                        <h3 class="font-bold text-gray-700 mb-3">
                            <i class="fas fa-align-left text-gray-400 mr-2"></i>
                            内容
                        </h3>
                        <div class="bg-gray-50 p-4 rounded-xl">
                            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${item.content}</p>
                        </div>
                    </div>
                    
                    <!-- 重要度 -->
                    <div class="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                        <div>
                            <span class="mr-4">
                                <i class="fas fa-star text-yellow-400 mr-1"></i>
                                重要度: ${'★'.repeat(item.value_score || 0)}${'☆'.repeat(5 - (item.value_score || 0))}
                            </span>
                        </div>
                        <span>
                            <i class="fas fa-calendar mr-1"></i>
                            ${new Date(item.created_at).toLocaleDateString('ja-JP')}
                        </span>
                    </div>
                </div>
                
                <!-- フッター -->
                <div class="bg-gray-50 p-4 rounded-b-2xl flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" class="bg-${config.color}-600 text-white px-6 py-2 rounded-lg hover:bg-${config.color}-700 transition">
                        閉じる
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        alert('ナレッジの取得に失敗しました');
    }
}

// 初期化実行
init();
