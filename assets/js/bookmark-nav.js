/**
 * bookmark-nav.js - 侧边快捷导航栏
 * 功能：收藏夹管理（增删改）、Favicon 自动获取、展开/收起切换
 * 数据存储在 localStorage
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'nous_bookmarks';
  const NAV_KEY = 'nous_bookmark_nav_collapsed';

  // -------- 默认预设 --------
  const DEFAULT_BOOKMARKS = [
    { id: 'bm-1', title: 'GitHub', url: 'https://github.com/Nous3508' },
    { id: 'bm-2', title: 'Bilibili', url: 'https://www.bilibili.com/' },
    { id: 'bm-3', title: '知网', url: 'https://www.cnki.net/' },
    { id: 'bm-4', title: '飞书', url: 'https://feishu.cn/' },
  ];

  // -------- DOM 引用 --------
  const nav = document.getElementById('bookmark-nav');
  const list = document.getElementById('bookmark-list');
  const toggleBtn = document.getElementById('bookmark-toggle-btn');
  const addBtn = document.getElementById('bookmark-add-btn');

  // -------- 翻译 --------
  const LANG_KEY = "nous-lang";
  function t(en, zh) {
    return (localStorage.getItem(LANG_KEY) || "en") === "zh" ? zh : en;
  }

  // -------- 状态 --------
  let bookmarks = [];
  let isCollapsed = false;
  let hoverTimer = null;
  let isHovering = false;

  // -------- 数据读写 --------
  function loadBookmarks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) { /* ignore */ }
    // 首次使用：写入默认数据
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKMARKS));
    return DEFAULT_BOOKMARKS;
  }

  function saveBookmarks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }

  function loadCollapsedState() {
    return localStorage.getItem(NAV_KEY) === 'true';
  }

  function saveCollapsedState(v) {
    localStorage.setItem(NAV_KEY, v ? 'true' : 'false');
  }

  // -------- 生成 ID --------
  function genId() {
    return 'bm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  }

  // -------- Favicon URL --------
  function faviconUrl(url) {
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch (_) {
      return '';
    }
  }

  // -------- 渲染 --------
  function render() {
    if (!list) return;
    if (!bookmarks.length) {
      list.innerHTML = `<div class="bookmark-empty" data-lang-en="No bookmarks yet.<br>Click ＋ to add one." data-lang-zh="暂无收藏<br>点击 ＋ 添加">No bookmarks yet.<br>Click ＋ to add one.</div>`;
      return;
    }
    list.innerHTML = bookmarks.map(b => `
      <a class="bookmark-item" href="${escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(b.title)}" data-id="${b.id}">
        <img src="${faviconUrl(b.url)}" alt="" loading="lazy" onerror="this.style.display='none'">
        <span class="bm-title">${escapeHtml(b.title)}</span>
        <span class="bm-actions">
          <button class="bm-action-btn bm-edit" data-action="edit" title="${t('Edit','编辑')}">✎</button>
          <button class="bm-action-btn bm-delete" data-action="delete" title="${t('Delete','删除')}">✕</button>
        </span>
      </a>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // -------- 展开/收起 --------
  function setCollapsed(collapsed, instant = false) {
    isCollapsed = collapsed;
    saveCollapsedState(collapsed);
    if (!nav) return;
    nav.classList.toggle('collapsed', collapsed);
    nav.classList.remove('hover-expand');
    // 更新 toggle 图标
    const icon = toggleBtn?.querySelector('.bookmark-toggle-icon');
    if (icon) {
      icon.textContent = collapsed ? '▶' : '◀';
    }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', collapsed ? t('Expand quick nav','展开快捷导航') : t('Collapse quick nav','收起快捷导航'));
    }
  }

  function toggleCollapse() {
    setCollapsed(!isCollapsed);
  }

  // -------- 悬浮展开 --------
  function onNavEnter() {
    isHovering = true;
    if (!isCollapsed) return;
    clearTimeout(hoverTimer);
    nav?.classList.add('hover-expand');
  }

  function onNavLeave() {
    isHovering = false;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (!isHovering && isCollapsed) {
        nav?.classList.remove('hover-expand');
      }
    }, 200);
  }

  // -------- 添加书签 --------
  function showAddForm() {
    if (!nav) return;
    // 如果已存在编辑中的表单，移除之
    const existing = nav.querySelector('.bookmark-add-form');
    if (existing) existing.remove();

    const form = document.createElement('div');
    form.className = 'bookmark-add-form';
    form.innerHTML = `
      <input type="text" class="bm-form-url" placeholder="${t('URL, e.g. https://example.com','URL，例如 https://example.com')}" autofocus>
      <input type="text" class="bm-form-title" placeholder="${t('Title (auto-filled)','标题（自动填充）')}">
      <div class="bookmark-add-form-actions">
        <button class="bookmark-form-confirm" data-action="confirm">${t('Add','添加')}</button>
        <button class="bookmark-form-cancel" data-action="cancel">${t('Cancel','取消')}</button>
      </div>
    `;

    const inner = nav.querySelector('.bookmark-nav-inner');
    inner?.appendChild(form);

    const urlInput = form.querySelector('.bm-form-url');
    const titleInput = form.querySelector('.bm-form-title');

    // 自动填充标题：从 URL 提取
    urlInput.addEventListener('blur', () => {
      if (!titleInput.value && urlInput.value) {
        try {
          const u = new URL(urlInput.value);
          titleInput.value = u.hostname.replace(/^www\./, '');
        } catch (_) { /* ignore */ }
      }
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmAdd(form);
    });
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmAdd(form);
    });

    form.querySelector('[data-action="confirm"]')?.addEventListener('click', () => confirmAdd(form));
    form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => form.remove());

    setTimeout(() => urlInput?.focus(), 50);
  }

  function confirmAdd(form) {
    const urlInput = form.querySelector('.bm-form-url');
    const titleInput = form.querySelector('.bm-form-title');
    let url = urlInput?.value?.trim();
    let title = titleInput?.value?.trim();

    if (!url) return;

    // 补全协议
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // 验证 URL
    try {
      new URL(url);
    } catch (_) {
      urlInput.focus();
      urlInput.select();
      return;
    }

    if (!title) {
      try {
        const u = new URL(url);
        title = u.hostname.replace(/^www\./, '');
      } catch (_) {
        title = url;
      }
    }

    bookmarks.push({ id: genId(), title, url });
    saveBookmarks();
    render();
    form.remove();
  }

  // -------- 编辑书签 --------
  function editBookmark(id) {
    const idx = bookmarks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const bm = bookmarks[idx];

    // 移除已存在的表单
    const existing = nav?.querySelector('.bookmark-add-form');
    if (existing) existing.remove();

    const form = document.createElement('div');
    form.className = 'bookmark-add-form';
    form.innerHTML = `
      <input type="text" class="bm-form-url" value="${escapeHtml(bm.url)}" autofocus>
      <input type="text" class="bm-form-title" value="${escapeHtml(bm.title)}">
      <div class="bookmark-add-form-actions">
        <button class="bookmark-form-confirm" data-action="confirm">${t('Save','保存')}</button>
        <button class="bookmark-form-cancel" data-action="cancel">${t('Cancel','取消')}</button>
      </div>
    `;

    const inner = nav?.querySelector('.bookmark-nav-inner');
    inner?.appendChild(form);

    const urlInput = form.querySelector('.bm-form-url');
    const titleInput = form.querySelector('.bm-form-title');

    function saveEdit() {
      let url = urlInput?.value?.trim();
      let title = titleInput?.value?.trim();
      if (!url) return;

      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      try { new URL(url); } catch (_) { urlInput.focus(); urlInput.select(); return; }
      if (!title) {
        try { const u = new URL(url); title = u.hostname.replace(/^www\./, ''); } catch (_) { title = url; }
      }

      bookmarks[idx] = { ...bookmarks[idx], title, url };
      saveBookmarks();
      render();
      form.remove();
    }

    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEdit(); });
    titleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveEdit(); });
    form.querySelector('[data-action="confirm"]')?.addEventListener('click', saveEdit);
    form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => form.remove());

    setTimeout(() => urlInput?.focus(), 50);
  }

  // -------- 删除书签 --------
  function deleteBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
    render();
  }

  // -------- 事件代理 --------
  function handleListClick(e) {
    const item = e.target.closest('.bookmark-item');
    const actionBtn = e.target.closest('.bm-action-btn');

    if (actionBtn && item) {
      e.preventDefault();
      e.stopPropagation();
      const id = item.dataset.id;
      const action = actionBtn.dataset.action;
      if (action === 'edit') editBookmark(id);
      else if (action === 'delete') deleteBookmark(id);
      return;
    }

    // 点击空白区域关闭编辑表单
    if (!e.target.closest('.bookmark-add-form') && !e.target.closest('.bookmark-add-btn')) {
      const form = nav?.querySelector('.bookmark-add-form');
      if (form && !e.target.closest('.bookmark-add-form')) {
        form.remove();
      }
    }
  }

  // -------- 初始化 --------
  function init() {
    bookmarks = loadBookmarks();
    isCollapsed = loadCollapsedState();

    if (nav) {
      nav.classList.toggle('collapsed', isCollapsed);
      const icon = toggleBtn?.querySelector('.bookmark-toggle-icon');
      if (icon) icon.textContent = isCollapsed ? '▶' : '◀';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', isCollapsed ? 'Expand quick nav' : 'Collapse quick nav');
    }

    render();

    // 事件绑定
    toggleBtn?.addEventListener('click', toggleCollapse);
    addBtn?.addEventListener('click', showAddForm);
    list?.addEventListener('click', handleListClick);

    // 悬浮展开/收起
    nav?.addEventListener('mouseenter', onNavEnter);
    nav?.addEventListener('mouseleave', onNavLeave);

    // 点击页面其他地方收起编辑表单
    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target)) {
        const form = nav.querySelector('.bookmark-add-form');
        if (form) form.remove();
      }
    });
  }

  // 等 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
