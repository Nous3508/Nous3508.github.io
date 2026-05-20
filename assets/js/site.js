// site.js - 站点协调脚本（语言切换和 GitHub 仓库已由 lang.js / github.js 处理）
const OWNER = 'Nous3508';

document.addEventListener('DOMContentLoaded', async () => {
  // 搜索按钮：聚焦到搜索输入框（搜索功能由 search.js 处理）
  document.getElementById('search-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('site-search-input');
    if (input) {
      input.focus();
      input.select();
    }
  });

  // 设置社交链接（备用，主逻辑在 github.js 中）
  const gh = document.querySelector('#gh-link');
  if (gh && !gh.href || gh?.getAttribute('href') === '#') {
    gh.href = `https://github.com/${OWNER}`;
  }
});