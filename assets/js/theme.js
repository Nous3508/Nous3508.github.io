(() => {
  const key = "nous-theme";
  const btn = document.getElementById("theme-btn");
  const icon = document.getElementById("theme-icon");

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    const t = theme === "auto" ? systemTheme() : theme;
    document.documentElement.dataset.theme = t;
    if (icon) icon.textContent = t === "dark" ? "🌙" : "☀️";
  }

  const saved = localStorage.getItem(key) || "auto";
  apply(saved);

  btn?.addEventListener("click", () => {
    const current = localStorage.getItem(key) || "auto";
    const next = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
    localStorage.setItem(key, next);
    apply(next);
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((localStorage.getItem(key) || "auto") === "auto") apply("auto");
  });
})();