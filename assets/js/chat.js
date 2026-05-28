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
  const stopBtn = $('chat-stop-btn-bar');
  const providerWrap = $('chat-provider-select-wrap');
  const providerBtn = $('chat-provider-btn');
  const providerMenu = $('chat-provider-menu');
  const providerLabel = $('chat-provider-label');
  const modelWrap = $('chat-model-select-wrap');
  const modelBtn = $('chat-model-btn');
  const modelMenu = $('chat-model-menu');
  const modelLabel = $('chat-model-label');
  const depthSlider = $('chat-depth-slider');
  const depthValue = $('chat-depth-value');
  const sidebar = $('chat-sidebar');
  const sidebarList = $('chat-sidebar-list');
  const sidebarToggle = $('chat-sidebar-toggle');
  const sidebarToggleMobile = $('chat-sidebar-toggle-mobile');
  const sidebarNewBtn = $('chat-sidebar-new-btn');
  const moreBtn = $('chat-more-btn');
  const moreDropdown = $('chat-more-dropdown');
  const exportMdBtn = $('chat-export-md-btn');
  const exportJsonBtn = $('chat-export-json-btn');
  const downloadMdBtn = $('chat-download-md-btn');
  const downloadJsonBtn = $('chat-download-json-btn');
  const clearBtn = $('chat-clear-btn');
  const expandBtn = $('chat-expand-btn');
  const webToggle = $('chat-web-toggle');
  // 新增 DOM 引用
  const settingsBtn = $('chat-settings-btn');
  const settingsModal = $('chat-settings-modal');
  const settingsClose = $('chat-settings-close');
  const settingsCancel = $('chat-settings-cancel');
  const settingsSave = $('chat-settings-save');
  const settingsProviderBtn = $('chat-settings-provider-btn');
  const settingsProviderMenu = $('chat-settings-provider-menu');
  const settingsProviderLabel = $('chat-settings-provider-label');
  const settingsApiKeyInput = $('chat-settings-apikey');
  const settingsApiKeyToggle = $('chat-settings-apikey-toggle');
  const settingsSystemPrompt = $('chat-settings-system-prompt');
  const settingsAvatarInput = $('chat-settings-avatar');
  const settingsAvatarPreview = $('chat-settings-avatar-preview');
  const settingsCustomToggle = $('chat-settings-custom-toggle');
  const settingsCustomForm = $('chat-custom-provider-form');
  const settingsCustomName = $('chat-custom-name');
  const settingsCustomUrl = $('chat-custom-url');
  const settingsCustomModels = $('chat-custom-models');
  const settingsCustomSave = $('chat-custom-save-btn');
  const scrollBottomBtn = $('chat-scroll-bottom-btn');

  // ==================== 状态 ====================
  const STORAGE_SYSTEM_PROMPT = 'nous_chat_system_prompt';
  const state = {
    provider: '',
    model: '',
    messages: [],           // [{role, content}]
    isStreaming: false,
    abortController: null,
    currentSessionId: null,  // 当前对话历史 ID
    currentAiMsgEl: null,    // 当前正在输出的 AI 消息 DOM
    currentAiContent: '',    // 当前 AI 消息的纯文本缓存
    webSearchEnabled: false,
    sidebarCollapsed: false,
    thinkingDepth: 'medium',
    systemPrompt: '',        // 自定义系统提示词
    settingsOpenProvider: '', // 设置面板当前选中的提供商
  };

  // ==================== 初始化 ====================
  function init() {
    const { apiManager } = ChatAPI;

    // 恢复配置
    const savedConfig = apiManager.getConfig();
    state.provider = savedConfig.provider || 'deepseek';
    state.model = savedConfig.model || '';
    state.thinkingDepth = savedConfig.thinkingDepth || 'medium';
    state.systemPrompt = localStorage.getItem(STORAGE_SYSTEM_PROMPT) || '';

    // 填充提供商下拉
    populateProviders();

    // 如果已有 provider，选中并填充模型
    if (state.provider) {
      updateProviderLabel();
      populateModels(state.provider);
    } else {
      if (modelBtn) modelBtn.disabled = true;
      updateModelLabel([]);
    }

    updateDepthUI();

    // 读取 URL 参数 ?q=...
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery) {
      setTimeout(() => sendMessage(initialQuery), 300);
    }

    // 异步获取用户头像
    getUserAvatarUrl();
    renderSidebarHistory();
    // 更新欢迎界面头像
    const welcomeIcon = document.querySelector('.chat-welcome-icon');
    if (welcomeIcon) {
      const aiAvatar = getAiAvatar();
      if (aiAvatar && aiAvatar.startsWith('data:')) {
        welcomeIcon.innerHTML = `<img src="${aiAvatar}" alt="AI" style="width:3rem;height:3rem;border-radius:50%;object-fit:cover">`;
      } else {
        welcomeIcon.textContent = aiAvatar;
      }
    }
    bindEvents();
  }

  // ==================== 提供商/模型选择 ====================
  const DEPTH_LABELS = {
    low: { en: 'Low', zh: '浅' },
    medium: { en: 'Medium', zh: '中' },
    high: { en: 'High', zh: '深' }
  };

  const DEPTH_INSTRUCTIONS = {
    low: {
      en: 'Answer briefly and directly. Avoid extra explanation unless asked.',
      zh: '请简洁直接回答，避免多余解释，除非用户要求。'
    },
    medium: {
      en: 'Answer with balanced detail. Include key steps or rationale when helpful.',
      zh: '请提供适中细节的回答，必要时给出关键步骤或理由。'
    },
    high: {
      en: 'Answer thoroughly with reasoning steps, caveats, and examples when relevant.',
      zh: '请给出深入回答，包含推理步骤、注意事项与必要示例。'
    }
  };

  function getLangKey() {
    const lang = document.documentElement.lang || 'en';
    return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function normalizeDepth(depth) {
    return (depth === 'low' || depth === 'medium' || depth === 'high') ? depth : 'medium';
  }

  function getDepthInstruction(depth) {
    const d = normalizeDepth(depth);
    return DEPTH_INSTRUCTIONS[d]?.[getLangKey()] || '';
  }

  function getDepthTemperature(depth) {
    const d = normalizeDepth(depth);
    if (d === 'low') return 0.4;
    if (d === 'high') return 0.9;
    return 0.7;
  }

  function updateDepthUI() {
    if (!depthSlider || !depthValue) return;
    const depth = normalizeDepth(state.thinkingDepth);
    depthSlider.value = depth === 'low' ? '1' : depth === 'high' ? '3' : '2';
    depthValue.dataset.langEn = DEPTH_LABELS[depth].en;
    depthValue.dataset.langZh = DEPTH_LABELS[depth].zh;
    depthValue.textContent = DEPTH_LABELS[depth][getLangKey()];
  }

  function getBingSearchConfig() {
    const endpoint = (window.BING_SEARCH_ENDPOINT || '').trim();
    const market = (window.BING_SEARCH_MARKET || 'zh-CN').trim();
    const count = Number(window.BING_SEARCH_COUNT || 5);
    return { endpoint, market, count: Number.isFinite(count) ? count : 5 };
  }

  function formatWebContext(query, results) {
    const lines = results.map((r, i) => {
      const title = r.name || r.title || 'Untitled';
      const url = r.url || r.link || '';
      const snippet = r.snippet || r.description || '';
      return `${i + 1}. ${title}\n${url}\n${snippet}`.trim();
    });
    const header = getLangKey() === 'zh'
      ? `以下是 Bing 搜索结果（query: ${query}）：`
      : `Bing search results (query: ${query}):`;
    const footer = getLangKey() === 'zh'
      ? '请仅在需要时使用这些信息，并标注来源链接。'
      : 'Use these sources when helpful and cite the links.';
    return `${header}\n\n${lines.join('\n\n')}\n\n${footer}`;
  }

  async function runWebSearch(query) {
    const { endpoint, market, count } = getBingSearchConfig();
    if (!endpoint) {
      showToast(getLangKey() === 'zh' ? '请先配置 Bing 搜索代理' : 'Configure Bing search proxy first');
      return '';
    }

    try {
      const url = new URL(endpoint);
      url.searchParams.set('q', query);
      url.searchParams.set('mkt', market || 'zh-CN');
      url.searchParams.set('count', String(Math.max(1, Math.min(count || 5, 10))));

      const res = await fetch(url.toString(), { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const raw = data.results || data.webPages?.value || [];
      if (!raw.length) return '';

      const results = raw.slice(0, 8).map(r => ({
        name: r.name,
        url: r.url,
        snippet: r.snippet
      }));

      return formatWebContext(query, results);
    } catch (e) {
      console.error('[Chat] Web search failed:', e);
      showToast(getLangKey() === 'zh' ? '联网搜索失败，已继续回答' : 'Web search failed, continuing without it');
      return '';
    }
  }

  function closeSelectMenus() {
    providerWrap?.classList.remove('is-open');
    modelWrap?.classList.remove('is-open');
    if (providerBtn) providerBtn.setAttribute('aria-expanded', 'false');
    if (modelBtn) modelBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleSelectMenu(type) {
    const wrap = type === 'provider' ? providerWrap : modelWrap;
    if (!wrap) return;
    const isOpen = wrap.classList.contains('is-open');
    closeSelectMenus();
    if (!isOpen) {
      wrap.classList.add('is-open');
      const btn = type === 'provider' ? providerBtn : modelBtn;
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  }

  function updateProviderLabel() {
    if (!providerLabel) return;
    if (!state.provider) {
      providerLabel.textContent = '-- Provider --';
      return;
    }
    const providers = ChatAPI.apiManager.getAllProviders();
    providerLabel.textContent = providers[state.provider]?.name || state.provider;
  }

  function updateModelLabel(models) {
    if (!modelLabel) return;
    if (!state.model) {
      modelLabel.textContent = '-- Model --';
      return;
    }
    const list = models || ChatAPI.apiManager.getModels(state.provider);
    const found = list.find(m => m.id === state.model);
    modelLabel.textContent = found?.name || state.model;
  }

  function setProvider(providerId) {
    if (!providerId) return;
    if (state.provider === providerId) {
      closeSelectMenus();
      return;
    }
    state.provider = providerId;
    state.model = '';
    ChatAPI.apiManager.setConfig({ provider: state.provider, model: '' });
    populateProviders();
    populateModels(providerId);
    closeSelectMenus();
  }

  function setModel(modelId) {
    if (!modelId) return;
    state.model = modelId;
    ChatAPI.apiManager.setConfig({ model: state.model });
    populateModels(state.provider);
    closeSelectMenus();
  }

  function populateProviders() {
    if (!providerMenu) return;
    providerMenu.innerHTML = '';
    const providers = ChatAPI.apiManager.getAllProviders();
    Object.entries(providers).forEach(([id, cfg]) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'chat-select-item' + (id === state.provider ? ' is-active' : '');
      item.dataset.value = id;
      item.textContent = cfg.name;
      item.addEventListener('click', () => setProvider(id));
      providerMenu.appendChild(item);
    });
    updateProviderLabel();
  }

  function populateModels(providerId) {
    if (!modelMenu || !modelBtn) return;
    modelMenu.innerHTML = '';
    const models = ChatAPI.apiManager.getModels(providerId);
    if (!providerId || !models.length) {
      modelBtn.disabled = true;
      state.model = '';
      updateModelLabel([]);
      return;
    }
    modelBtn.disabled = false;

    const defaultModel = ChatAPI.apiManager.getDefaultModel(providerId);
    const hasSaved = models.some(m => m.id === state.model);
    const selected = hasSaved ? state.model : (defaultModel || models[0].id);
    state.model = selected;

    models.forEach(m => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'chat-select-item' + (m.id === state.model ? ' is-active' : '');
      item.dataset.value = m.id;
      item.textContent = m.name;
      item.addEventListener('click', () => setModel(m.id));
      modelMenu.appendChild(item);
    });

    updateModelLabel(models);
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
      temperature: getDepthTemperature(state.thinkingDepth),
      reasoningEffort: state.thinkingDepth
    };

    // 保存配置
    apiManager.setConfig(config);

    const requestMessages = [];
    // 自定义系统提示词（优先级最高）
    if (state.systemPrompt && state.systemPrompt.trim()) {
      requestMessages.push({ role: 'system', content: state.systemPrompt.trim() });
    }
    const depthInstruction = getDepthInstruction(state.thinkingDepth);
    if (depthInstruction && !state.systemPrompt.trim()) {
      requestMessages.push({ role: 'system', content: depthInstruction });
    }

    if (state.webSearchEnabled) {
      const webContext = await runWebSearch(q);
      if (webContext) {
        requestMessages.push({ role: 'system', content: webContext });
      }
    }

    requestMessages.push(...state.messages);

    state.abortController = chatAPI.streamChat(
      requestMessages,
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

  // ==================== 用户头像（与导航栏一致） ====================
  let _userAvatarUrl = '';
  async function getUserAvatarUrl() {
    if (_userAvatarUrl) return _userAvatarUrl;
    try {
      const Auth = window.Auth;
      if (Auth && typeof Auth.getUser === 'function') {
        const { data } = await Auth.getUser();
        const user = data?.user;
        if (user) {
          const identities = user.identities || [];
          const githubIdentity = identities.find(id => id.provider === 'github');
          _userAvatarUrl = githubIdentity?.identity_data?.avatar_url
            || user.user_metadata?.avatar_url
            || '';
        }
      }
    } catch (e) { /* ignore */ }
    return _userAvatarUrl;
  }

  // ==================== 消息渲染 ====================
  function appendMessage(role, content, extraClass = '') {
    if (welcomeEl) welcomeEl.style.display = 'none';

    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role} ${extraClass}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    if (role === 'user') {
      const url = _userAvatarUrl;
      if (url) {
        avatar.innerHTML = `<img class="nav-avatar-img" src="${url}" alt="avatar" referrerpolicy="no-referrer" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      } else {
        avatar.textContent = '👤';
      }
    } else if (role === 'ai') {
      const aiAvatar = getAiAvatar();
      if (aiAvatar && aiAvatar.startsWith('data:')) {
        avatar.innerHTML = `<img src="${aiAvatar}" alt="AI" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      } else {
        avatar.textContent = aiAvatar;
      }
    } else {
      avatar.textContent = '⚙️';
    }

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';

    if (role === 'user') {
      bubble.textContent = content;
    } else if (role === 'system') {
      bubble.textContent = content;
    } else {
      // AI 消息：显示打字动画
      bubble.innerHTML = '<div class="chat-typing-dots"><span></span><span></span><span></span></div>';
    }

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'chat-msg-body';
    bodyWrap.appendChild(bubble);

    // 消息操作按钮
    const actions = document.createElement('div');
    actions.className = 'chat-msg-actions';

    if (role === 'ai' && content) {
      // 复制按钮
      const copyBtn = document.createElement('button');
      copyBtn.className = 'chat-msg-action-btn';
      copyBtn.textContent = '📋 Copy';
      copyBtn.title = 'Copy message';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content).then(() => {
          copyBtn.textContent = '✅ Copied';
          setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
        }).catch(() => {});
      });
      actions.appendChild(copyBtn);

      // 重新生成按钮
      const regenBtn = document.createElement('button');
      regenBtn.className = 'chat-msg-action-btn';
      regenBtn.textContent = '🔄 Regenerate';
      regenBtn.title = 'Regenerate response';
      regenBtn.addEventListener('click', () => regenerateResponse());
      actions.appendChild(regenBtn);
    }

    if (role === 'user') {
      // 编辑按钮
      const editBtn = document.createElement('button');
      editBtn.className = 'chat-msg-action-btn';
      editBtn.textContent = '✏️ Edit';
      editBtn.title = 'Edit and resend';
      editBtn.addEventListener('click', () => editAndResend(div, content));
      actions.appendChild(editBtn);
    }

    bodyWrap.appendChild(actions);
    div.appendChild(avatar);
    div.appendChild(bodyWrap);

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

    // 移除打字动画
    const dotsEl = bubble.querySelector('.chat-typing-dots');
    if (dotsEl) dotsEl.remove();

    // 如果有旧的"思考中"占位，移除
    const thinkingEl = bubble.querySelector('.chat-msg-thinking');
    if (thinkingEl) thinkingEl.remove();

    try {
      const rawHtml = marked.parse(content);
      if (window.DOMPurify) {
        bubble.innerHTML = window.DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target', 'rel'] });
        enhanceCodeBlocks(bubble);
      } else {
        bubble.textContent = content;
      }
    } catch {
      bubble.textContent = content;
    }

    // 更新复制按钮（action buttons 里的 Copy）
    const copyBtn = msgEl.querySelector('.chat-msg-action-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content).then(() => {
          copyBtn.textContent = '✅ Copied';
          setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
        }).catch(() => {});
      }, { once: true });
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
      if (messagesEl) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
      checkScrollPosition();
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
    renderSidebarHistory();
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
        appendMessage('user', msg.content);
      } else if (msg.role === 'assistant') {
        const el = appendMessage('ai', '');
        updateAiMessage(el, msg.content);
      }
    });

    renderSidebarHistory();
  }

  function deleteSession(sessionId) {
    const { chatHistory } = ChatAPI;
    chatHistory.remove(sessionId);
    if (state.currentSessionId === sessionId) {
      state.currentSessionId = null;
    }
    renderSidebarHistory();
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

  // ==================== 重新生成回复 ====================
  function regenerateResponse() {
    if (state.isStreaming) return;
    // 移除最后一条 AI 消息
    if (state.messages.length > 0 && state.messages[state.messages.length - 1].role === 'assistant') {
      state.messages.pop();
    }
    // 移除最后一条用户消息（重新发送）
    const lastUserMsg = [...state.messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    // 从 DOM 中移除最后一条 AI 消息
    const aiMsgs = messagesEl.querySelectorAll('.chat-msg--ai');
    if (aiMsgs.length > 0) aiMsgs[aiMsgs.length - 1].remove();
    // 重新发送
    sendMessage(lastUserMsg.content);
  }

  // ==================== 编辑并重发 ====================
  function editAndResend(msgEl, oldContent) {
    if (state.isStreaming) return;
    // 找到该消息在 state.messages 中的位置
    const idx = Array.from(messagesEl.querySelectorAll('.chat-msg--user')).indexOf(msgEl);
    if (idx < 0) return;
    // 计算在 state.messages 中的索引（跳过 system 消息）
    const userMsgs = state.messages.filter(m => m.role === 'user');
    const userIdx = state.messages.indexOf(userMsgs[idx]);
    if (userIdx < 0) return;

    // 用当前内容填充输入框
    if (textarea) {
      textarea.value = oldContent;
      textarea.focus();
      autoResizeTextarea();
    }
    // 截断消息历史到该消息之前
    state.messages = state.messages.slice(0, userIdx);
    // 从 DOM 中移除该消息及之后的所有消息
    let el = msgEl;
    while (el) {
      const next = el.nextElementSibling;
      if (el.classList.contains('chat-msg')) el.remove();
      el = next;
    }
    state.currentSessionId = null;
  }

  // ==================== 滚动监听（显示/隐藏滚底按钮） ====================
  function checkScrollPosition() {
    if (!scrollBottomBtn || !messagesEl) return;
    const threshold = 120;
    const distToBottom = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight;
    if (distToBottom > threshold) {
      scrollBottomBtn.classList.add('is-visible');
    } else {
      scrollBottomBtn.classList.remove('is-visible');
    }
  }

  // ==================== 设置面板 ====================
  function openSettings() {
    if (!settingsModal) return;
    state.settingsOpenProvider = state.provider || 'deepseek';
    renderSettingsProviderMenu();
    loadSettingsToForm();
    if (settingsCustomForm) settingsCustomForm.style.display = 'none';
    settingsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeSettings() {
    if (!settingsModal) return;
    settingsModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function loadSettingsToForm() {
    const { apiManager } = ChatAPI;
    const keys = apiManager.getKeys();
    const keyData = keys[state.settingsOpenProvider] || {};
    if (settingsApiKeyInput) settingsApiKeyInput.value = keyData.key || '';
    if (settingsSystemPrompt) settingsSystemPrompt.value = state.systemPrompt;
    // 头像
    const avatarType = localStorage.getItem('nous_chat_avatar_type') || 'emoji';
    const avatarData = localStorage.getItem('nous_chat_avatar') || '🤖';
    if (settingsAvatarInput) settingsAvatarInput.value = avatarType === 'upload' ? '(uploaded image)' : avatarData;
    updateAvatarPreview();
  }

  function saveSettingsFromForm() {
    const { apiManager } = ChatAPI;
    const provider = state.settingsOpenProvider;
    if (!provider) return;

    // 保存 API Key
    const key = (settingsApiKeyInput?.value || '').trim();
    if (key && key !== '(uploaded image)') {
      apiManager.setKey(provider, { key });
    }

    // 保存系统提示词
    const prompt = (settingsSystemPrompt?.value || '').trim();
    state.systemPrompt = prompt;
    localStorage.setItem(STORAGE_SYSTEM_PROMPT, prompt);

    // 保存头像
    const avatarVal = (settingsAvatarInput?.value || '').trim();
    if (avatarVal && avatarVal !== '(uploaded image)') {
      if (avatarVal.startsWith('data:')) {
        localStorage.setItem('nous_chat_avatar_type', 'upload');
        localStorage.setItem('nous_chat_avatar', avatarVal);
      } else {
        localStorage.setItem('nous_chat_avatar_type', 'emoji');
        localStorage.setItem('nous_chat_avatar', avatarVal);
      }
    }

    closeSettings();
    showToast(getLangKey() === 'zh' ? '✅ 设置已保存' : '✅ Settings saved');
  }

  function renderSettingsProviderMenu() {
    if (!settingsProviderMenu || !settingsProviderBtn) return;
    settingsProviderMenu.innerHTML = '';
    const providers = ChatAPI.apiManager.getAllProviders();
    const keys = ChatAPI.apiManager.getKeys();

    Object.entries(providers).forEach(([id, cfg]) => {
      const hasKey = !!(keys[id]?.key);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'chat-select-item' + (id === state.settingsOpenProvider ? ' is-active' : '');
      item.dataset.value = id;
      item.innerHTML = `${cfg.name} ${hasKey ? '<span style="color:var(--accent-solid);margin-left:4px">🔑</span>' : ''}`;
      item.addEventListener('click', () => {
        state.settingsOpenProvider = id;
        renderSettingsProviderMenu();
        loadSettingsToForm();
        // 关闭下拉
        document.getElementById('chat-settings-provider-wrap')?.classList.remove('is-open');
      });
      settingsProviderMenu.appendChild(item);
    });

    // 更新标签
    const provCfg = providers[state.settingsOpenProvider];
    if (settingsProviderLabel) {
      settingsProviderLabel.textContent = provCfg?.name || '-- Select --';
    }
  }

  function updateAvatarPreview() {
    if (!settingsAvatarPreview) return;
    const val = (settingsAvatarInput?.value || '').trim();
    if (val.startsWith('data:')) {
      settingsAvatarPreview.innerHTML = `<img src="${val}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
    } else if (val.startsWith('http')) {
      settingsAvatarPreview.innerHTML = `<img src="${val}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover" referrerpolicy="no-referrer">`;
    } else {
      settingsAvatarPreview.textContent = val || '🤖';
    }
  }

  function saveCustomProvider() {
    const name = (settingsCustomName?.value || '').trim();
    const url = (settingsCustomUrl?.value || '').trim();
    const modelsStr = (settingsCustomModels?.value || '').trim();
    if (!name || !url) {
      showToast('Please fill in provider name and base URL');
      return;
    }
    ChatAPI.apiManager.addCustomProvider(name, url, '', modelsStr);
    if (settingsCustomName) settingsCustomName.value = '';
    if (settingsCustomUrl) settingsCustomUrl.value = '';
    if (settingsCustomModels) settingsCustomModels.value = '';
    if (settingsCustomForm) settingsCustomForm.style.display = 'none';
    renderSettingsProviderMenu();
    // 同时刷新主界面的提供商列表
    populateProviders();
    showToast(getLangKey() === 'zh' ? '✅ 自定义提供商已添加' : '✅ Custom provider added');
  }

  // ==================== 键盘快捷键 ====================
  function handleGlobalKeyboard(e) {
    // Ctrl+K / Cmd+K → 新对话
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      newChat();
      return;
    }
    // Ctrl+, / Cmd+, → 打开设置
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
      e.preventDefault();
      openSettings();
      return;
    }
    // Escape → 关闭设置面板
    if (e.key === 'Escape' && settingsModal && settingsModal.style.display === 'flex') {
      closeSettings();
      return;
    }
  }

  // ==================== 导出下载文件 ====================
  function downloadExport(format) {
    if (!state.messages.length) { showToast('没有可导出的对话'); return; }
    let content, filename, mime;
    const ts = new Date().toISOString().slice(0, 10);

    if (format === 'markdown') {
      let md = '# AI Chat Export\n\n';
      state.messages.forEach(msg => {
        md += `**${msg.role === 'user' ? 'You' : 'AI'}**:\n${msg.content}\n\n---\n\n`;
      });
      content = md;
      filename = `chat-export-${ts}.md`;
      mime = 'text/markdown';
    } else {
      content = JSON.stringify(state.messages, null, 2);
      filename = `chat-export-${ts}.json`;
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(getLangKey() === 'zh' ? `📥 已下载 ${filename}` : `📥 Downloaded ${filename}`);
    closeMoreDropdown();
  }

  // ==================== 侧栏历史 ====================
  function renderSidebarHistory() {
    if (!sidebarList) return;
    const { chatHistory } = ChatAPI;
    const all = chatHistory.getAll();

    if (!all.length) {
      sidebarList.innerHTML = '<div class="chat-sidebar-empty" data-lang-en="No history yet" data-lang-zh="暂无历史记录">暂无历史记录</div>';
      return;
    }

    sidebarList.innerHTML = all.map(session => `
      <div class="chat-sidebar-item ${session.id === state.currentSessionId ? 'chat-sidebar-item--active' : ''}"
           data-id="${escapeHtml(session.id)}">
        <div class="chat-sidebar-item-main">
          <span class="chat-sidebar-item-title">${escapeHtml(session.title)}</span>
          <span class="chat-sidebar-item-time">${escapeHtml(formatTime(session.updatedAt || session.createdAt))}</span>
        </div>
        <button class="chat-sidebar-item-delete" data-id="${escapeHtml(session.id)}" title="Delete">✕</button>
      </div>
    `).join('');

    sidebarList.querySelectorAll('.chat-sidebar-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('.chat-sidebar-item-delete')) return;
        loadSession(item.dataset.id);
      });
    });
    sidebarList.querySelectorAll('.chat-sidebar-item-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        deleteSession(btn.dataset.id);
      });
    });
  }

  // ==================== 侧栏折叠 ====================
  function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
  }

  // ==================== More 下拉 ====================
  function toggleMoreDropdown(e) {
    e.stopPropagation();
    if (!moreDropdown) return;
    const isOpen = moreDropdown.style.display !== 'none';
    moreDropdown.style.display = isOpen ? 'none' : '';
  }

  function closeMoreDropdown() {
    if (moreDropdown) moreDropdown.style.display = 'none';
  }

  // ==================== 导出 ====================
  function exportChat(format) {
    if (!state.messages.length) { showToast('没有可导出的对话'); return; }
    if (format === 'markdown') {
      let md = '# AI Chat Export\n\n';
      state.messages.forEach(msg => {
        md += `**${msg.role === 'user' ? 'You' : 'AI'}**:\n${msg.content}\n\n---\n\n`;
      });
      navigator.clipboard.writeText(md).then(() => showToast('已复制为 Markdown')).catch(() => {});
    } else {
      navigator.clipboard.writeText(JSON.stringify(state.messages, null, 2))
        .then(() => showToast('已复制为 JSON')).catch(() => {});
    }
    closeMoreDropdown();
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
  function getAiAvatar() {
    const type = localStorage.getItem('nous_chat_avatar_type') || 'emoji';
    const data = localStorage.getItem('nous_chat_avatar') || '🤖';
    if (type === 'upload' && data.startsWith('data:')) {
      return data; // data URL — 由 CSS background-image 处理
    }
    return data;
  }

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
    sendBtn?.addEventListener('click', () => sendMessage());
    stopBtn?.addEventListener('click', stopStreaming);
    textarea?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    textarea?.addEventListener('input', autoResizeTextarea);

    providerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSelectMenu('provider');
    });
    modelBtn?.addEventListener('click', (e) => {
      if (modelBtn.disabled) return;
      e.stopPropagation();
      toggleSelectMenu('model');
    });

    providerMenu?.addEventListener('click', (e) => e.stopPropagation());
    modelMenu?.addEventListener('click', (e) => e.stopPropagation());

    depthSlider?.addEventListener('input', () => {
      const v = Number(depthSlider.value || 2);
      state.thinkingDepth = v <= 1 ? 'low' : v >= 3 ? 'high' : 'medium';
      ChatAPI.apiManager.setConfig({ thinkingDepth: state.thinkingDepth });
      updateDepthUI();
    });

    webToggle?.addEventListener('click', () => {
      state.webSearchEnabled = !state.webSearchEnabled;
      webToggle.classList.toggle('chat-web-toggle--active', state.webSearchEnabled);
    });

    expandBtn?.addEventListener('click', () => {
      if (!textarea) return;
      const isExpanded = textarea.style.maxHeight === '400px';
      textarea.style.maxHeight = isExpanded ? '200px' : '400px';
      autoResizeTextarea();
    });

    sidebarToggle?.addEventListener('click', toggleSidebar);
    sidebarToggleMobile?.addEventListener('click', toggleSidebar);
    sidebarNewBtn?.addEventListener('click', newChat);

    moreBtn?.addEventListener('click', toggleMoreDropdown);
    document.addEventListener('click', closeMoreDropdown);
    document.addEventListener('click', closeSelectMenus);
    moreDropdown?.addEventListener('click', e => e.stopPropagation());

    exportMdBtn?.addEventListener('click', () => exportChat('markdown'));
    exportJsonBtn?.addEventListener('click', () => exportChat('json'));
    downloadMdBtn?.addEventListener('click', () => downloadExport('markdown'));
    downloadJsonBtn?.addEventListener('click', () => downloadExport('json'));
    clearBtn?.addEventListener('click', () => {
      if (state.messages.length && confirm('确定清空当前对话？')) newChat();
      closeMoreDropdown();
    });

    // 新增：滚动监听
    messagesEl?.addEventListener('scroll', checkScrollPosition, { passive: true });

    // 新增：滚底按钮
    scrollBottomBtn?.addEventListener('click', () => {
      scrollToBottom();
      if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    });

    // 新增：设置面板
    settingsBtn?.addEventListener('click', openSettings);
    settingsClose?.addEventListener('click', closeSettings);
    settingsCancel?.addEventListener('click', closeSettings);
    settingsSave?.addEventListener('click', saveSettingsFromForm);
    settingsModal?.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });

    // 设置面板 - 提供商下拉
    settingsProviderBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = document.getElementById('chat-settings-provider-wrap');
      if (wrap) wrap.classList.toggle('is-open');
    });
    settingsProviderMenu?.addEventListener('click', (e) => e.stopPropagation());

    // API Key 可见性切换
    settingsApiKeyToggle?.addEventListener('click', () => {
      if (!settingsApiKeyInput) return;
      const isPassword = settingsApiKeyInput.type === 'password';
      settingsApiKeyInput.type = isPassword ? 'text' : 'password';
      settingsApiKeyToggle.textContent = isPassword ? '🙈' : '👁️';
    });

    // 头像预览实时更新
    settingsAvatarInput?.addEventListener('input', updateAvatarPreview);

    // 自定义提供商
    settingsCustomToggle?.addEventListener('click', () => {
      if (settingsCustomForm) {
        const isVisible = settingsCustomForm.style.display !== 'none';
        settingsCustomForm.style.display = isVisible ? 'none' : 'flex';
      }
    });
    settingsCustomSave?.addEventListener('click', saveCustomProvider);

    // 全局键盘快捷键
    document.addEventListener('keydown', handleGlobalKeyboard);

    // 设置面板中的下拉关闭
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('chat-settings-provider-wrap');
      if (wrap && !e.target.closest('#chat-settings-provider-wrap')) {
        wrap.classList.remove('is-open');
      }
    });
  }

  // ==================== 启动 ====================
  document.addEventListener('DOMContentLoaded', init);

})();
