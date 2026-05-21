/**
 * supabase-auth.js - 登录弹窗、导航栏状态、账户页面
 * 依赖 supabase-init.js（需先加载）
 */
(() => {
  'use strict';

  // -------- DOM 引用 --------
  const loginBtn = document.getElementById('login-btn');
  const userAvatar = document.getElementById('user-avatar');

  // -------- 初始化：检测登录状态 & 更新 UI --------
  async function initAuthUI() {
    const { data } = await Auth.getUser();
    const user = data?.user;

    if (user) {
      // 已登录 → 显示头像
      renderLoggedIn(user);
    } else {
      // 未登录 → 显示「登录」按钮
      renderLoggedOut();
    }
  }

  // -------- 渲染：已登录 --------
  function renderLoggedIn(user) {
    if (!userAvatar) return;
    if (loginBtn) loginBtn.style.display = 'none';

    // 从 GitHub 身份元数据获取头像
    const identities = user.identities || [];
    const githubIdentity = identities.find(id => id.provider === 'github');
    const avatarUrl = githubIdentity?.identity_data?.avatar_url
      || user.user_metadata?.avatar_url
      || '';

    userAvatar.style.display = 'inline-flex';
    userAvatar.title = user.user_metadata?.full_name || user.email || 'User';

    if (avatarUrl) {
      userAvatar.innerHTML = `<img class="nav-avatar-img" src="${avatarUrl}" alt="avatar" referrerpolicy="no-referrer">`;
    } else {
      // 取首字母作为 fallback
      const initial = (user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase();
      userAvatar.innerHTML = `<span class="nav-avatar-fallback">${initial}</span>`;
    }

    // 头像点击 → 跳转账户设置
    userAvatar.onclick = () => { window.location.href = '/account/'; };
  }

  // -------- 渲染：未登录 --------
  function renderLoggedOut() {
    if (!loginBtn) return;
    if (userAvatar) userAvatar.style.display = 'none';
    loginBtn.style.display = 'inline-flex';
    loginBtn.onclick = showLoginModal;
  }

  // -------- 登录弹窗 --------
  let modalOverlay = null;

  // 暴露到全局，供 bookmark-nav.js 等调用
  window.showLoginModal = () => showLoginModal();

  function showLoginModal() {
    // 避免重复创建
    if (modalOverlay) return;

    modalOverlay = document.createElement('div');
    modalOverlay.className = 'auth-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in">
        <button class="auth-modal-close" aria-label="Close">✕</button>
        <div class="auth-modal-body">
          <div class="auth-modal-icon">🔐</div>
          <h2 data-lang-en="Welcome" data-lang-zh="欢迎">Welcome</h2>
          <p class="auth-modal-desc" data-lang-en="Sign in with GitHub to sync your bookmarks across devices."
             data-lang-zh="使用 GitHub 登录，收藏夹跨设备同步。">
            Sign in with GitHub to sync your bookmarks across devices.
          </p>
          <button class="auth-github-btn" id="auth-github-btn">
            <svg class="auth-github-icon" viewBox="0 0 24 24" width="22" height="22">
              <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span data-lang-en="Continue with GitHub" data-lang-zh="使用 GitHub 登录">Continue with GitHub</span>
          </button>
          <p class="auth-modal-legal" data-lang-en="Only your public GitHub profile info will be used."
             data-lang-zh="仅获取您的 GitHub 公开信息。">
            Only your public GitHub profile info will be used.
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // 用 RAF 触发入场动画
    requestAnimationFrame(() => {
      modalOverlay.classList.add('active');
    });

    // 关闭事件
    modalOverlay.querySelector('.auth-modal-close').addEventListener('click', closeLoginModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeLoginModal();
    });

    // GitHub 登录按钮
    modalOverlay.querySelector('#auth-github-btn').addEventListener('click', async () => {
      const btn = modalOverlay.querySelector('#auth-github-btn');
      btn.disabled = true;
      btn.innerHTML = '<span data-lang-en="Redirecting..." data-lang-zh="跳转中...">Redirecting...</span>';
      try {
        await Auth.signInWithGitHub();
      } catch (err) {
        console.error('[Auth] Login error:', err);
        btn.disabled = false;
        btn.innerHTML = `
          <svg class="auth-github-icon" viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span data-lang-en="Retry" data-lang-zh="重试">Retry</span>
        `;
      }
    });

    // ESC 关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') closeLoginModal();
    };
    document.addEventListener('keydown', escHandler);
    modalOverlay._escHandler = escHandler;
  }

  function closeLoginModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    if (modalOverlay._escHandler) {
      document.removeEventListener('keydown', modalOverlay._escHandler);
    }
    setTimeout(() => {
      if (modalOverlay?.parentNode) modalOverlay.parentNode.removeChild(modalOverlay);
      modalOverlay = null;
    }, 300);
  }

  // -------- OAuth 回调处理 --------
  async function handleAuthCallback() {
    // 检查 URL 是否有 #access_token 或 type=recovery 等参数
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('type=signup'))) {
      // Supabase 会自动处理 session，我们只需等待
      return;
    }

    // 检查是否有 error 参数
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      console.warn('[Auth] OAuth error:', params.get('error'));
    }
  }

  // -------- 监听登录状态变化 --------
  Auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // 登录成功：关闭弹窗 + 刷新 UI
      closeLoginModal();
      renderLoggedIn(session.user);
      // 通知 bookmark-nav 同步数据
      window.dispatchEvent(new CustomEvent('auth:signin', { detail: { user: session.user } }));
      // 首页文案个性化
      applyHomepageSettings();
    } else if (event === 'SIGNED_OUT') {
      renderLoggedOut();
      window.dispatchEvent(new CustomEvent('auth:signout'));
      // 登出后恢复默认文案（刷新页面即可，不强制 reload）
    } else if (event === 'TOKEN_REFRESHED') {
      // Token 自动刷新，无需操作
    }
  });

  // -------- 如果当前在账户页面，渲染账户信息 --------
  async function renderAccountPage() {
    if (!window.location.pathname.startsWith('/account/')) return;

    const { data } = await Auth.getUser();
    const user = data?.user;
    if (!user) {
      // 未登录 → 跳回首页
      window.location.href = '/';
      return;
    }

    // 填充账户信息
    const nameEl = document.getElementById('acct-name');
    const emailEl = document.getElementById('acct-email');
    const avatarEl = document.getElementById('acct-avatar');
    const ghLinkEl = document.getElementById('acct-github-link');

    const identities = user.identities || [];
    const githubIdentity = identities.find(id => id.provider === 'github');
    const avatarUrl = githubIdentity?.identity_data?.avatar_url || user.user_metadata?.avatar_url || '';
    const ghUsername = githubIdentity?.identity_data?.login || user.user_metadata?.user_name || '';
    const fullName = user.user_metadata?.full_name || githubIdentity?.identity_data?.name || 'User';

    if (avatarEl && avatarUrl) avatarEl.src = avatarUrl;
    if (nameEl) nameEl.textContent = fullName;
    if (emailEl) emailEl.textContent = user.email || '';
    if (ghLinkEl && ghUsername) ghLinkEl.href = `https://github.com/${ghUsername}`;

    // 退出按钮
    document.getElementById('acct-signout')?.addEventListener('click', async () => {
      await Auth.signOut();
    });

    // 同步状态
    updateSyncStatus();

    // 首页文案设置
    renderHomepageSettings();
  }

  async function updateSyncStatus() {
    const statusEl = document.getElementById('acct-sync-status');
    const countEl = document.getElementById('acct-bookmark-count');
    if (!statusEl) return;

    try {
      const bookmarks = await BookmarkAPI.fetchAll();
      statusEl.textContent = 'Connected';
      statusEl.className = 'acct-sync-ok';
      if (countEl) countEl.textContent = `${bookmarks.length} bookmarks synced`;
    } catch (e) {
      statusEl.textContent = 'Sync error';
      statusEl.className = 'acct-sync-err';
      if (countEl) countEl.textContent = '';
    }
  }

  // ==================== 首页文案设置 ====================

  /** 加载首页文案设置并填充表单 */
  async function renderHomepageSettings() {
    const isAccountPage = window.location.pathname.startsWith('/account/');
    if (!isAccountPage) return;

    const saveBtn = document.getElementById('hp-save-btn');
    const resetBtn = document.getElementById('hp-reset-btn');
    const statusEl = document.getElementById('hp-status');
    if (!saveBtn) return; // 页面不存在该卡片时跳过

    // 加载云端数据
    let settings = null;
    try {
      settings = await HomepageSettings.fetch();
    } catch (e) {
      console.warn('[Homepage] Fetch error:', e.message);
    }

    if (settings) {
      document.getElementById('hp-eyebrow-en').value = settings.eyebrow_en || '';
      document.getElementById('hp-title-en').value = settings.title_en || '';
      document.getElementById('hp-desc-en').value = settings.desc_en || '';
      document.getElementById('hp-eyebrow-zh').value = settings.eyebrow_zh || '';
      document.getElementById('hp-title-zh').value = settings.title_zh || '';
      document.getElementById('hp-desc-zh').value = settings.desc_zh || '';
    }

    // 保存
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      statusEl.textContent = 'Saving...';
      statusEl.className = 'hp-status';

      try {
        await HomepageSettings.save({
          eyebrow_en: document.getElementById('hp-eyebrow-en').value.trim(),
          title_en: document.getElementById('hp-title-en').value.trim(),
          desc_en: document.getElementById('hp-desc-en').value.trim(),
          eyebrow_zh: document.getElementById('hp-eyebrow-zh').value.trim(),
          title_zh: document.getElementById('hp-title-zh').value.trim(),
          desc_zh: document.getElementById('hp-desc-zh').value.trim()
        });

        statusEl.textContent = '✅ Saved!';
        statusEl.className = 'hp-status hp-status--ok';
      } catch (e) {
        console.error('[Homepage] Save error:', e);
        statusEl.textContent = '❌ Save failed';
        statusEl.className = 'hp-status hp-status--err';
      }

      saveBtn.disabled = false;
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    });

    // 恢复默认
    resetBtn.addEventListener('click', async () => {
      document.getElementById('hp-eyebrow-en').value = '';
      document.getElementById('hp-title-en').value = '';
      document.getElementById('hp-desc-en').value = '';
      document.getElementById('hp-eyebrow-zh').value = '';
      document.getElementById('hp-title-zh').value = '';
      document.getElementById('hp-desc-zh').value = '';
      statusEl.textContent = 'Fields cleared. Save to apply.';
      statusEl.className = 'hp-status';
    });
  }

  // ==================== 首页应用个性化文案（非 account 页面） ====================

  /** 在首页登录后替换静态文案 */
  async function applyHomepageSettings() {
    const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
    if (!isHome) return;

    // 确保登录后再拉取
    const loggedIn = await Auth.isLoggedIn();
    if (!loggedIn) return;

    try {
      const settings = await HomepageSettings.fetch();
      if (!settings) return;

      // 更新 eyebrow
      const eyebrow = document.querySelector('.hero-copy .eyebrow');
      if (eyebrow && settings.eyebrow_en) {
        eyebrow.textContent = settings.eyebrow_en;
        // 保存中文版本到 data 属性，供 lang.js 切换时使用
        eyebrow.dataset.langEn = settings.eyebrow_en;
        eyebrow.dataset.langZh = settings.eyebrow_zh || settings.eyebrow_en;
      }

      // 更新标题（h1）
      const h1 = document.querySelector('.hero-copy h1');
      if (h1 && settings.title_en) {
        h1.innerHTML = settings.title_en.replace(/\n/g, '<br>');
        h1.dataset.langEn = settings.title_en;
        h1.dataset.langZh = settings.title_zh || settings.title_en;
      }

      // 更新英文描述
      const descEn = document.querySelector('.hero-desc.lang-en');
      if (descEn && settings.desc_en) {
        descEn.textContent = settings.desc_en;
        descEn.dataset.langEn = settings.desc_en;
      }

      // 更新中文描述
      const descZh = document.querySelector('.hero-desc.lang-zh');
      if (descZh && settings.desc_zh) {
        descZh.textContent = settings.desc_zh;
        descZh.dataset.langZh = settings.desc_zh;
      }
    } catch (e) {
      console.warn('[Homepage] Apply error:', e.message);
    }
  }

  // -------- 启动 --------
  async function init() {
    await handleAuthCallback();
    initAuthUI();
    renderAccountPage();
    applyHomepageSettings();

    // 每 30 秒刷新一次 session（保持登录状态）
    setInterval(() => {
      if (supabaseClient) {
        supabaseClient.auth.getSession().catch(() => {});
      }
    }, 30000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
