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
    renderApiKeyList();
    populateDefaultProvider();
    bindEvents();
  }

  // ==================== AI 头像 ====================
  function renderAvatarPreview() {
    const preview = $('chat-avatar-preview');
    if (!preview) return;
    preview.textContent = currentAvatarData || '🤖';

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

  // ==================== API Key 管理 ====================
  function renderApiKeyList() {
    const container = $('acct-api-list');
    if (!container) return;
    const { PROVIDERS, apiManager } = ChatAPI;
    const keys = apiManager.getKeys();

    container.innerHTML = '';
    Object.entries(PROVIDERS).forEach(([id, cfg]) => {
      const keyData = keys[id] || {};
      container.appendChild(createApiCard(id, cfg.name, !!keyData.key, keyData, false));
    });
    Object.entries(keys).forEach(([id, keyData]) => {
      if (PROVIDERS[id] || !keyData.custom) return;
      container.appendChild(createApiCard(id, keyData.customName || id, !!keyData.key, keyData, true));
    });
  }

  function createApiCard(id, displayName, hasKey, keyData, isCustom) {
    const card = document.createElement('div');
    card.className = 'acct-api-card';

    card.innerHTML = `
      <span class="acct-api-status">${hasKey ? '✅' : '❌'}</span>
      <span class="acct-api-name">${displayName}</span>
      <input type="password" class="acct-api-input" placeholder="sk-..." value="${escapeHtml(keyData.key || '')}">
      <input type="url" class="acct-api-url" placeholder="Base URL (optional)" value="${escapeHtml(keyData.customBaseUrl || '')}">
      <button class="acct-btn acct-btn--small acct-api-save">${hasKey ? '更新' : '保存'}</button>
      ${isCustom ? '<button class="acct-btn acct-btn--small acct-btn--danger acct-api-delete">删除</button>' : ''}
    `;

    card.querySelector('.acct-api-save').addEventListener('click', () => {
      const keyInput = card.querySelector('.acct-api-input');
      const urlInput = card.querySelector('.acct-api-url');
      ChatAPI.apiManager.setKey(id, {
        key: keyInput.value,
        customBaseUrl: urlInput.value || ''
      });
      renderApiKeyList();
      showSyncStatus('API Key saved', 'ok');
    });

    const deleteBtn = card.querySelector('.acct-api-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        ChatAPI.apiManager.removeKey(id);
        renderApiKeyList();
        populateDefaultProvider();
      });
    }

    return card;
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

    // 默认提供商切换
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
