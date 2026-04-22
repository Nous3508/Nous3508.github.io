// site.js - 组合：GitHub repos 拉取、语言切换、搜索触发
const OWNER = 'Nous3508';
const REPOS_API = `https://api.github.com/users/${OWNER}/repos?per_page=100`;
const CACHE_KEY = 'gh_repos_cache_v1';
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 小时

async function fetchRepos(){
  try{
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if(cached && Date.now() - cached.t < CACHE_TTL){
      return cached.data;
    }
    const r = await fetch(REPOS_API);
    if(!r.ok) throw new Error('GitHub API error');
    const data = await r.json();
    const filtered = data.filter(x => !x.fork).sort((a,b)=>b.stargazers_count - a.stargazers_count);
    localStorage.setItem(CACHE_KEY, JSON.stringify({t:Date.now(), data:filtered}));
    return filtered;
  }catch(e){
    console.error(e);
    return [];
  }
}

function renderRepos(repos){
  const container = document.getElementById('projects-list');
  if(!container) return;
  container.innerHTML = '';
  repos.forEach(repo=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
      <p class="muted">${repo.description || ''}</p>
      <div class="meta">
        <small>★ ${repo.stargazers_count}</small>
        <small>${repo.language || ''}</small>
        <a class="repo-link" href="${repo.html_url}" target="_blank">View</a>
      </div>
    `;
    container.appendChild(el);
  });
}

// language toggle: show/hide elements with .lang-en / .lang-zh
function setLanguage(lang){
  localStorage.setItem('site-lang', lang);
  document.querySelectorAll('.lang-en').forEach(el => el.style.display = (lang === 'en') ? '' : 'none');
  document.querySelectorAll('.lang-zh').forEach(el => el.style.display = (lang === 'zh') ? '' : 'none');
}

// wire up buttons and initial state
document.addEventListener('DOMContentLoaded', async ()=>{
  // set language
  const initial = localStorage.getItem('site-lang') || 'en';
  setLanguage(initial);
  document.getElementById('lang-toggle')?.addEventListener('click', ()=>{
    const cur = localStorage.getItem('site-lang') || 'en';
    const next = cur === 'en' ? 'zh' : 'en';
    setLanguage(next);
  });

  // hook search button
  document.getElementById('search-toggle')?.addEventListener('click', ()=>{
    if(window.siteSearch && typeof window.siteSearch.doSearch === 'function'){
      window.siteSearch.doSearch();
    } else {
      alert('Search is not ready. Try browser search (Ctrl/Cmd+F).');
    }
  });

  // set social links from _data/profile (rendered into page by Jekyll)
  const gh = document.querySelector('#gh-link');
  if(gh) gh.href = "{{ site.data.profile.en.social.github }}".replace('{{','').replace('}}','') || `https://github.com/${OWNER}`;

  // fetch and render repos
  const repos = await fetchRepos();
  renderRepos(repos.slice(0, 12));
});