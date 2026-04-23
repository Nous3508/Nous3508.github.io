(() => {
  const toc = document.getElementById("toc");
  const content = document.querySelector(".post-content");
  if (!toc || !content) return;

  const headings = [...content.querySelectorAll("h2, h3")];
  toc.innerHTML = headings.map((h, i) => {
    if (!h.id) h.id = `heading-${i}`;
    return `<a href="#${h.id}">${h.textContent}</a>`;
  }).join("");
})();