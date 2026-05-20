(() => {
  const input = document.getElementById("site-search-input");
  const btn = document.getElementById("site-search-btn");
  const modeBtn = document.getElementById("search-mode-btn");
  const modeBtnInline = document.getElementById("search-mode-btn-inline");
  const modeIcon = document.getElementById("search-mode-icon");
  const modeIconInline = document.getElementById("search-mode-icon-inline");
  const results = document.getElementById("search-results");
  const hints = document.getElementById("search-hints");

  const key = "nous-search-mode";
  let mode = localStorage.getItem(key) || "site"; // site | web
  let index = null;
  let docs = [];

  function syncIcon() {
    const icon = mode === "site" ? "🔍" : "🌐";
    if (modeIcon) modeIcon.textContent = icon;
    if (modeIconInline) modeIconInline.textContent = icon;
    if (hints) hints.textContent = mode === "site" ? "Site search: posts > projects" : "Browser search mode";
  }

  async function loadDocs() {
    const [r1, r2] = await Promise.all([
      fetch("/search.json"),
      fetch("https://api.github.com/users/Nous3508/repos?per_page=100")
    ]);
    const searchData = await r1.json();
    const repos = await r2.json();

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
    if (!index) await loadDocs();
    const q = input?.value?.trim();
    if (!q) return;
    const raw = index.search(q, { enrich: true });
    const merged = [];
    const seen = new Set();
    raw.forEach(group => {
      group.result.forEach(row => {
        const item = row.doc;
        if (!seen.has(item.url)) {
          seen.add(item.url);
          merged.push(item);
        }
      });
    });
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

  modeBtn?.addEventListener("click", toggleMode);
  modeBtnInline?.addEventListener("click", toggleMode);

  input?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      if (mode === "site") doSiteSearch();
      else doWebSearch();
    }
  });

  syncIcon();
  loadDocs().catch(() => {});
})();