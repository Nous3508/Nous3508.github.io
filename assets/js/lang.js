(() => {
  const key = "nous-lang";
  const btn = document.getElementById("lang-toggle");

  // 需要额外切换的 HTML 属性列表
  const ATTR_MAP = {
    "placeholder": "placeholder",
    "aria-label": "aria-label",
    "title": "title"
  };

  function apply(lang) {
    // 1. 更新 html lang 属性
    document.documentElement.setAttribute("lang", lang);

    // 2. 处理所有带 data-lang-en 的元素（替换文本内容）
    document.querySelectorAll("[data-lang-en]").forEach(el => {
      const text = el.getAttribute(`data-lang-${lang}`);
      if (text) el.textContent = text;
    });

    // 3. 处理需要额外切换的 HTML 属性（placeholder / aria-label / title）
    Object.entries(ATTR_MAP).forEach(([attrKey, attrName]) => {
      document.querySelectorAll(`[data-lang-en-${attrKey}]`).forEach(el => {
        const val = el.getAttribute(`data-lang-${lang}-${attrKey}`);
        if (val !== null) {
          el.setAttribute(attrName, val);
        }
      });
    });

    // 4. 切换 .lang-en / .lang-zh 块级内容的显示
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