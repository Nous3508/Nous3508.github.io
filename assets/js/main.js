(() => {
  const nav = document.getElementById("site-nav");
  const menuBtn = document.getElementById("menu-btn");
  const links = document.querySelector(".nav-links");

  // 只保留“滚动时加 scrolled 样式”，不再自动隐藏导航
  function updateNav() {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 10);
    nav?.classList.remove("is-hidden");
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  // 移动端菜单
  menuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!links) return;
    const open = links.style.display === "flex";
    links.style.display = open ? "none" : "flex";
    links.style.flexDirection = "column";
    links.style.position = "absolute";
    links.style.top = "72px";
    links.style.right = "16px";
    links.style.padding = "16px";
    links.style.borderRadius = "20px";
    links.style.background = "var(--card)";
    links.style.boxShadow = "var(--shadow-strong)";
    links.style.zIndex = "100000";
  });

  document.addEventListener("click", (e) => {
    if (!links) return;
    if (!e.target.closest(".nav-links") && !e.target.closest("#menu-btn")) {
      if (window.innerWidth <= 760) links.style.display = "none";
    }
  });

  // 高亮当前菜单
  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === "/" && path === "/") a.classList.add("active");
    else if (href !== "/" && path.startsWith(href)) a.classList.add("active");
  });
})();