/**
 * account-chat.js - 账户页 AI 对话设置逻辑
 *
 * 依赖：supabase-init.js（全局 Auth, ChatSettingsAPI）
 * 功能：AI 头像选择/上传、API Key 管理、默认模型、云端同步
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  // ==================== 只在账户页运行 ====================
  if (!window.location.pathname.startsWith('/account/')) return;

  // ==================== 状态 ====================
  const STORAGE_AVATAR_KEY = 'nous_chat_avatar';
  const AVATAR_TYPE_KEY = 'nous_chat_avatar_type';

  let currentAvatarType = localStorage.getItem(AVATAR_TYPE_KEY) || 'emoji';
  let currentAvatarData = localStorage.getItem(STORAGE_AVATAR_KEY) || '🤖';

  // ==================== 初始化 ====================
  function init() {
    renderAvatarPreview();

    // ChatAPI 可能未加载（chat-api.js 未引入时降级）
    if (typeof ChatAPI === 'undefined' || !ChatAPI) {
      console.warn('[AccountChat] ChatAPI not available — API Key & model features disabled.');
      const apiSection = document.querySelector('.acct-section');
      if (apiSection) {
        apiSection.innerHTML = '<p style="color:var(--muted);font-size:.88rem">⚠️ ChatAPI 未加载，请刷新页面或检查网络。</p>';
      }
      bindEvents();
      return;
    }

    renderApiKeyList();
    populateDefaultProvider();
    bindEvents();
  }

  // ==================== AI 头像 ====================
  function renderAvatarPreview() {
    const preview = $('chat-avatar-preview');
    if (!preview) return;
    if (currentAvatarType === 'upload' && currentAvatarData && currentAvatarData.startsWith('data:')) {
      preview.innerHTML = `<img src="${currentAvatarData}" alt="AI" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
    } else {
      preview.textContent = currentAvatarData || '🤖';
    }

    // 高亮当前选中的 emoji
    document.querySelectorAll('.chat-avatar-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.avatar === currentAvatarData && currentAvatarType === 'emoji');
    });
  }

  function setAvatar(value, type) {
    currentAvatarData = value;
    currentAvatarType = type;
    localStorage.setItem(STORAGE_AVATAR_KEY, value);
    localStorage.setItem(AVATAR_TYPE_KEY, type);
    renderAvatarPreview();
  }

  function handleAvatarUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      // 限制大小 200KB
      if (dataUrl.length > 200 * 1024) {
        showSyncStatus('Image too large (max 200KB)', 'err');
        return;
      }
      setAvatar(dataUrl, 'upload');
    };
    reader.readAsDataURL(file);
  }

  // ==================== API Key 管理（重构版） ====================

  let _selectedProviderId = '';

  /** 填充提供商下拉列表 */
  function populateProviderSelect() {
    const sel = $('acct-api-provider');
    if (!sel) return;
    const { apiManager } = ChatAPI;
    const allProviders = apiManager.getAllProviders();

    sel.innerHTML = '<option value="">— 选择提供商 —</option>';
    Object.entries(allProviders).forEach(([id, cfg]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = cfg.name + (cfg.custom ? ' ⚡' : '');
      sel.appendChild(opt);
    });
  }

  /** 提供商切换时更新模型列表 */
  function onProviderChange(providerId) {
    _selectedProviderId = providerId;
    const modelsContainer = $('acct-api-models');
    const tagsContainer = $('acct-api-model-tags');
    const keyInput = $('acct-api-key-input');
    const baseUrlInput = $('acct-api-baseurl');
    const saveBtn = $('acct-api-save-btn');

    if (!providerId) {
      if (modelsContainer) modelsContainer.style.display = 'none';
      if (keyInput) keyInput.value = '';
      if (baseUrlInput) baseUrlInput.value = '';
      return;
    }

    // 显示模型列表
    const { apiManager } = ChatAPI;
    const models = apiManager.getModels(providerId);
    const keys = apiManager.getKeys();
    const keyData = keys[providerId] || {};

    if (tagsContainer) {
      tagsContainer.innerHTML = models.map(m => `
        <span class="acct-api-model-tag">${escapeHtml(m.name)}</span>
      `).join('');
    }
    if (modelsContainer) modelsContainer.style.display = '';

    // 回填已保存的 Key
    if (keyInput) keyInput.value = keyData.key || '';
    if (baseUrlInput) {
      baseUrlInput.value = keyData.customBaseUrl || apiManager.getBaseUrl(providerId) || '';
      baseUrlInput.placeholder = keyData.customBaseUrl
        ? '自定义 Base URL'
        : 'Base URL (可选，留空用默认)';
    }

    // 更新保存按钮文案
    if (saveBtn) {
      saveBtn.textContent = keyData.key ? '🔄 更新 Key' : '💾 保存 Key';
    }
  }

  /** 显示 API Key 区域的本地状态提示 */
  function showApiKeyStatus(msg, type) {
    const el = $('acct-api-key-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'acct-api-key-status' + (type === 'ok' ? ' acct-api-key-status--ok' : type === 'err' ? ' acct-api-key-status--err' : '');
    if (type === 'ok' || type === 'err') {
      setTimeout(() => { el.textContent = ''; el.className = 'acct-api-key-status'; }, 3500);
    }
  }

  /** 保存当前选中提供商的 API Key */
  function saveCurrentApiKey() {
    const providerId = _selectedProviderId;
    if (!providerId) {
      showApiKeyStatus('⚠️ 请先选择一个提供商', 'err');
      return;
    }

    const keyInput = $('acct-api-key-input');
    const baseUrlInput = $('acct-api-baseurl');
    if (!keyInput) return;

    const key = keyInput.value.trim();
    if (!key) {
      showApiKeyStatus('⚠️ 请输入 API Key', 'err');
      keyInput.focus();
      return;
    }

    const { apiManager } = ChatAPI;
    apiManager.setKey(providerId, {
      key,
      customBaseUrl: baseUrlInput?.value?.trim() || ''
    });

    renderApiKeyStatusBar();
    showApiKeyStatus('✅ 已保存 (' + (apiManager.getAllProviders()[providerId]?.name || providerId) + ')', 'ok');

    // 更新按钮文案
    const saveBtn = $('acct-api-save-btn');
    if (saveBtn) saveBtn.textContent = '🔄 更新 Key';

    // 通知 chat.js 刷新模型列表（通过自定义事件）
    window.dispatchEvent(new CustomEvent('apikey:saved', { detail: { provider: providerId } }));
  }

  /** 删除指定提供商的 API Key */
  function removeApiKey(providerId) {
    const { apiManager } = ChatAPI;
    const providerName = apiManager.getAllProviders()[providerId]?.name || providerId;

    if (!confirm(`确定要删除 ${providerName} 的 API Key 吗？`)) return;

    apiManager.removeKey(providerId);
    renderApiKeyStatusBar();
    showApiKeyStatus(`已删除 ${providerName} 的 API Key`, 'ok');

    // 如果当前选中的就是被删除的提供商，清空输入
    if (_selectedProviderId === providerId) {
      const keyInput = $('acct-api-key-input');
      if (keyInput) keyInput.value = '';
      const saveBtn = $('acct-api-save-btn');
      if (saveBtn) saveBtn.textContent = '💾 保存 Key';
    }
  }

  /** 渲染已保存的 Key 状态条 */
  function renderApiKeyStatusBar() {
    const bar = $('acct-api-status-bar');
    if (!bar) return;
    const { apiManager } = ChatAPI;
    const allProviders = apiManager.getAllProviders();
    const keys = apiManager.getKeys();

    const entries = [];
    Object.entries(allProviders).forEach(([id, cfg]) => {
      const hasKey = !!(keys[id]?.key);
      entries.push({ id, name: cfg.name, hasKey, isCustom: !!cfg.custom });
    });

    if (!entries.length) {
      bar.innerHTML = '<span style="color:var(--muted);font-size:.82rem">暂无已保存的 Key</span>';
      return;
    }

    bar.innerHTML = entries.map(({ id, name, hasKey, isCustom }) => `
      <span class="acct-api-status-chip" data-provider="${escapeHtml(id)}">
        <span class="chip-icon">${hasKey ? '✅' : '❌'}</span>
        <span>${escapeHtml(name)}${isCustom ? ' ⚡' : ''}</span>
        ${hasKey ? `<button class="chip-remove" data-provider="${escapeHtml(id)}" title="删除 Key">✕</button>` : ''}
      </span>
    `).join('');

    // 点击芯片切换选中该提供商
    bar.querySelectorAll('.acct-api-status-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.closest('.chip-remove')) return;
        const pid = chip.dataset.provider;
        const sel = $('acct-api-provider');
        if (sel) {
          sel.value = pid;
          onProviderChange(pid);
        }
      });
    });

    // 删除按钮
    bar.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeApiKey(btn.dataset.provider);
      });
    });
  }

  /** 渲染整个 API Key 管理界面（旧版兼容入口，现拆分为子函数） */
  function renderApiKeyList() {
    populateProviderSelect();
    renderApiKeyStatusBar();

    // 如果有已保存的 Key，自动选中第一个有 Key 的提供商
    const { apiManager } = ChatAPI;
    const keys = apiManager.getKeys();
    const sel = $('acct-api-provider');
    if (sel && !sel.value) {
      const savedIds = Object.keys(keys).filter(k => keys[k].key);
      if (savedIds.length > 0) {
        sel.value = savedIds[0];
        onProviderChange(savedIds[0]);
      }
    }
  }

  // ==================== 默认模型 ====================
  function populateDefaultProvider() {
    const providerSelect = $('acct-default-provider');
    const modelSelect = $('acct-default-model');
    if (!providerSelect || !modelSelect) return;

    const savedConfig = ChatAPI.apiManager.getConfig();
    if (savedConfig.provider) providerSelect.value = savedConfig.provider;
    populateDefaultModels(providerSelect.value);

    if (savedConfig.model) modelSelect.value = savedConfig.model;
  }

  function populateDefaultModels(providerId) {
    const modelSelect = $('acct-default-model');
    if (!modelSelect) return;
    const models = ChatAPI.apiManager.getModels(providerId);
    modelSelect.innerHTML = '<option value="">-- Model --</option>';
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      modelSelect.appendChild(opt);
    });
  }

  // ==================== 云端同步 ====================
  async function pushToCloud() {
    const statusEl = $('acct-chat-sync-status');
    if (!statusEl) return;
    statusEl.textContent = 'Syncing...';

    try {
      const apiKeys = ChatAPI.apiManager.getKeys();
      const savedConfig = ChatAPI.apiManager.getConfig();

      await ChatSettingsAPI.save({
        avatar_data: currentAvatarData,
        avatar_type: currentAvatarType,
        default_provider: savedConfig.provider || 'deepseek',
        default_model: savedConfig.model || 'deepseek-chat',
        api_keys: apiKeys
      });

      showSyncStatus('✅ Synced to cloud!', 'ok');
    } catch (e) {
      console.error('[ChatSettings] Push error:', e);
      showSyncStatus('❌ Sync failed. Are you logged in?', 'err');
    }
  }

  async function pullFromCloud() {
    const statusEl = $('acct-chat-sync-status');
    if (!statusEl) return;
    statusEl.textContent = 'Pulling...';

    try {
      const data = await ChatSettingsAPI.fetch();
      if (!data) {
        showSyncStatus('No cloud data found', 'err');
        return;
      }

      // 恢复头像
      if (data.avatar_data) {
        setAvatar(data.avatar_data, data.avatar_type || 'emoji');
      }

      // 恢复配置
      if (data.default_provider || data.default_model) {
        ChatAPI.apiManager.setConfig({
          provider: data.default_provider || 'deepseek',
          model: data.default_model || ''
        });
        populateDefaultProvider();
      }

      // 恢复 API Keys（手动）
      if (data.api_keys && typeof data.api_keys === 'object') {
        const keys = data.api_keys;
        Object.keys(keys).forEach(k => {
          ChatAPI.apiManager.setKey(k, keys[k]);
        });
        renderApiKeyList();
      }

      showSyncStatus('✅ Pulled from cloud!', 'ok');
    } catch (e) {
      console.error('[ChatSettings] Pull error:', e);
      showSyncStatus('❌ Pull failed. Are you logged in?', 'err');
    }
  }

  function showSyncStatus(msg, type) {
    const el = $('acct-chat-sync-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'acct-sync-status ' + (type === 'ok' ? 'acct-sync-ok' : 'acct-sync-err');
    setTimeout(() => { el.textContent = ''; el.className = 'acct-sync-status'; }, 4000);
  }

  // ==================== 工具 ====================
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ==================== 事件绑定 ====================
  function bindEvents() {
    // 头像 emoji 选择
    document.querySelectorAll('.chat-avatar-option').forEach(btn => {
      btn.addEventListener('click', () => setAvatar(btn.dataset.avatar, 'emoji'));
    });

    // 头像上传
    const uploadInput = $('chat-avatar-upload');
    uploadInput?.addEventListener('change', e => {
      if (e.target.files?.length) handleAvatarUpload(e.target.files[0]);
    });

    // ---- API Key 管理事件 ----

    // 提供商下拉切换
    const providerSel = $('acct-api-provider');
    providerSel?.addEventListener('change', () => {
      onProviderChange(providerSel.value);
    });

    // 保存 API Key
    $('acct-api-save-btn')?.addEventListener('click', saveCurrentApiKey);

    // API Key 输入框回车保存
    const keyInput = $('acct-api-key-input');
    keyInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveCurrentApiKey();
      }
    });

    // ---- 默认模型 ----
    const defaultProvider = $('acct-default-provider');
    defaultProvider?.addEventListener('change', () => {
      populateDefaultModels(defaultProvider.value);
    });

    // 默认模型保存
    const defaultModel = $('acct-default-model');
    defaultModel?.addEventListener('change', () => {
      ChatAPI.apiManager.setConfig({
        provider: defaultProvider?.value || 'deepseek',
        model: defaultModel?.value || ''
      });
      showSyncStatus('Default model saved locally', 'ok');
    });

    // 自定义 API 添加
    $('acct-custom-add-btn')?.addEventListener('click', () => {
      const name = $('acct-custom-name')?.value?.trim();
      const baseUrl = $('acct-custom-baseurl')?.value?.trim();
      const key = $('acct-custom-key')?.value?.trim();
      const models = $('acct-custom-models')?.value?.trim();
      if (!name || !baseUrl || !key || !models) { alert('请填写所有字段'); return; }
      ChatAPI.apiManager.addCustomProvider(name, baseUrl, key, models);
      renderApiKeyList();
      $('acct-custom-name').value = '';
      $('acct-custom-baseurl').value = '';
      $('acct-custom-key').value = '';
      $('acct-custom-models').value = '';
      showSyncStatus('Custom API added', 'ok');
    });

    // 云端同步
    $('acct-chat-push-btn')?.addEventListener('click', pushToCloud);
    $('acct-chat-pull-btn')?.addEventListener('click', pullFromCloud);
  }

  // ==================== 启动 ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
