(() => {
  const owner = "Nous3508";

  async function fetchRepos() {
    const res = await fetch(`https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`);
    const repos = await res.json();
    return repos
      .filter(r => !r.fork && !r.archived && !r.name.toLowerCase().includes("test") && !r.name.toLowerCase().includes("demo"))
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  }

  function card(repo) {
    const topics = (repo.topics || []).slice(0, 4).map(t => `<span class="chip">${t}</span>`).join("");
    return `
      <article class="project-card" id="${repo.name}" data-aos="fade-up">
        <div class="project-thumb">${repo.name.slice(0, 1).toUpperCase()}</div>
        <div class="project-body">
          <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
          <p>${repo.description || "No description yet."}</p>
          <div class="project-meta">
            <span>Language: ${repo.language || "n/a"}</span>
            <span>Stars: ${repo.stargazers_count}</span>
            <span>Updated: ${(repo.updated_at || "").slice(0, 10)}</span>
          </div>
          <div class="chip-row">${topics}</div>
        </div>
      </article>
    `;
  }

  async function renderProjects() {
    const repos = await fetchRepos();
    const featured = repos.slice(0, 6);

    const homeGrid = document.getElementById("featured-project-grid");
    if (homeGrid) homeGrid.innerHTML = featured.map(card).join("");

    const pageGrid = document.getElementById("projects-page-grid");
    if (pageGrid) pageGrid.innerHTML = repos.map(card).join("");
  }

  renderProjects().catch(console.error);
})();