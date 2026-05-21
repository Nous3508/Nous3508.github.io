(() => {
  const input = document.getElementById("site-search-input");
  const btn = document.getElementById("site-search-btn");
  const modeBtnInline = document.getElementById("search-mode-btn-inline");
  const modeIconInline = document.getElementById("search-mode-icon-inline");
  const results = document.getElementById("search-results");
  const hints = document.getElementById("search-hints");

  const suggestBox = document.getElementById("search-suggestions");

  const key = "nous-search-mode";
  let mode = localStorage.getItem(key) || "site"; // site | web
  let index = null;
  let docs = [];

  function syncIcon() {
    const isSite = mode === "site";
    const icon = isSite ? "🔍" : "🌐";
    if (modeIconInline) modeIconInline.textContent = icon;
    if (hints) hints.textContent = isSite ? "Site search: posts > projects" : "Browser search mode";
    // 更新输入框占位符
    if (input) input.placeholder = isSite ? "Search posts / projects..." : "Search the web with Bing...";
  }

  async function fetchReposWithCache() {
    const CACHE_KEY = 'nous_search_repos_cache';
    const CACHE_TTL = 1000 * 60 * 10; // 10 分钟
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_TTL) return cached.data;
    } catch (_) {}
    const res = await fetch('https://api.github.com/users/Nous3508/repos?per_page=100');
    if (!res.ok) return [];
    const data = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data }));
    return data;
  }

  async function loadDocs() {
    let r1, r2, repos;
    try {
      [r1, r2] = await Promise.all([
        fetch("/search.json"),
        fetchReposWithCache()
      ]);
    } catch (e) {
      console.error('[Search] Network error loading search data:', e);
      throw e;
    }

    if (!r1.ok) {
      throw new Error(`Failed to fetch search.json: ${r1.status} ${r1.statusText}`);
    }

    let searchData;
    try {
      searchData = await r1.json();
    } catch (e) {
      console.error('[Search] Invalid JSON from search.json:', e);
      throw e;
    }
    repos = r2;

    const posts = (searchData.posts || []).map(p => ({
      type: "post",
      title: p.title,
      url: p.url,
      content: p.content,
      date: p.date,
      priority: 2
    }));

    const projects = repos
      .filter(r => !r.fork && !r.archived && !r.name.toLowerCase().includes("test") && !r.name.toLowerCase().includes("demo"))
      .map(r => ({
        type: "project",
        title: r.name,
        url: `/projects/#${r.name}`,
        content: `${r.description || ""} ${r.topics ? r.topics.join(" ") : ""}`,
        date: r.updated_at,
        priority: 1,
        repo: r
      }))
      .sort((a, b) => (b.repo.stargazers_count || 0) - (a.repo.stargazers_count || 0));

    docs = [...posts, ...projects];

    index = new FlexSearch.Document({
      document: {
        id: "url",
        index: [
          "title",
          "content"
        ],
        store: ["title", "url", "type", "date", "priority"]
      },
      tokenize: "forward",
      preset: "match"
    });

    docs.forEach(doc => index.add({
      url: doc.url,
      title: doc.title,
      content: doc.content,
      type: doc.type,
      date: doc.date,
      priority: doc.priority
    }));
  }

  function render(list) {
    if (!results) return;
    results.innerHTML = "";
    if (!list.length) {
      results.innerHTML = `<div class="search-result"><h4>No results</h4><p>Try a different keyword.</p></div>`;
      return;
    }
    list.forEach(item => {
      const div = document.createElement("div");
      div.className = "search-result";
      div.innerHTML = `
        <h4><a href="${item.url}">${item.title}</a></h4>
        <p>${item.type} · ${item.date ? item.date.slice(0,10) : ""}</p>
      `;
      results.appendChild(div);
    });
  }

  async function doSiteSearch() {
    // 先清除旧结果（显示加载状态）
    if (results) results.innerHTML = '<div class="search-result"><h4>Searching…</h4></div>';

    try {
      if (!index) await loadDocs();
    } catch (e) {
      console.error('[Search] Failed to load index:', e);
      if (results) results.innerHTML = '<div class="search-result"><h4>Index failed to load</h4><p>Check console for details.</p></div>';
      return;
    }

    const q = input?.value?.trim();
    if (!q) {
      if (results) results.innerHTML = '';
      return;
    }

    if (!index || typeof index.search !== 'function') {
      if (results) results.innerHTML = '<div class="search-result"><h4>Search not ready</h4><p>Please try again later.</p></div>';
      return;
    }

    let raw;
    try {
      raw = index.search(q, { enrich: true });
    } catch (e) {
      console.error('[Search] Search error:', e);
      if (results) results.innerHTML = '<div class="search-result"><h4>Search error</h4><p>Please try again.</p></div>';
      return;
    }

    const merged = [];
    const seen = new Set();
    if (raw && raw.length) {
      raw.forEach(group => {
        if (!group || !group.result) return;
        group.result.forEach(row => {
          const item = row && row.doc;
          if (item && item.url && !seen.has(item.url)) {
            seen.add(item.url);
            merged.push(item);
          }
        });
      });
    }
    merged.sort((a, b) => (a.priority || 9) - (b.priority || 9));
    render(merged);
  }

  function doWebSearch(query) {
    const q = (query || input?.value)?.trim();
    if (!q) return;
    window.open(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, '_blank');
    // 搜索后关闭建议下拉
    hideSuggestions();
    // 可选：聚焦回输入框
    input?.focus();
  }

  // ==================== 搜索建议（站外模式） ====================
  // 使用 Google Suggest API（JSONP）绕过 CORS 限制
  let suggestTimer = null;
  let suggestIndex = -1; // 键盘高亮索引
  let suggestScriptEl = null; // 当前正在加载的 <script> 标签

  /** JSONP 回调：Google Suggest 返回后自动调用此函数 */
  window.handleSuggest = function(data) {
    // data 格式: ["query", ["sug1","sug2",...], [], {...}]
    const items = (data && Array.isArray(data) && Array.isArray(data[1]))
      ? data[1].filter(Boolean)
      : [];
    renderSuggestions(items);
  };

  function fetchSuggestions(query) {
    // 移除上一次的 script 标签（取消进行中的请求）
    if (suggestScriptEl && suggestScriptEl.parentNode) {
      suggestScriptEl.parentNode.removeChild(suggestScriptEl);
      suggestScriptEl = null;
    }

    // 创建新的 script 标签发起 JSONP 请求
    const script = document.createElement('script');
    script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&callback=handleSuggest`;
    script.async = true;
    script.onerror = () => {
      console.warn('[Search] Google Suggest request failed');
      hideSuggestions();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    document.head.appendChild(script);
    suggestScriptEl = script;
  }

  function renderSuggestions(items) {
    if (!suggestBox) return;
    if (!items || !items.length) {
      hideSuggestions();
      return;
    }
    suggestBox.style.display = 'block';
    suggestBox.innerHTML = items.map((text, i) => `
      <div class="search-suggestion-item" data-index="${i}" data-query="${text.replace(/"/g, '&quot;')}">
        <span class="suggestion-icon">🌐</span>
        <span class="suggestion-text">${escapeHtml(text)}</span>
      </div>
    `).join('');
    suggestIndex = -1;
  }

  function hideSuggestions() {
    if (suggestBox) suggestBox.style.display = 'none';
    suggestIndex = -1;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // 防抖获取建议
  function onInputChanged(e) {
    // 程序化设置值时不重复请求
    if (e?._suppressSuggest) return;

    if (mode !== 'web') {
      hideSuggestions();
      return;
    }
    const q = input?.value?.trim();
    if (!q || q.length < 2) {
      hideSuggestions();
      return;
    }
    clearTimeout(suggestTimer);
    suggestTimer = setTimeout(() => {
      fetchSuggestions(q);
      // 注意：fetchSuggestions 使用 JSONP，结果由 handleSuggest 回调处理
    }, 200);
  }

  // 选择一条建议
  function pickSuggestion(text) {
    if (input) {
      input.value = text;
      // 手动触发 input 事件，但标记为程序修改，避免重复请求建议
      const evt = new Event('input', { bubbles: true });
      evt._suppressSuggest = true;
      input.dispatchEvent(evt);
    }
    hideSuggestions();
    doWebSearch(text);
  }

  // 键盘导航
  function onSuggestKeydown(e) {
    if (!suggestBox || suggestBox.style.display === 'none') return;
    const items = suggestBox.querySelectorAll('.search-suggestion-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      suggestIndex = Math.min(suggestIndex + 1, items.length - 1);
      highlightSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      suggestIndex = Math.max(suggestIndex - 1, -1);
      highlightSuggestion(items);
    } else if (e.key === 'Enter' && suggestIndex >= 0) {
      e.preventDefault();
      const text = items[suggestIndex]?.dataset?.query;
      if (text) pickSuggestion(text);
    } else if (e.key === 'Escape') {
      hideSuggestions();
      input?.blur();
    }
  }

  function highlightSuggestion(items) {
    items.forEach((el, i) => {
      el.classList.toggle('highlighted', i === suggestIndex);
    });
    // 滚动到可见区域
    if (suggestIndex >= 0 && items[suggestIndex]) {
      items[suggestIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // 点击外部关闭建议
  function onDocumentClick(e) {
    if (suggestBox && !e.target.closest('.search-input-wrap') && !e.target.closest('#search-mode-btn-inline')) {
      hideSuggestions();
    }
  }

  function toggleMode() {
    mode = mode === "site" ? "web" : "site";
    localStorage.setItem(key, mode);
    syncIcon();
    hideSuggestions();
    // 切换模式时清空站内搜索结果
    if (results) results.innerHTML = '';
  }

  // --- 事件绑定 ---

  btn?.addEventListener("click", () => {
    hideSuggestions();
    if (mode === "site") doSiteSearch();
    else doWebSearch();
  });

  modeBtnInline?.addEventListener("click", toggleMode);

  // 输入框：回车 → 搜索；方向键 → 导航建议
  input?.addEventListener("keydown", e => {
    // 如果有建议下拉且正在导航，交给 onSuggestKeydown 处理
    if (suggestBox && suggestBox.style.display !== 'none' &&
        (e.key === 'ArrowDown' || e.key === 'ArrowUp' ||
         (e.key === 'Enter' && suggestIndex >= 0) || e.key === 'Escape')) {
      onSuggestKeydown(e);
      return;
    }
    if (e.key === "Enter") {
      hideSuggestions();
      if (mode === "site") doSiteSearch();
      else doWebSearch();
    }
  });

  // 输入变化时获取建议
  input?.addEventListener("input", onInputChanged);

  // 点击建议项
  document.addEventListener("click", e => {
    const item = e.target.closest(".search-suggestion-item");
    if (item) {
      const text = item.dataset.query;
      if (text) pickSuggestion(text);
      return;
    }
    // 点击外部关闭
    onDocumentClick(e);
  });

  syncIcon();
  loadDocs().catch(err => console.warn('[Search] Initial load failed (will retry on first search):', err));
})();