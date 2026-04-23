(() => {
  const nav = document.getElementById("site-nav");
  const menuBtn = document.getElementById("menu-btn");
  const links = document.querySelector(".nav-links");

  let lastY = window.scrollY;
  let menuOpen = false;

  function closeMenu() {
    if (!links) return;
    if (window.innerWidth <= 760) {
      links.style.display = "none";
      menuOpen = false;
    }
  }

  function updateNav() {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 10);

    if (nav) {
      if (y > lastY && y > 120 && !menuOpen) nav.classList.add("is-hidden");
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
    if (open) {
      links.style.display = "none";
      menuOpen = false;
    } else {
      links.style.display = "flex";
      links.style.flexDirection = "column";
      menuOpen = true;
    }
  });

  document.addEventListener("click", (e) => {
    if (!links) return;
    if (!e.target.closest(".nav-links") && !e.target.closest("#menu-btn")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      links.style.display = "";
      menuOpen = false;
    } else if (!menuOpen) {
      links.style.display = "none";
    }
  });

  document.querySelectorAll(".nav-links a").forEach(a => {
    a.addEventListener("click", () => closeMenu());
  });

  const path = window.location.pathname;
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === "/" && path === "/") a.classList.add("active");
    else if (href !== "/" && path.startsWith(href)) a.classList.add("active");
  });
})();