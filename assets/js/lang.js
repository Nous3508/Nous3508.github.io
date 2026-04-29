(() => {
  const key = "nous-lang";
  const btn = document.getElementById("lang-toggle");

  function apply(lang) {
    // 1. 更新 html lang 属性
    document.documentElement.setAttribute("lang", lang);

    // 2. 处理所有带 data-lang-en 的元素（替换文本内容）
    document.querySelectorAll("[data-lang-en]").forEach(el => {
      const text = el.getAttribute(`data-lang-${lang}`);
      if (text) el.textContent = text;
    });

    // 3. 保留旧的 class 切换（兼容已有 .lang-en / .lang-zh 结构）
    document.querySelectorAll(".lang-en").forEach(el => {
      el.style.display = lang === "en" ? "" : "none";
    });
    document.querySelectorAll(".lang-zh").forEach(el => {
      el.style.display = lang === "zh" ? "" : "none";
    });
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