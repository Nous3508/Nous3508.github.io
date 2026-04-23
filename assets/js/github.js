(() => {
  const owner = "Nous3508";
  const CACHE_KEY = "nous_github_repos_cache_v5";
  const CACHE_TTL = 1000 * 60 * 10;

  async function fetchRepos() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && Date.now() - cached.t < CACHE_TTL) {
        return cached.data;
      }

      const res = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`);
      if (!res.ok) throw new Error("GitHub API error");
      const data = await res.json();

      const filtered = data
        .filter(r => !r.fork && !r.archived && !r.name.toLowerCase().includes("test") && !r.name.toLowerCase().includes("demo"))
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));

      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: filtered }));
      return filtered;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function homeCard(repo) {
    const topics = (repo.topics || []).slice(0, 4).map(t => `<span class="chip">${t}</span>`).join("");
    return `
      <article class="project-card project-card--home" data-aos="fade-up">
        <div class="project-thumb">${repo.name.slice(0, 1).toUpperCase()}</div>
        <div class="project-body">
          <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
          <p>${repo.description || "No description yet."}</p>
          <div class="project-meta">
            <span>Language: ${repo.language || "n/a"}</span>
            <span>Stars: ${repo.stargazers_count || 0}</span>
            <span>Updated: ${(repo.updated_at || "").slice(0, 10)}</span>
          </div>
          <div class="chip-row">${topics}</div>
        </div>
      </article>
    `;
  }

  function projectPageCard(repo) {
    const topics = (repo.topics || []).slice(0, 5).map(t => `<span class="chip">${t}</span>`).join("");
    const summary = repo.description || "No description yet.";
    return `
      <article class="project-card project-card--page" data-aos="fade-up">
        <a class="project-card-link" href="${repo.html_url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${repo.name} on GitHub">
          <div class="project-thumb">${repo.name.slice(0, 1).toUpperCase()}</div>
          <div class="project-body">
            <p class="project-kicker">GitHub Repository</p>
            <h3>${repo.name}</h3>
            <p class="project-summary">${summary}</p>
            <div class="project-meta">
              <span>Language: ${repo.language || "n/a"}</span>
              <span>Stars: ${repo.stargazers_count || 0}</span>
              <span>Updated: ${(repo.updated_at || "").slice(0, 10)}</span>
            </div>
            <div class="chip-row">${topics}</div>
            <div class="project-cta">Open on GitHub →</div>
          </div>
        </a>
      </article>
    `;
  }

  async function renderProjects() {
    const repos = await fetchRepos();
    const featured = repos.slice(0, 6);

    const homeGrid = document.getElementById("featured-project-grid");
    if (homeGrid) homeGrid.innerHTML = featured.map(homeCard).join("");

    const pageGrid = document.getElementById("projects-page-grid");
    if (pageGrid) pageGrid.innerHTML = repos.map(projectPageCard).join("");
  }

  renderProjects().catch(console.error);
})();