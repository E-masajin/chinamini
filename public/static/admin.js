const ADMIN_API = '/admin/api';
let currentAdmin = null;
let currentEvents = [];
let selectedEvent = null;

// ログイン画面
function showAdminLogin() {
    document.getElementById('admin-app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-gray-100">
            <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                    <i class="fas fa-lock mr-2"></i>
                    管理者ログイン
                </h1>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p class="text-sm text-yellow-800 font-semibold mb-2">
                        <i class="fas fa-info-circle mr-1"></i>
                        デモ用アカウント
                    </p>
                    <p class="text-xs text-yellow-700">
                        <strong>ユーザー名:</strong> admin<br/>
                        <strong>パスワード:</strong> admin123
                    </p>
                    <p class="text-xs text-yellow-600 mt-2">
                        ※ プロトタイプ・モック用の簡易認証です
                    </p>
                </div>
                <div class="space-y-4">
                    <input 
                        type="text" 
                        id="adminUsername" 
                        placeholder="ユーザー名"
                        class="w-full px-4 py-2 border rounded-lg"
                    />
                    <input 
                        type="password" 
                        id="adminPassword" 
                        placeholder="パスワード"
                        class="w-full px-4 py-2 border rounded-lg"
                    />
                    <button 
                        onclick="handleAdminLogin()"
                        class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                    >
                        ログイン
                    </button>
                    <div id="adminLoginError" class="text-red-600 text-sm hidden"></div>
                    <div class="text-center mt-4">
                        <a href="/" class="text-sm text-gray-600 hover:text-gray-800">
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
        showAdminDashboard();
    } catch (error) {
        errorDiv.textContent = '認証に失敗しました';
        errorDiv.classList.remove('hidden');
    }
}

// 管理画面ダッシュボード
async function showAdminDashboard() {
    try {
        const response = await axios.get(`${ADMIN_API}/events`);
        currentEvents = response.data.events;
        
        const eventsHtml = currentEvents.map(event => {
            const modeText = event.mode === 'individual' ? '個人戦' : 
                            event.mode === 'team' ? 'チーム戦' : '企業戦';
            const statusClass = event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
            const statusText = event.is_active ? 'アクティブ' : '非アクティブ';
            
            return `
                <div class="bg-white p-6 rounded-lg shadow mb-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-gray-800">${event.name}</h3>
                            <p class="text-sm text-gray-600 mt-1">${event.description || ''}</p>
                            <div class="mt-2 flex gap-2 flex-wrap">
                                <span class="${statusClass} px-2 py-1 rounded text-xs">${statusText}</span>
                                <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">${modeText}</span>
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">${event.questions_per_user}問</span>
                                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">最低${event.min_participants}人</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-2">
                                ${new Date(event.start_date).toLocaleString('ja-JP')} 〜 ${new Date(event.end_date).toLocaleString('ja-JP')}
                            </p>
                        </div>
                        <div class="flex gap-2 ml-4">
                            <button onclick="editEvent(${event.id})" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="manageQuestions(${event.id})" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                                <i class="fas fa-question-circle"></i>
                            </button>
                            <button onclick="viewParticipants(${event.id})" class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                                <i class="fas fa-users"></i>
                            </button>
                            <button onclick="deleteEvent(${event.id})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('admin-app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-8">
                <div class="max-w-6xl mx-auto">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold text-gray-800">
                            <i class="fas fa-cog mr-2"></i>
                            管理画面
                        </h1>
                        <div class="flex gap-2">
                            <button onclick="showCreateEventModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <i class="fas fa-plus mr-2"></i>
                                新規イベント作成
                            </button>
                            <button onclick="showAdminLogin()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                <i class="fas fa-sign-out-alt mr-2"></i>
                                ログアウト
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h2 class="text-xl font-bold text-gray-800 mb-4">イベント一覧</h2>
                        ${eventsHtml || '<p class="text-gray-500">イベントがありません</p>'}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        alert('データの取得に失敗しました');
    }
}

// イベント作成モーダル
function showCreateEventModal() {
    const now = new Date();
    const startDate = now.toISOString().slice(0, 16);
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    
    const modal = `
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <h2 class="text-2xl font-bold mb-6">新規イベント作成</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">イベント名</label>
                        <input type="text" id="eventName" class="w-full px-3 py-2 border rounded" placeholder="例: 2025年クイズ大会" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">説明</label>
                        <textarea id="eventDescription" class="w-full px-3 py-2 border rounded" rows="3"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">開始日時</label>
                            <input type="datetime-local" id="eventStartDate" value="${startDate}" class="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">終了日時</label>
                            <input type="datetime-local" id="eventEndDate" value="${endDate}" class="w-full px-3 py-2 border rounded" />
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">問題数</label>
                            <input type="number" id="eventQuestionsPerUser" value="10" class="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">モード</label>
                            <select id="eventMode" class="w-full px-3 py-2 border rounded">
                                <option value="individual">個人戦</option>
                                <option value="team">チーム戦</option>
                                <option value="company">企業戦</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">最低参加人数</label>
                            <input type="number" id="eventMinParticipants" value="1" class="w-full px-3 py-2 border rounded" />
                        </div>
                    </div>
                    <div class="flex gap-2 mt-6">
                        <button onclick="createEvent()" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            作成
                        </button>
                        <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('admin-app').insertAdjacentHTML('beforeend', modal);
}

async function createEvent() {
    const data = {
        name: document.getElementById('eventName').value,
        description: document.getElementById('eventDescription').value,
        start_date: document.getElementById('eventStartDate').value,
        end_date: document.getElementById('eventEndDate').value,
        questions_per_user: parseInt(document.getElementById('eventQuestionsPerUser').value),
        mode: document.getElementById('eventMode').value,
        min_participants: parseInt(document.getElementById('eventMinParticipants').value)
    };
    
    try {
        await axios.post(`${ADMIN_API}/events`, data);
        closeModal();
        showAdminDashboard();
        alert('イベントを作成しました');
    } catch (error) {
        alert('作成に失敗しました');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('このイベントを削除しますか？')) return;
    
    try {
        await axios.delete(`${ADMIN_API}/events/${eventId}`);
        showAdminDashboard();
        alert('削除しました');
    } catch (error) {
        alert('削除に失敗しました');
    }
}

// 問題管理
async function manageQuestions(eventId) {
    selectedEvent = currentEvents.find(e => e.id === eventId);
    
    try {
        const response = await axios.get(`${ADMIN_API}/events/${eventId}/questions`);
        const questions = response.data.questions;
        
        const groupedQuestions = {};
        for (let i = 0; i < 10; i++) {
            groupedQuestions[i] = questions.filter(q => q.pool_group === i);
        }
        
        const questionsHtml = Object.entries(groupedQuestions).map(([group, qs]) => `
            <div class="mb-6">
                <h4 class="font-bold text-gray-800 mb-2">問題群${group} (${qs.length}問)</h4>
                <div class="space-y-2">
                    ${qs.map(q => `
                        <div class="bg-gray-50 p-3 rounded flex justify-between items-start">
                            <div class="flex-1">
                                <p class="font-medium">${q.question_text}</p>
                                <p class="text-sm text-gray-600 mt-1">正解: ${q.correct_answer}</p>
                            </div>
                            <div class="flex gap-1">
                                <button onclick="editQuestion(${q.id})" class="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteQuestion(${q.id})" class="px-2 py-1 bg-red-600 text-white rounded text-xs">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        document.getElementById('admin-app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-8">
                <div class="max-w-6xl mx-auto">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold text-gray-800">
                            問題管理: ${selectedEvent.name}
                        </h1>
                        <div class="flex gap-2">
                            <button onclick="showAIGenerateModal()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <i class="fas fa-magic mr-2"></i>
                                AI問題生成
                            </button>
                            <button onclick="showCreateQuestionModal()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <i class="fas fa-plus mr-2"></i>
                                問題追加
                            </button>
                            <button onclick="showAdminDashboard()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                <i class="fas fa-arrow-left mr-2"></i>
                                戻る
                            </button>
                        </div>
                    </div>
                    
                    ${questionsHtml}
                </div>
            </div>
        `;
    } catch (error) {
        alert('問題の取得に失敗しました');
    }
}

function showCreateQuestionModal() {
    const modal = `
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <h2 class="text-2xl font-bold mb-6">問題追加</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">問題文</label>
                        <textarea id="questionText" class="w-full px-3 py-2 border rounded" rows="3"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">選択肢A</label>
                            <input type="text" id="optionA" class="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">選択肢B</label>
                            <input type="text" id="optionB" class="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">選択肢C</label>
                            <input type="text" id="optionC" class="w-full px-3 py-2 border rounded" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">選択肢D</label>
                            <input type="text" id="optionD" class="w-full px-3 py-2 border rounded" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">正解</label>
                            <select id="correctAnswer" class="w-full px-3 py-2 border rounded">
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">問題群 (0-9)</label>
                            <input type="number" id="poolGroup" min="0" max="9" value="0" class="w-full px-3 py-2 border rounded" />
                        </div>
                    </div>
                    <div class="flex gap-2 mt-6">
                        <button onclick="createQuestion()" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            追加
                        </button>
                        <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('admin-app').insertAdjacentHTML('beforeend', modal);
}

async function createQuestion() {
    const data = {
        question_text: document.getElementById('questionText').value,
        option_a: document.getElementById('optionA').value,
        option_b: document.getElementById('optionB').value,
        option_c: document.getElementById('optionC').value,
        option_d: document.getElementById('optionD').value,
        correct_answer: document.getElementById('correctAnswer').value,
        pool_group: parseInt(document.getElementById('poolGroup').value)
    };
    
    try {
        await axios.post(`${ADMIN_API}/events/${selectedEvent.id}/questions`, data);
        closeModal();
        manageQuestions(selectedEvent.id);
        alert('問題を追加しました');
    } catch (error) {
        alert('追加に失敗しました');
    }
}

async function deleteQuestion(questionId) {
    if (!confirm('この問題を削除しますか？')) return;
    
    try {
        await axios.delete(`${ADMIN_API}/questions/${questionId}`);
        manageQuestions(selectedEvent.id);
        alert('削除しました');
    } catch (error) {
        alert('削除に失敗しました');
    }
}

// 参加者一覧
async function viewParticipants(eventId) {
    selectedEvent = currentEvents.find(e => e.id === eventId);
    
    try {
        const response = await axios.get(`${ADMIN_API}/events/${eventId}/participants`);
        const participants = response.data.participants;
        
        const participantsHtml = participants.map(p => {
            const minutes = Math.floor((p.answer_duration || 0) / 60);
            const seconds = (p.answer_duration || 0) % 60;
            const statusClass = p.has_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            const statusText = p.has_completed ? '完了' : '未完了';
            
            return `
                <tr class="border-b">
                    <td class="px-4 py-3">${p.user_id}</td>
                    <td class="px-4 py-3">${p.name || '-'}</td>
                    <td class="px-4 py-3">${p.team_name || '-'}</td>
                    <td class="px-4 py-3">${p.company_name || '-'}</td>
                    <td class="px-4 py-3 text-center">${p.score || 0}点</td>
                    <td class="px-4 py-3 text-center">${minutes}分${seconds}秒</td>
                    <td class="px-4 py-3"><span class="${statusClass} px-2 py-1 rounded text-xs">${statusText}</span></td>
                    <td class="px-4 py-3 text-xs">${p.completed_at ? new Date(p.completed_at).toLocaleString('ja-JP') : '-'}</td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('admin-app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-8">
                <div class="max-w-6xl mx-auto">
                    <div class="flex justify-between items-center mb-8">
                        <h1 class="text-3xl font-bold text-gray-800">
                            参加者一覧: ${selectedEvent.name}
                        </h1>
                        <button onclick="showAdminDashboard()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            <i class="fas fa-arrow-left mr-2"></i>
                            戻る
                        </button>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left">ユーザーID</th>
                                    <th class="px-4 py-3 text-left">名前</th>
                                    <th class="px-4 py-3 text-left">チーム</th>
                                    <th class="px-4 py-3 text-left">企業</th>
                                    <th class="px-4 py-3 text-center">スコア</th>
                                    <th class="px-4 py-3 text-center">回答時間</th>
                                    <th class="px-4 py-3 text-left">状態</th>
                                    <th class="px-4 py-3 text-left">完了日時</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${participantsHtml || '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">参加者がいません</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        alert('参加者の取得に失敗しました');
    }
}

function closeModal() {
    document.getElementById('modal')?.remove();
}

// AI問題生成モーダル
function showAIGenerateModal() {
    const modal = `
        <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-xl max-w-3xl w-full max-h-screen overflow-y-auto">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-magic mr-2 text-purple-600"></i>
                    AI問題生成
                </h2>
                
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-purple-800">
                        <i class="fas fa-info-circle mr-1"></i>
                        社内資料（PDF/テキスト）をアップロードすると、AIが自動的にクイズ問題を生成します。
                    </p>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            <i class="fas fa-file-upload mr-1"></i>
                            ファイルアップロード
                        </label>
                        <input 
                            type="file" 
                            id="aiGenerateFile" 
                            accept=".pdf,.txt,.md"
                            class="w-full px-3 py-2 border rounded"
                        />
                        <p class="text-xs text-gray-500 mt-1">対応形式: PDF, テキスト (.txt, .md)</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">
                                <i class="fas fa-hashtag mr-1"></i>
                                生成する問題数
                            </label>
                            <select id="aiGenerateCount" class="w-full px-3 py-2 border rounded">
                                <option value="10">10問</option>
                                <option value="20">20問</option>
                                <option value="50">50問</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">
                                <i class="fas fa-tag mr-1"></i>
                                カテゴリ
                            </label>
                            <select id="aiGenerateCategory" class="w-full px-3 py-2 border rounded">
                                <option value="company_history">社史</option>
                                <option value="knowledge">ナレッジ</option>
                                <option value="people">人物</option>
                                <option value="product">製品知識</option>
                                <option value="compliance">コンプライアンス</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">
                            <i class="fas fa-comment mr-1"></i>
                            追加の指示（オプション）
                        </label>
                        <textarea 
                            id="aiGeneratePrompt" 
                            class="w-full px-3 py-2 border rounded" 
                            rows="3"
                            placeholder="例: 創業時のエピソードに焦点を当ててください"
                        ></textarea>
                    </div>
                    
                    <div id="aiGenerateProgress" class="hidden">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-center gap-3">
                                <div class="animate-spin">
                                    <i class="fas fa-spinner text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <p class="font-medium text-blue-800">AI問題生成中...</p>
                                    <p class="text-sm text-blue-600" id="aiGenerateProgressText">ファイルを読み込んでいます</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="aiGeneratePreview" class="hidden">
                        <h3 class="font-bold text-gray-800 mb-3">
                            <i class="fas fa-eye mr-1"></i>
                            生成された問題のプレビュー
                        </h3>
                        <div id="aiGeneratePreviewContent" class="space-y-3 max-h-96 overflow-y-auto"></div>
                    </div>
                    
                    <div class="flex gap-2 mt-6">
                        <button 
                            id="aiGenerateButton"
                            onclick="handleAIGenerate()" 
                            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                            <i class="fas fa-magic mr-2"></i>
                            AI生成開始
                        </button>
                        <button 
                            id="aiApproveButton"
                            onclick="handleAIApprove()" 
                            class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 hidden"
                        >
                            <i class="fas fa-check mr-2"></i>
                            問題を承認して登録
                        </button>
                        <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('admin-app').insertAdjacentHTML('beforeend', modal);
}

let generatedQuestions = [];

async function handleAIGenerate() {
    const fileInput = document.getElementById('aiGenerateFile');
    const count = parseInt(document.getElementById('aiGenerateCount').value);
    const category = document.getElementById('aiGenerateCategory').value;
    const additionalPrompt = document.getElementById('aiGeneratePrompt').value;
    
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('ファイルを選択してください');
        return;
    }
    
    const file = fileInput.files[0];
    const progressDiv = document.getElementById('aiGenerateProgress');
    const progressText = document.getElementById('aiGenerateProgressText');
    const previewDiv = document.getElementById('aiGeneratePreview');
    const generateButton = document.getElementById('aiGenerateButton');
    const approveButton = document.getElementById('aiApproveButton');
    
    // 進行状況を表示
    progressDiv.classList.remove('hidden');
    generateButton.disabled = true;
    generateButton.classList.add('opacity-50', 'cursor-not-allowed');
    
    try {
        // ファイルを読み込む
        progressText.textContent = 'ファイルを読み込んでいます...';
        const fileContent = await readFileAsText(file);
        
        // AI生成リクエスト
        progressText.textContent = 'AIで問題を生成しています...（数十秒かかります）';
        
        const response = await axios.post(`${ADMIN_API}/ai/generate-questions`, {
            file_content: fileContent,
            file_name: file.name,
            count: count,
            category: category,
            event_id: selectedEvent.id,
            additional_prompt: additionalPrompt
        });
        
        generatedQuestions = response.data.questions;
        
        // プレビューを表示
        progressDiv.classList.add('hidden');
        previewDiv.classList.remove('hidden');
        approveButton.classList.remove('hidden');
        
        const previewContent = document.getElementById('aiGeneratePreviewContent');
        previewContent.innerHTML = generatedQuestions.map((q, idx) => `
            <div class="bg-gray-50 p-4 rounded border">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-sm font-bold text-gray-700">問題 ${idx + 1} - 問題群${q.pool_group}</span>
                    <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">${getCategoryLabel(q.category)}</span>
                </div>
                <p class="font-medium mb-2">${q.question_text}</p>
                <div class="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div class="flex items-center gap-1">
                        <span class="${q.correct_answer === 'A' ? 'text-green-600 font-bold' : 'text-gray-600'}">A: ${q.option_a}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="${q.correct_answer === 'B' ? 'text-green-600 font-bold' : 'text-gray-600'}">B: ${q.option_b}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="${q.correct_answer === 'C' ? 'text-green-600 font-bold' : 'text-gray-600'}">C: ${q.option_c}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="${q.correct_answer === 'D' ? 'text-green-600 font-bold' : 'text-gray-600'}">D: ${q.option_d}</span>
                    </div>
                </div>
                ${q.detailed_explanation ? `
                    <div class="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                        <i class="fas fa-info-circle mr-1"></i>
                        ${q.detailed_explanation}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        progressDiv.classList.add('hidden');
        alert('AI生成に失敗しました: ' + (error.response?.data?.error || error.message));
    } finally {
        generateButton.disabled = false;
        generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

async function handleAIApprove() {
    if (generatedQuestions.length === 0) {
        alert('生成された問題がありません');
        return;
    }
    
    const approveButton = document.getElementById('aiApproveButton');
    approveButton.disabled = true;
    approveButton.textContent = '登録中...';
    
    try {
        // 問題を一括登録
        for (const question of generatedQuestions) {
            await axios.post(`${ADMIN_API}/events/${selectedEvent.id}/questions`, {
                question_text: question.question_text,
                option_a: question.option_a,
                option_b: question.option_b,
                option_c: question.option_c,
                option_d: question.option_d,
                correct_answer: question.correct_answer,
                pool_group: question.pool_group,
                category: question.category,
                source_material: question.source_material,
                detailed_explanation: question.detailed_explanation
            });
        }
        
        alert(`${generatedQuestions.length}問の問題を登録しました！`);
        closeModal();
        manageQuestions(selectedEvent.id);
        
    } catch (error) {
        alert('問題の登録に失敗しました: ' + error.message);
        approveButton.disabled = false;
        approveButton.textContent = '問題を承認して登録';
    }
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

function getCategoryLabel(category) {
    const labels = {
        'company_history': '社史',
        'knowledge': 'ナレッジ',
        'people': '人物',
        'product': '製品知識',
        'compliance': 'コンプライアンス'
    };
    return labels[category] || category;
}

// 初期化
showAdminLogin();
