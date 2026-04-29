(() => {
  const key = "nous-lang";
  const btn = document.getElementById("lang-btn");

  function apply(lang) {
    document.querySelectorAll(".lang-en").forEach(el => {
      el.style.display = lang === "en" ? "" : "none";
    });
    document.querySelectorAll(".lang-zh").forEach(el => {
      el.style.display = lang === "zh" ? "" : "none";
    });
    document.documentElement.setAttribute('lang', lang);
  }

  const saved = localStorage.getItem(key) || "en";
  apply(saved);

  btn?.addEventListener("click", () => {
    const current = localStorage.getItem(key) || "en";
    const next = current === "en" ? "zh" : "en";
    localStorage.setItem(key, next);
    apply(next);
  });
})();