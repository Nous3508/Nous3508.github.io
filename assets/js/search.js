// search.js - 使用 FlexSearch 构建索引并显示搜索 UI
// 依赖：flexsearch.bundle.js (已在 head.html 引入)
(() => {
  const modal = document.getElementById('search-modal');

  async function buildIndex() {
    try {
      const r = await fetch('/search.json');
      if(!r.ok) throw new Error('search.json not found');
      const idx = await r.json();
      // 创建 FlexSearch 索引（简单配置）
      const index = new FlexSearch.Document({
        tokenize: "forward",
        document: {
          id: "url",
          index: ["title", "content", "tags"],
          store: ["title", "url", "date"]
        }
      });
      idx.posts.forEach(p => index.add({ url: p.url, title: p.title, content: p.content, tags: p.tags, date: p.date }));
      idx.projects.forEach(p => index.add({ url: p.url, title: p.title, content: p.content, tags: p.tags }));
      return index;
    } catch (e) {
      console.warn('search index build failed:', e);
      return null;
    }
  }

  function showResults(results) {
    if(!modal) return;
    if(!results || results.length===0){
      modal.innerHTML = `<div class="search-box"><button id="close-search">Close</button><p>No results</p></div>`;
    } else {
      const rows = results.map(r => `<li><a href="${r.url}">${r.title}</a> ${r.date ? `<small>${r.date}</small>` : ''}</li>`).join('');
      modal.innerHTML = `<div class="search-box"><button id="close-search">Close</button><ul>${rows}</ul></div>`;
    }
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('close-search').addEventListener('click', ()=> {
      modal.style.display='none'; modal.setAttribute('aria-hidden','true');
    });
  }

  // 主流程：当用户触发搜索，提示输入查询并用索引搜索
  let builtIndex = null;
  async function doSearch() {
    if(!builtIndex) builtIndex = await buildIndex();
    if(!builtIndex){
      alert('Site index not available. Falling back to browser search (Ctrl/Cmd+F).');
      return;
    }
    const q = prompt('Enter search keywords / 输入搜索关键词');
    if(!q) return;
    // FlexSearch Document search across fields; use combined results set
    const resultsUrls = new Set();
    const results = [];
    const found = builtIndex.search(q, { enrich: true });
    // found is array per index field; flatten
    found.forEach(group => {
      group.result.forEach(item => {
        // item is stored doc with url,title,date maybe
        if(!resultsUrls.has(item.url)){
          resultsUrls.add(item.url);
          results.push(item);
        }
      });
    });
    showResults(results);
  }

  // 绑定到全局（供 site.js 调用）
  window.siteSearch = { doSearch };
})();