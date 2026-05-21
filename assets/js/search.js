(() => {
  const input = document.getElementById("site-search-input");
  const btn = document.getElementById("site-search-btn");
  const modeBtnInline = document.getElementById("search-mode-btn-inline");
  const modeIconInline = document.getElementById("search-mode-icon-inline");
  const results = document.getElementById("search-results");
  const hints = document.getElementById("search-hints");

  const key = "nous-search-mode";
  let mode = localStorage.getItem(key) || "site"; // site | web
  let index = null;
  let docs = [];

  function syncIcon() {
    const icon = mode === "site" ? "🔍" : "🌐";
    if (modeIconInline) modeIconInline.textContent = icon;
    if (hints) hints.textContent = mode === "site" ? "Site search: posts > projects" : "Browser search mode";
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

  function doWebSearch() {
    const q = input?.value?.trim();
    if (!q) return;
    window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
  }

  function toggleMode() {
    mode = mode === "site" ? "web" : "site";
    localStorage.setItem(key, mode);
    syncIcon();
  }

  btn?.addEventListener("click", () => {
    if (mode === "site") doSiteSearch();
    else doWebSearch();
  });

  modeBtnInline?.addEventListener("click", toggleMode);

  input?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      if (mode === "site") doSiteSearch();
      else doWebSearch();
    }
  });

  syncIcon();
  loadDocs().catch(err => console.warn('[Search] Initial load failed (will retry on first search):', err));
})();