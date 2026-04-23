(() => {
  const nav = document.getElementById("site-nav");
  const menuBtn = document.getElementById("menu-btn");
  const links = document.querySelector(".nav-links");

  let lastY = window.scrollY;

  function updateNav() {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 10);

    if (nav) {
      if (y > lastY && y > 120) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
    }

    lastY = y;
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

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
  });

  document.addEventListener("click", (e) => {
    if (!links) return;
    if (!e.target.closest(".nav-links") && !e.target.closest("#menu-btn")) {
      if (window.innerWidth <= 760) {
        links.style.display = "none";
      }
    }
  });

  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === "/" && path === "/") a.classList.add("active");
    else if (href !== "/" && path.startsWith(href)) a.classList.add("active");
  });
})();