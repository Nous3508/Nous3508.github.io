/**
 * bookmark-nav.js - 侧边快捷导航栏
 * 功能：收藏夹管理（增删改）、拖拽排序、Favicon 自动获取、展开/收起切换
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
  const gearBtn = document.getElementById('bookmark-gear-btn');
  const panel = document.getElementById('bookmark-slide-panel');
  const backdrop = document.getElementById('bookmark-panel-backdrop');
  const panelClose = document.getElementById('bookmark-panel-close');
  const panelList = document.getElementById('bookmark-panel-list');
  const panelUrl = document.getElementById('bm-panel-url');
  const panelTitle = document.getElementById('bm-panel-title');
  const panelAddBtn = document.getElementById('bm-panel-add-btn');

  // -------- 状态 --------
  let bookmarks = [];
  let isCollapsed = false;
  let isPanelOpen = false;
  let hoverTimer = null;
  let isHovering = false;

  // 拖拽状态
  let dragSrcId = null;
  let dragEl = null;

  // -------- 数据读写 --------
  function loadBookmarks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) { /* ignore */ }
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

  // -------- 工具函数 --------
  function genId() {
    return 'bm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  }

  function faviconUrl(url) {
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch (_) {
      return '';
    }
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // -------- 侧边栏渲染 --------
  function render() {
    if (!list) return;
    if (!bookmarks.length) {
      list.innerHTML = `<div class="bookmark-empty" data-lang-en="Add bookmarks via ⚙" data-lang-zh="点击 ⚙ 添加收藏">Add bookmarks via ⚙</div>`;
      return;
    }
    list.innerHTML = bookmarks.map(b => `
      <a class="bookmark-item" href="${escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(b.title)}" data-id="${b.id}">
        <img src="${faviconUrl(b.url)}" alt="" loading="lazy" onerror="this.style.display='none'">
        <span class="bm-title">${escapeHtml(b.title)}</span>
      </a>
    `).join('');
  }

  // -------- 面板渲染 --------
  function renderPanel() {
    if (!panelList) return;
    if (!bookmarks.length) {
      panelList.innerHTML = `<div class="bm-panel-empty" data-lang-en="No bookmarks yet. Add one below!" data-lang-zh="暂无收藏，在下方添加！">No bookmarks yet. Add one below!</div>`;
      return;
    }
    panelList.innerHTML = bookmarks.map(b => `
      <div class="bm-panel-item" draggable="true" data-id="${b.id}">
        <span class="drag-handle" draggable="false">☰</span>
        <img src="${faviconUrl(b.url)}" alt="" loading="lazy" onerror="this.style.display='none'">
        <span class="bm-panel-title-text">${escapeHtml(b.title)}</span>
        <span class="bm-panel-actions">
          <button class="bm-panel-action-btn bm-panel-edit" data-action="edit" title="Edit">✎</button>
          <button class="bm-panel-action-btn bm-panel-delete" data-action="delete" title="Delete">✕</button>
        </span>
      </div>
    `).join('');

    // 为面板中的每一项绑定拖拽事件
    const items = panelList.querySelectorAll('.bm-panel-item');
    items.forEach(el => {
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
      el.addEventListener('dragover', handleDragOver);
      el.addEventListener('dragenter', handleDragEnter);
      el.addEventListener('dragleave', handleDragLeave);
      el.addEventListener('drop', handleDrop);
    });
  }

  // ==================== 侧滑面板 ====================

  function openPanel() {
    if (isPanelOpen) return;
    isPanelOpen = true;
    panel?.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderPanel();
    // 自动聚焦 URL 输入框
    setTimeout(() => panelUrl?.focus(), 350);
  }

  function closePanel() {
    if (!isPanelOpen) return;
    isPanelOpen = false;
    panel?.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ==================== 拖拽排序 ====================

  function handleDragStart(e) {
    const item = e.target.closest('.bm-panel-item');
    if (!item) return;
    dragSrcId = item.dataset.id;
    dragEl = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    // 让拖拽时鼠标下有半透明预览
    e.dataTransfer.setData('text/plain', dragSrcId);
  }

  function handleDragEnd(e) {
    const item = e.target.closest('.bm-panel-item');
    if (item) item.classList.remove('dragging');
    // 清除所有 drag-over 状态
    document.querySelectorAll('.bm-panel-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragSrcId = null;
    dragEl = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    const target = e.target.closest('.bm-panel-item');
    if (!target || target.dataset.id === dragSrcId) return;
    target.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    const target = e.target.closest('.bm-panel-item');
    if (target) target.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    const target = e.target.closest('.bm-panel-item');
    if (!target) return;
    target.classList.remove('drag-over');

    const fromId = dragSrcId;
    const toId = target.dataset.id;
    if (!fromId || fromId === toId) return;

    const fromIdx = bookmarks.findIndex(b => b.id === fromId);
    const toIdx = bookmarks.findIndex(b => b.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    // 移动元素
    const [moved] = bookmarks.splice(fromIdx, 1);
    bookmarks.splice(toIdx, 0, moved);

    saveBookmarks();
    render();
    renderPanel();
  }

  // ==================== 添加 / 保存书签（面板内） ====================

  function handlePanelAddOrSave() {
    // 如果处于编辑模式，执行保存
    if (isEditingId) {
      commitEdit();
      return;
    }

    // 否则添加新书签
    let url = panelUrl?.value?.trim();
    let title = panelTitle?.value?.trim();

    if (!url) {
      panelUrl?.focus();
      return;
    }

    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    try {
      new URL(url);
    } catch (_) {
      panelUrl?.focus();
      panelUrl?.select();
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
    renderPanel();

    // 清空输入框，方便连续添加
    if (panelUrl) panelUrl.value = '';
    if (panelTitle) panelTitle.value = '';
    panelUrl?.focus();
  }

  // ==================== 编辑书签（面板内） ====================
  let isEditingId = null;

  function editBookmarkInPanel(id) {
    const idx = bookmarks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const bm = bookmarks[idx];

    isEditingId = id;
    if (panelUrl) panelUrl.value = bm.url;
    if (panelTitle) panelTitle.value = bm.title;
    if (panelAddBtn) {
      panelAddBtn.textContent = '💾 Save';
      panelAddBtn.dataset.editMode = 'true';
    }
    panelUrl?.focus();
  }

  function commitEdit() {
    if (!isEditingId) return;
    const idx = bookmarks.findIndex(b => b.id === isEditingId);
    if (idx === -1) { cancelEdit(); return; }

    let url = panelUrl?.value?.trim();
    let title = panelTitle?.value?.trim();
    if (!url) { panelUrl?.focus(); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try { new URL(url); } catch (_) { panelUrl?.focus(); panelUrl?.select(); return; }
    if (!title) {
      try { const u = new URL(url); title = u.hostname.replace(/^www\./, ''); } catch (_) { title = url; }
    }

    bookmarks[idx] = { ...bookmarks[idx], title, url };
    saveBookmarks();
    render();
    renderPanel();
    cancelEdit();
  }

  function cancelEdit() {
    isEditingId = null;
    if (panelUrl) panelUrl.value = '';
    if (panelTitle) panelTitle.value = '';
    if (panelAddBtn) {
      panelAddBtn.textContent = '＋ Add Bookmark';
      delete panelAddBtn.dataset.editMode;
    }
  }

  // ==================== 删除书签 ====================

  function deleteBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
    render();
    renderPanel();
  }

  // ==================== 展开/收起 ====================

  function setCollapsed(collapsed) {
    isCollapsed = collapsed;
    saveCollapsedState(collapsed);
    if (!nav) return;
    nav.classList.toggle('collapsed', collapsed);
    nav.classList.remove('hover-expand');
    const icon = toggleBtn?.querySelector('.bookmark-toggle-icon');
    if (icon) icon.textContent = collapsed ? '▶' : '◀';
    if (toggleBtn) toggleBtn.setAttribute('aria-label', collapsed ? 'Expand quick nav' : 'Collapse quick nav');
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

  // ==================== 面板事件代理 ====================

  function handlePanelClick(e) {
    const actionBtn = e.target.closest('.bm-panel-action-btn');
    const item = e.target.closest('.bm-panel-item');
    if (!actionBtn || !item) return;

    const id = item.dataset.id;
    const action = actionBtn.dataset.action;
    if (action === 'edit') editBookmarkInPanel(id);
    else if (action === 'delete') deleteBookmark(id);
  }

  // ==================== 初始化 ====================

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

    // 事件绑定 — 侧边栏
    toggleBtn?.addEventListener('click', toggleCollapse);
    gearBtn?.addEventListener('click', openPanel);
    nav?.addEventListener('mouseenter', onNavEnter);
    nav?.addEventListener('mouseleave', onNavLeave);

    // 事件绑定 — 面板
    panelClose?.addEventListener('click', closePanel);
    backdrop?.addEventListener('click', closePanel);
    panelAddBtn?.addEventListener('click', handlePanelAddOrSave);
    panelList?.addEventListener('click', handlePanelClick);

    // 面板输入框回车提交
    panelUrl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        panelTitle?.focus();
      }
    });
    panelTitle?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePanelAddOrSave();
      }
    });

    // Escape：在编辑模式时取消编辑，否则关闭面板
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isEditingId) {
          cancelEdit();
        } else if (isPanelOpen) {
          closePanel();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
