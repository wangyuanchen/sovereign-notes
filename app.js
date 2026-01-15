// 应用状态
let notes = [];
let currentNoteId = null;
let isLoggedIn = false;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已有 salt（表示之前设置过密码）
    const hasSalt = localStorage.getItem('salt');
    if (hasSalt) {
        document.getElementById('masterPassword').placeholder = '输入你的主密码';
    }
    
    // 自动聚焦密码输入框
    document.getElementById('masterPassword').focus();
    
    // 回车登录
    document.getElementById('masterPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login();
        }
    });
});

// 登录
async function login() {
    const password = document.getElementById('masterPassword').value;
    
    if (!password) {
        alert('请输入密码');
        return;
    }
    
    try {
        const salt = cryptoUtils.getSalt();
        const { key, salt: newSalt } = await cryptoUtils.deriveKey(password, salt);
        
        // 如果是首次登录，保存 salt
        if (!salt) {
            cryptoUtils.setMasterKey(key, newSalt);
        } else {
            cryptoUtils.masterKey = key;
        }
        
        // 尝试加载笔记
        await loadNotes();
        
        // 显示主应用
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        isLoggedIn = true;
        
        renderNotesList();
    } catch (e) {
        alert('密码错误或加载失败');
        console.error(e);
    }
}

// 登出
function logout() {
    if (confirm('确定要退出吗？未保存的更改将丢失。')) {
        isLoggedIn = false;
        currentNoteId = null;
        notes = [];
        cryptoUtils.masterKey = null;
        
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('masterPassword').value = '';
    }
}

// 加载笔记
async function loadNotes() {
    const encryptedNotes = localStorage.getItem('notes');
    
    if (!encryptedNotes) {
        notes = [];
        return;
    }
    
    try {
        const encrypted = JSON.parse(encryptedNotes);
        const decrypted = await cryptoUtils.decrypt(encrypted, cryptoUtils.masterKey);
        
        if (decrypted) {
            notes = JSON.parse(decrypted);
        } else {
            throw new Error('解密失败');
        }
    } catch (e) {
        console.error('加载笔记失败:', e);
        notes = [];
    }
}

// 保存所有笔记
async function saveAllNotes() {
    try {
        const notesJson = JSON.stringify(notes);
        const encrypted = await cryptoUtils.encrypt(notesJson, cryptoUtils.masterKey);
        localStorage.setItem('notes', JSON.stringify(encrypted));
    } catch (e) {
        console.error('保存失败:', e);
        alert('保存失败');
    }
}

// 渲染笔记列表
function renderNotesList() {
    const notesList = document.getElementById('notesList');
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <p>还没有笔记</p>
            </div>
        `;
        return;
    }
    
    // 按更新时间排序
    const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
    
    notesList.innerHTML = sortedNotes.map(note => {
        const isActive = note.id === currentNoteId;
        const preview = note.content.substring(0, 100).replace(/[#*`\n]/g, ' ');
        const date = new Date(note.updatedAt).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div onclick="openNote('${note.id}')" 
                 class="note-item p-3 rounded-lg cursor-pointer transition ${isActive ? 'bg-purple-50 border-l-4 border-purple-600' : 'hover:bg-gray-50'}">
                <h3 class="font-semibold text-gray-900 mb-1 truncate">${note.title || '无标题'}</h3>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${preview}</p>
                <span class="text-xs text-gray-500">${date}</span>
            </div>
        `;
    }).join('');
}

// 创建新笔记
function createNote() {
    const newNote = {
        id: Date.now().toString(),
        title: '',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    notes.unshift(newNote);
    currentNoteId = newNote.id;
    
    showEditor();
    renderNotesList();
    
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteTitle').focus();
}

// 打开笔记
function openNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    
    showEditor();
    renderNotesList();
    updatePreview();
}

// 显示编辑器
function showEditor() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('editorContainer').classList.remove('hidden');
}

// 保存当前笔记
async function saveNote() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    note.title = document.getElementById('noteTitle').value || '无标题';
    note.content = document.getElementById('noteContent').value;
    note.updatedAt = Date.now();
    
    await saveAllNotes();
    renderNotesList();
    
    // 显示保存时间
    const now = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastSaved').textContent = `已保存 ${now}`;
    
    setTimeout(() => {
        document.getElementById('lastSaved').textContent = '';
    }, 3000);
}

// 删除当前笔记
async function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    if (!confirm('确定要删除这条笔记吗？')) return;
    
    notes = notes.filter(n => n.id !== currentNoteId);
    currentNoteId = null;
    
    await saveAllNotes();
    renderNotesList();
    
    document.getElementById('editorContainer').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
}

// 搜索笔记
function searchNotes() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const notesList = document.getElementById('notesList');
    
    if (!query) {
        renderNotesList();
        return;
    }
    
    const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        notesList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-search text-4xl mb-2"></i>
                <p>没有找到匹配的笔记</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = filtered.map(note => {
        const isActive = note.id === currentNoteId;
        const preview = note.content.substring(0, 100).replace(/[#*`\n]/g, ' ');
        const date = new Date(note.updatedAt).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div onclick="openNote('${note.id}')" 
                 class="note-item p-3 rounded-lg cursor-pointer transition ${isActive ? 'bg-purple-50 border-l-4 border-purple-600' : 'hover:bg-gray-50'}">
                <h3 class="font-semibold text-gray-900 mb-1 truncate">${note.title || '无标题'}</h3>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${preview}</p>
                <span class="text-xs text-gray-500">${date}</span>
            </div>
        `;
    }).join('');
}

// 切换编辑/预览标签
function switchTab(tab) {
    if (tab === 'edit') {
        document.getElementById('editView').classList.remove('hidden');
        document.getElementById('previewView').classList.add('hidden');
        document.getElementById('editTab').classList.add('border-b-2', 'border-purple-600', 'text-purple-600');
        document.getElementById('editTab').classList.remove('text-gray-600');
        document.getElementById('previewTab').classList.remove('border-b-2', 'border-purple-600', 'text-purple-600');
        document.getElementById('previewTab').classList.add('text-gray-600');
    } else {
        document.getElementById('editView').classList.add('hidden');
        document.getElementById('previewView').classList.remove('hidden');
        document.getElementById('previewTab').classList.add('border-b-2', 'border-purple-600', 'text-purple-600');
        document.getElementById('previewTab').classList.remove('text-gray-600');
        document.getElementById('editTab').classList.remove('border-b-2', 'border-purple-600', 'text-purple-600');
        document.getElementById('editTab').classList.add('text-gray-600');
        updatePreview();
    }
}

// 更新 Markdown 预览
function updatePreview() {
    const content = document.getElementById('noteContent').value;
    const preview = document.getElementById('markdownPreview');
    
    if (!content) {
        preview.innerHTML = '<p class="text-gray-500">没有内容</p>';
        return;
    }
    
    preview.innerHTML = marked.parse(content);
}

// 自动保存（每 30 秒）
setInterval(() => {
    if (isLoggedIn && currentNoteId) {
        saveNote();
    }
}, 30000);

// 编辑时自动更新预览
document.addEventListener('DOMContentLoaded', () => {
    const noteContent = document.getElementById('noteContent');
    if (noteContent) {
        noteContent.addEventListener('input', () => {
            const previewView = document.getElementById('previewView');
            if (!previewView.classList.contains('hidden')) {
                updatePreview();
            }
        });
    }
});
