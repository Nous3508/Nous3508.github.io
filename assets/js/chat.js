/**
 * chat.js - AI 对话界面逻辑
 *
 * 依赖：chat-api.js（全局 ChatAPI）、marked（UMD 全局）
 * 功能：消息展示、流式输出、多轮对话、模型选择、API Key 管理、历史记录
 */
(() => {
  'use strict';

  // ==================== DOM 引用 ====================
  const $ = id => document.getElementById(id);
  const messagesEl = $('chat-messages');
  const welcomeEl = $('chat-welcome');
  const textarea = $('chat-textarea');
  const sendBtn = $('chat-send-btn');
  const stopBtn = $('chat-stop-btn');
  const providerSelect = $('chat-provider-select');
  const modelSelect = $('chat-model-select');
  const settingsBtn = $('chat-settings-btn');
  const settingsModal = $('chat-settings-modal');
  const modalBackdrop = $('chat-modal-backdrop');
  const modalClose = $('chat-modal-close');
  const apiListEl = $('chat-api-list');
  const customAddBtn = $('chat-custom-add-btn');
  const historyBackdrop = $('chat-history-backdrop');
  const historyModal = $('chat-history-modal');
  const historyClose = $('chat-history-close');
  const historyListEl = $('chat-history-list');

  // ==================== 状态 ====================
  const state = {
    provider: '',
    model: '',
    temperature: 0.7,
    messages: [],           // [{role, content}]
    isStreaming: false,
    abortController: null,
    currentSessionId: null,  // 当前对话历史 ID
    currentAiMsgEl: null,    // 当前正在输出的 AI 消息 DOM
    currentAiContent: '',    // 当前 AI 消息的纯文本缓存
  };

  // ==================== 初始化 ====================
  function init() {
    const { apiManager } = ChatAPI;

    // 恢复配置
    const savedConfig = apiManager.getConfig();
    state.provider = savedConfig.provider || 'deepseek';
    state.model = savedConfig.model || '';
    state.temperature = savedConfig.temperature ?? 0.7;

    // 填充提供商下拉
    populateProviders();

    // 如果已有 provider，选中并填充模型
    if (state.provider) {
      providerSelect.value = state.provider;
      populateModels(state.provider);
      if (state.model) {
        modelSelect.value = state.model;
      }
    }

    // 读取 URL 参数 ?q=...
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery) {
      // 自动发送
      setTimeout(() => sendMessage(initialQuery), 300);
    }

    // 绑定事件
    bindEvents();
  }

  // ==================== 提供商/模型选择 ====================
  function populateProviders() {
    const providers = ChatAPI.apiManager.getAllProviders();
    providerSelect.innerHTML = '<option value="">-- Provider --</option>';
    Object.entries(providers).forEach(([id, cfg]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = cfg.name;
      providerSelect.appendChild(opt);
    });
  }

  function populateModels(providerId) {
    const models = ChatAPI.apiManager.getModels(providerId);
    modelSelect.innerHTML = '<option value="">-- Model --</option>';
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      modelSelect.appendChild(opt);
    });
    // 自动选中默认模型
    const defaultModel = ChatAPI.apiManager.getDefaultModel(providerId);
    if (defaultModel) {
      modelSelect.value = defaultModel;
      state.model = defaultModel;
    }
  }

  // ==================== 发送消息 ====================
  async function sendMessage(text) {
    const q = (text || textarea?.value)?.trim();
    if (!q || state.isStreaming) return;

    // 如果未选择模型，提示
    if (!state.model || !state.provider) {
      appendMessage('system', '请先在下方选择 AI 提供商和模型。', '');
      return;
    }

    // 隐藏欢迎界面
    if (welcomeEl) welcomeEl.style.display = 'none';

    // 添加用户消息
    appendMessage('user', q, '');

    // 清空输入框
    if (textarea) textarea.value = '';
    autoResizeTextarea();

    // 更新消息历史
    state.messages.push({ role: 'user', content: q });

    // 创建 AI 消息占位
    const aiMsgEl = appendMessage('ai', '', '');
    state.currentAiMsgEl = aiMsgEl;
    state.currentAiContent = '';

    // 显示停止按钮
    setStreaming(true);

    // 开始流式请求
    const { apiManager, chatAPI } = ChatAPI;
    const config = {
      provider: state.provider,
      model: state.model,
      temperature: state.temperature
    };

    // 保存配置
    apiManager.setConfig(config);

    state.abortController = chatAPI.streamChat(
      state.messages,
      config,
      // onChunk
      (chunk) => {
        state.currentAiContent += chunk;
        updateAiMessage(state.currentAiMsgEl, state.currentAiContent);
      },
      // onDone
      () => {
        // 完成
        state.messages.push({ role: 'assistant', content: state.currentAiContent });
        setStreaming(false);
        state.currentAiMsgEl = null;
        state.currentAiContent = '';

        // 自动保存/更新历史
        saveSession();
      },
      // onError
      (err) => {
        setStreaming(false);
        updateAiMessage(state.currentAiMsgEl, `\n\n> ❌ **错误**: ${err.message}`);
        state.messages.push({ role: 'assistant', content: state.currentAiContent + `\n\n[Error: ${err.message}]` });
        state.currentAiMsgEl = null;
        state.currentAiContent = '';
        console.error('[Chat] API error:', err);
      }
    );
  }

  // ==================== 停止输出 ====================
  function stopStreaming() {
    if (state.abortController) {
      state.abortController.abort();
      state.abortController = null;
    }
  }

  // ==================== 设置流式状态 ====================
  function setStreaming(streaming) {
    state.isStreaming = streaming;
    if (sendBtn) sendBtn.style.display = streaming ? 'none' : '';
    if (stopBtn) stopBtn.style.display = streaming ? '' : 'none';
    if (textarea) textarea.disabled = streaming;
  }

  // ==================== 消息渲染 ====================
  function appendMessage(role, content, extraClass = '') {
    if (welcomeEl) welcomeEl.style.display = 'none';

    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role} ${extraClass}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.textContent = role === 'user' ? '👤' : role === 'ai' ? '🤖' : '⚙️';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';

    if (role === 'user') {
      bubble.textContent = content;
    } else if (role === 'system') {
      bubble.textContent = content;
    } else {
      // AI 消息：使用 marked 渲染
      bubble.innerHTML = '<div class="chat-msg-thinking">思考中...</div>';
    }

    div.appendChild(avatar);
    div.appendChild(bubble);

    // 添加时间戳
    if (role === 'user' || role === 'ai') {
      const time = document.createElement('div');
      time.className = 'chat-msg-time';
      time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (role === 'user') {
        div.appendChild(time);
      } else {
        div.insertBefore(time, div.firstChild);
      }
    }

    messagesEl.appendChild(div);
    scrollToBottom();

    return div;
  }

  async function updateAiMessage(msgEl, content) {
    if (!msgEl) return;
    const bubble = msgEl.querySelector('.chat-msg-bubble');
    if (!bubble) return;

    // 如果 marked 尚未加载完成，回退到纯文本
    const marked = window.marked;
    if (!marked || typeof marked.parse !== 'function') {
      bubble.textContent = content;
      scrollToBottom();
      return;
    }

    // 如果有思考中提示，移除
    const thinkingEl = bubble.querySelector('.chat-msg-thinking');
    if (thinkingEl) thinkingEl.remove();

    try {
      bubble.innerHTML = marked.parse(content);
      // 为代码块添加复制按钮
      enhanceCodeBlocks(bubble);
    } catch {
      bubble.textContent = content;
    }

    scrollToBottom();
  }

  /** 为代码块添加复制按钮 */
  function enhanceCodeBlocks(container) {
    container.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.chat-code-copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'chat-code-copy-btn';
      btn.textContent = '📋';
      btn.title = 'Copy code';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        if (code) {
          navigator.clipboard.writeText(code.textContent || '').catch(() => {});
          btn.textContent = '✅';
          setTimeout(() => { btn.textContent = '📋'; }, 2000);
        }
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  // ==================== 对话历史管理 ====================
  function saveSession() {
    const { chatHistory } = ChatAPI;
    if (state.messages.length < 2) return;

    if (state.currentSessionId) {
      chatHistory.update(state.currentSessionId, state.messages);
    } else {
      const session = chatHistory.create(state.messages);
      state.currentSessionId = session.id;
    }
  }

  function loadSession(sessionId) {
    const { chatHistory } = ChatAPI;
    const all = chatHistory.getAll();
    const session = all.find(s => s.id === sessionId);
    if (!session) return;

    // 清空当前
    clearMessages();
    state.messages = JSON.parse(JSON.stringify(session.messages));
    state.currentSessionId = session.id;

    // 重新渲染所有消息
    state.messages.forEach(msg => {
      if (msg.role === 'user') {
        appendMessage('user', msg.content, '');
      } else if (msg.role === 'assistant') {
        const el = appendMessage('ai', '', '');
        updateAiMessage(el, msg.content);
      }
    });

    closeHistoryModal();
  }

  function deleteSession(sessionId) {
    const { chatHistory } = ChatAPI;
    chatHistory.remove(sessionId);
    if (state.currentSessionId === sessionId) {
      state.currentSessionId = null;
    }
    renderHistoryList();
  }

  function clearMessages() {
    // 保留 welcome
    messagesEl.querySelectorAll('.chat-msg').forEach(el => el.remove());
    state.messages = [];
    state.currentSessionId = null;
    if (welcomeEl) welcomeEl.style.display = '';
  }

  function newChat() {
    if (state.isStreaming) stopStreaming();
    clearMessages();
  }

  // ==================== 设置面板 ====================
  function openSettings() {
    renderApiList();
    if (settingsModal) settingsModal.style.display = '';
    if (modalBackdrop) modalBackdrop.style.display = '';
  }

  function closeSettings() {
    if (settingsModal) settingsModal.style.display = 'none';
    if (modalBackdrop) modalBackdrop.style.display = 'none';
  }

  function renderApiList() {
    if (!apiListEl) return;
    const { PROVIDERS, apiManager } = ChatAPI;
    const keys = apiManager.getKeys();

    apiListEl.innerHTML = '';

    // 内置提供商
    Object.entries(PROVIDERS).forEach(([id, cfg]) => {
      const keyData = keys[id] || {};
      const hasKey = !!keyData.key;
      apiListEl.appendChild(createApiCard(id, cfg.name, hasKey, keyData));
    });

    // 自定义提供商
    Object.entries(keys).forEach(([id, keyData]) => {
      if (PROVIDERS[id]) return; // 跳过内置
      if (!keyData.custom) return;
      apiListEl.appendChild(createApiCard(id, keyData.customName || id, !!keyData.key, keyData, true));
    });
  }

  function createApiCard(id, displayName, hasKey, keyData, isCustom = false) {
    const card = document.createElement('div');
    card.className = 'chat-api-card';

    const statusEl = document.createElement('span');
    statusEl.className = 'chat-api-status';
    statusEl.textContent = hasKey ? '✅' : '❌';

    const nameEl = document.createElement('span');
    nameEl.className = 'chat-api-name';
    nameEl.textContent = displayName;

    const keyInput = document.createElement('input');
    keyInput.type = 'password';
    keyInput.className = 'chat-api-key-input';
    keyInput.placeholder = 'sk-...';
    keyInput.value = keyData.key || '';

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'chat-api-url-input';
    urlInput.placeholder = 'Base URL (optional)';
    urlInput.value = keyData.customBaseUrl || '';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'chat-btn chat-btn--small';
    saveBtn.textContent = hasKey ? '更新' : '保存';
    saveBtn.addEventListener('click', () => {
      ChatAPI.apiManager.setKey(id, {
        key: keyInput.value,
        customBaseUrl: urlInput.value || ''
      });
      renderApiList();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'chat-btn chat-btn--small chat-btn--danger';
    deleteBtn.textContent = '删除';
    deleteBtn.style.display = isCustom ? '' : 'none';
    deleteBtn.addEventListener('click', () => {
      ChatAPI.apiManager.removeKey(id);
      populateProviders();
      renderApiList();
    });

    card.appendChild(statusEl);
    card.appendChild(nameEl);
    card.appendChild(keyInput);
    card.appendChild(urlInput);
    card.appendChild(saveBtn);
    card.appendChild(deleteBtn);

    return card;
  }

  // ==================== 历史记录面板 ====================
  function openHistoryModal() {
    renderHistoryList();
    if (historyModal) historyModal.style.display = '';
    if (historyBackdrop) historyBackdrop.style.display = '';
  }

  function closeHistoryModal() {
    if (historyModal) historyModal.style.display = 'none';
    if (historyBackdrop) historyBackdrop.style.display = 'none';
  }

  function renderHistoryList() {
    if (!historyListEl) return;
    const { chatHistory } = ChatAPI;
    const all = chatHistory.getAll();

    if (!all.length) {
      historyListEl.innerHTML = '<div class="chat-history-empty">暂无历史对话</div>';
      return;
    }

    historyListEl.innerHTML = all.map(session => `
      <div class="chat-history-item ${session.id === state.currentSessionId ? 'chat-history-item--active' : ''}"
           data-id="${session.id}">
        <div class="chat-history-item-title">${escapeHtml(session.title)}</div>
        <div class="chat-history-item-meta">${session.messages.length} 条消息 · ${formatTime(session.updatedAt)}</div>
        <div class="chat-history-item-actions">
          <button class="chat-btn chat-btn--tiny chat-history-load" data-id="${session.id}">📂</button>
          <button class="chat-btn chat-btn--tiny chat-btn--danger chat-history-delete" data-id="${session.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    // 绑定事件
    historyListEl.querySelectorAll('.chat-history-load').forEach(btn => {
      btn.addEventListener('click', () => loadSession(btn.dataset.id));
    });
    historyListEl.querySelectorAll('.chat-history-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteSession(btn.dataset.id));
    });
  }

  // ==================== 导出对话 ====================
  function exportChat(format) {
    if (!state.messages.length) return;

    if (format === 'markdown') {
      let md = '# AI Chat Export\n\n';
      state.messages.forEach(msg => {
        const role = msg.role === 'user' ? '**You**' : '**AI**';
        md += `${role}:\n${msg.content}\n\n---\n\n`;
      });
      navigator.clipboard.writeText(md).then(() => {
        showToast('对话已复制为 Markdown');
      }).catch(() => {});
    } else if (format === 'json') {
      const json = JSON.stringify(state.messages, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        showToast('对话已复制为 JSON');
      }).catch(() => {});
    }
  }

  // ==================== Toast 提示 ====================
  let toastTimer = null;
  function showToast(msg) {
    let toast = document.querySelector('.chat-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'chat-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }

  // ==================== 工具函数 ====================
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function autoResizeTextarea() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    // 发送按钮
    sendBtn?.addEventListener('click', () => sendMessage());

    // 停止按钮
    stopBtn?.addEventListener('click', stopStreaming);

    // 回车发送，Shift+Enter 换行
    textarea?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // 自动调整高度
    textarea?.addEventListener('input', autoResizeTextarea);

    // 提供商切换 → 更新模型列表
    providerSelect?.addEventListener('change', () => {
      state.provider = providerSelect.value;
      state.model = '';
      if (state.provider) {
        populateModels(state.provider);
        ChatAPI.apiManager.setConfig({ provider: state.provider });
      } else {
        modelSelect.innerHTML = '<option value="">-- Model --</option>';
      }
    });

    // 模型切换
    modelSelect?.addEventListener('change', () => {
      state.model = modelSelect.value;
      if (state.model) {
        ChatAPI.apiManager.setConfig({ model: state.model });
      }
    });

    // 设置按钮
    settingsBtn?.addEventListener('click', openSettings);

    // 关闭设置
    modalClose?.addEventListener('click', closeSettings);
    modalBackdrop?.addEventListener('click', closeSettings);

    // 历史记录
    historyClose?.addEventListener('click', closeHistoryModal);
    historyBackdrop?.addEventListener('click', closeHistoryModal);

    // 自定义 API 添加
    customAddBtn?.addEventListener('click', () => {
      const name = $('chat-custom-name')?.value?.trim();
      const baseUrl = $('chat-custom-baseurl')?.value?.trim();
      const key = $('chat-custom-key')?.value?.trim();
      const models = $('chat-custom-models')?.value?.trim();

      if (!name || !baseUrl || !key || !models) {
        showToast('请填写所有字段');
        return;
      }

      ChatAPI.apiManager.addCustomProvider(name, baseUrl, key, models);
      populateProviders();
      renderApiList();
      showToast('自定义 API 已添加');

      // 清空表单
      $('chat-custom-name').value = '';
      $('chat-custom-baseurl').value = '';
      $('chat-custom-key').value = '';
      $('chat-custom-models').value = '';
    });

    // 注入头部工具栏按钮
    injectToolbar();
  }

  /** 在消息列表上方添加工具栏 */
  function injectToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'chat-toolbar';
    toolbar.innerHTML = `
      <div class="chat-toolbar-left">
        <span class="chat-toolbar-title" data-lang-en="🤖 AI Chat" data-lang-zh="🤖 AI 对话">🤖 AI Chat</span>
      </div>
      <div class="chat-toolbar-right">
        <button class="chat-toolbar-btn" id="chat-new-btn" title="New Chat" data-lang-en="New Chat" data-lang-zh="新对话">➕</button>
        <button class="chat-toolbar-btn" id="chat-history-btn" title="History" data-lang-en="History" data-lang-zh="历史记录">📋</button>
        <button class="chat-toolbar-btn" id="chat-export-md-btn" title="Export Markdown" data-lang-en="Export Markdown" data-lang-zh="导出 Markdown">📝</button>
        <button class="chat-toolbar-btn" id="chat-export-json-btn" title="Export JSON" data-lang-en="Export JSON" data-lang-zh="导出 JSON">📄</button>
        <button class="chat-toolbar-btn" id="chat-clear-btn" title="Clear" data-lang-en="Clear" data-lang-zh="清空">🗑️</button>
      </div>
    `;

    messagesEl.parentNode.insertBefore(toolbar, messagesEl);

    // 绑定工具栏按钮
    $('chat-new-btn')?.addEventListener('click', newChat);
    $('chat-history-btn')?.addEventListener('click', openHistoryModal);
    $('chat-export-md-btn')?.addEventListener('click', () => exportChat('markdown'));
    $('chat-export-json-btn')?.addEventListener('click', () => exportChat('json'));
    $('chat-clear-btn')?.addEventListener('click', () => {
      if (state.messages.length && confirm('确定清空当前对话？')) {
        newChat();
      }
    });
  }

  // ==================== 启动 ====================
  document.addEventListener('DOMContentLoaded', init);

})();
