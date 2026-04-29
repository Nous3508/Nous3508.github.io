(() => {
  const key = "nous-theme";
  const btn = document.getElementById("theme-toggle"); // ✅ 修正 id

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    const realTheme = theme === "auto" ? systemTheme() : theme;
    document.documentElement.dataset.theme = realTheme;
    // ✅ 直接更新按钮文字（去掉 theme-icon）
    if (btn) btn.textContent = realTheme === "dark" ? "🌙" : "☀️";
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
    if ((localStorage.getItem(key) || "auto") === "auto") {
      apply("auto");
    }
  });
})();