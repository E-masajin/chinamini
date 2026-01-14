// ==================== 社内のなかま（コミュニケーション）画面 ====================

let personsList = [];
let conversationStarters = [];

// 初期化
async function init() {
    await loadData();
}

// データ読み込み
async function loadData() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
            <p class="text-gray-600">読み込み中...</p>
        </div>
    `;
    
    try {
        const [personsRes, startersRes] = await Promise.all([
            axios.get('/api/communication/persons'),
            axios.get('/api/communication/conversation-starters')
        ]);
        
        personsList = personsRes.data.persons || [];
        conversationStarters = startersRes.data.starters || [];
        
        renderPage();
        
    } catch (error) {
        app.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <p class="text-red-600">データの読み込みに失敗しました</p>
                <button onclick="loadData()" class="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg">
                    再試行
                </button>
            </div>
        `;
    }
}

// ページをレンダリング
function renderPage() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <!-- ヘッダー -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <i class="fas fa-users text-4xl text-purple-600 mr-4"></i>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">社内のなかま</h1>
                        <p class="text-gray-500 text-sm">みんなのことをもっと知ろう</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <a href="/knowledge" class="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition">
                        <i class="fas fa-book mr-2"></i>ナレッジ
                    </a>
                    <a href="/" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                        <i class="fas fa-home mr-2"></i>ホーム
                    </a>
                </div>
            </div>
        </div>
        
        <!-- 会話のきっかけ提案 -->
        ${conversationStarters.length > 0 ? `
            <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-6 text-white">
                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-lightbulb mr-2"></i>
                    今日の会話のきっかけ
                </h2>
                <div class="grid md:grid-cols-2 gap-4">
                    ${conversationStarters.slice(0, 4).map((starter, index) => `
                        <div class="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur">
                            <div class="flex items-center mb-2">
                                <div class="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-3">
                                    <span class="text-lg font-bold">${starter.personName.charAt(0)}</span>
                                </div>
                                <div>
                                    <span class="font-semibold">${starter.personName}さん</span>
                                    <span class="text-xs opacity-80 ml-2">${starter.topic}</span>
                                </div>
                            </div>
                            <p class="text-sm italic">"${starter.suggestedOpener}"</p>
                        </div>
                    `).join('')}
                </div>
                <button onclick="refreshConversationStarters()" class="mt-4 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition text-sm">
                    <i class="fas fa-sync-alt mr-2"></i>別の提案を見る
                </button>
            </div>
        ` : ''}
        
        <!-- 人物一覧 -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-address-book text-purple-600 mr-2"></i>
                メンバー一覧
            </h2>
            
            ${personsList.length > 0 ? `
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${personsList.map(person => `
                        <div 
                            class="bg-gray-50 rounded-xl p-4 hover:shadow-md transition cursor-pointer border-2 border-transparent hover:border-purple-300"
                            onclick="showPersonDetail(${person.id})"
                        >
                            <div class="flex items-center mb-3">
                                <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
                                    ${person.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-800">${person.name}さん</h3>
                                    <p class="text-sm text-gray-500">${person.department || '部署未登録'}</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    <i class="fas fa-tags text-purple-400 mr-1"></i>
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
            ` : `
                <div class="text-center py-12">
                    <i class="fas fa-user-friends text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">まだメンバー情報がありません</p>
                    <p class="text-sm text-gray-400 mt-2">クイズの答え合わせで情報が蓄積されます</p>
                </div>
            `}
        </div>
        
        <!-- 説明 -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mt-6">
            <h3 class="font-bold text-gray-800 mb-3">
                <i class="fas fa-info-circle text-purple-600 mr-2"></i>
                この画面について
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
                クイズの「答え合わせ」を通じて、みんなの好みや特徴が自動的に蓄積されていきます。<br>
                例: 「田中さんのランチは？」→ 正解「ラーメン」→ 「田中さんはラーメン好き」という情報に！<br>
                <br>
                この情報を活用して、話しかけるきっかけを見つけたり、共通の趣味を持つ仲間を探したりできます。
            </p>
        </div>
    `;
}

// 会話のきっかけを更新
async function refreshConversationStarters() {
    try {
        const response = await axios.get('/api/communication/conversation-starters');
        conversationStarters = response.data.starters || [];
        renderPage();
    } catch (error) {
        console.error('Failed to refresh:', error);
    }
}

// 人物詳細を表示
async function showPersonDetail(personId) {
    try {
        const response = await axios.get(`/api/communication/persons/${personId}`);
        const data = response.data;
        const person = data.person || data.profile;
        const traits = data.traits || [];
        const insights = data.insights || [];
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <!-- ヘッダー -->
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                <span class="text-3xl font-bold">${person.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold">${person.name}さん</h2>
                                <p class="text-white text-opacity-80">${person.department || '部署未登録'}</p>
                            </div>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <!-- コンテンツ -->
                <div class="p-6">
                    <!-- 特性タグ -->
                    ${traits.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-gray-700 mb-3">
                                <i class="fas fa-tags text-purple-500 mr-2"></i>
                                わかっていること
                            </h3>
                            <div class="flex flex-wrap gap-2">
                                ${traits.map(trait => `
                                    <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                        ${getCategoryIcon(trait.category)} ${trait.value}
                                        <span class="text-purple-500 text-xs ml-1">(${trait.occurrence_count}回)</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 洞察・会話のヒント -->
                    ${insights.length > 0 ? `
                        <div>
                            <h3 class="font-bold text-gray-700 mb-3">
                                <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                                会話のヒント
                            </h3>
                            <div class="space-y-3">
                                ${insights.map(insight => {
                                    const hints = Array.isArray(insight.conversation_hints) 
                                        ? insight.conversation_hints 
                                        : (typeof insight.conversation_hints === 'string' ? JSON.parse(insight.conversation_hints) : []);
                                    return `
                                        <div class="bg-yellow-50 p-4 rounded-xl">
                                            <div class="flex items-center mb-2">
                                                <span class="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded mr-2">
                                                    ${insight.title}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    信頼度: ${Math.round((insight.confidence_score || 0) * 100)}%
                                                </span>
                                            </div>
                                            <p class="text-sm text-gray-700 mb-2">${insight.description}</p>
                                            ${hints.length > 0 ? `
                                                <div class="bg-white p-3 rounded-lg">
                                                    <p class="text-xs text-gray-500 mb-1">こう話しかけてみては？</p>
                                                    <ul class="space-y-1">
                                                        ${hints.map(hint => `
                                                            <li class="text-sm text-gray-700 italic">
                                                                <i class="fas fa-quote-left text-purple-300 text-xs mr-1"></i>
                                                                "${hint}"
                                                            </li>
                                                        `).join('')}
                                                    </ul>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="text-center py-8 text-gray-500">
                            <i class="fas fa-question-circle text-4xl text-gray-300 mb-2"></i>
                            <p>まだ詳しい情報がありません</p>
                            <p class="text-xs">クイズで情報が蓄積されていきます</p>
                        </div>
                    `}
                </div>
                
                <!-- フッター -->
                <div class="bg-gray-50 p-4 rounded-b-2xl flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                        閉じる
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        alert('プロフィールの取得に失敗しました');
    }
}

// カテゴリアイコンを取得
function getCategoryIcon(category) {
    const icons = {
        lunch: '🍜',
        hobby: '⭐',
        schedule: '⏰',
        preference: '💜',
        habit: '🔄',
        work: '💼',
        personality: '😊'
    };
    return icons[category] || '📌';
}

// 初期化実行
init();
