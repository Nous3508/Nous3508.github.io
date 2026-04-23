(() => {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-share]");
    const custom = e.target.closest("[data-share-url]");
    if (!btn && !custom) return;

    const url = custom?.dataset.shareUrl || window.location.href;
    const title = custom?.dataset.shareTitle || document.title;

    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied.");
    }
  });
})();