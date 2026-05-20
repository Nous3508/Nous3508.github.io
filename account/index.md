---
layout: default
title: Account Settings
description: "Account settings and bookmark sync status"
permalink: /account/
---
<section class="container page-hero" data-aos="fade-up">
  <p class="eyebrow">Account</p>
  <h1 data-lang-en="Account Settings" data-lang-zh="账户设置">Account Settings</h1>
  <p class="lead lang-en">Manage your profile and bookmark sync.</p>
  <p class="lead lang-zh" style="display:none">管理您的个人资料和收藏夹同步。</p>
</section>

<section class="container">
  <article class="acct-card" data-aos="fade-up">
    <div class="acct-avatar-row">
      <img id="acct-avatar" class="acct-avatar" src="" alt="avatar">
      <div>
        <h2 id="acct-name" class="acct-name">—</h2>
        <p id="acct-email" class="acct-email">—</p>
        <a id="acct-github-link" href="#" target="_blank" rel="noopener noreferrer" class="acct-gh-link">
          View GitHub Profile →
        </a>
      </div>
    </div>
  </article>

  <article class="acct-card" data-aos="fade-up" data-aos-delay="60">
    <h2 data-lang-en="Bookmark Sync" data-lang-zh="收藏夹同步">Bookmark Sync</h2>
    <div class="acct-sync-row">
      <span class="acct-sync-label" data-lang-en="Status:" data-lang-zh="状态：">Status:</span>
      <span id="acct-sync-status" class="acct-sync-checking" data-lang-en="Checking..." data-lang-zh="检查中...">Checking...</span>
    </div>
    <div class="acct-sync-row">
      <span class="acct-sync-label" data-lang-en="Bookmarks:" data-lang-zh="书签数：">Bookmarks:</span>
      <span id="acct-bookmark-count">—</span>
    </div>
    <p class="acct-sync-hint" data-lang-en="Your bookmarks are automatically synced to your Supabase account."
       data-lang-zh="您的收藏夹会自动同步到 Supabase 账户。">
      Your bookmarks are automatically synced to your Supabase account.
    </p>
  </article>

  <article class="acct-card" data-aos="fade-up" data-aos-delay="120">
    <h2 data-lang-en="Sign Out" data-lang-zh="退出登录">Sign Out</h2>
    <p data-lang-en="Sign out of your account. Local bookmarks will be preserved."
       data-lang-zh="退出登录。本地收藏夹会保留。">
      Sign out of your account. Local bookmarks will be preserved.
    </p>
    <button id="acct-signout" class="acct-signout-btn" data-lang-en="Sign Out" data-lang-zh="退出登录">Sign Out</button>
  </article>
</section>
