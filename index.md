---
layout: default
title: Nous の little nest
description: "Nous の little nest — projects first, search centered, clean blog preview"
permalink: /
---
<div class="home-layout">
  <aside class="bookmark-nav" id="bookmark-nav">
    <div class="bookmark-nav-inner">
      <div class="bookmark-nav-header">
        <div class="bookmark-nav-title-row">
          <button class="bookmark-toggle-btn" id="bookmark-toggle-btn" aria-label="Toggle bookmark nav">
            <span class="bookmark-toggle-icon">◀</span>
          </button>
          <span class="bookmark-nav-title" data-lang-en="Quick Nav" data-lang-zh="快捷导航">Quick Nav</span>
          <button class="bookmark-gear-btn" id="bookmark-gear-btn" aria-label="Settings" title="Settings">⚙</button>
        </div>
      </div>

      <div class="bookmark-list" id="bookmark-list"></div>
    </div>

    <!-- 齿轮下拉菜单（移出 overflow:hidden 容器，避免被裁切） -->
    <div class="bm-gear-dropdown" id="bm-gear-dropdown">
      <button class="bm-dropdown-item" data-action="manage">
        <span class="bm-dropdown-icon">📂</span>
        <span data-lang-en="Manage Bookmarks" data-lang-zh="管理收藏夹">Manage Bookmarks</span>
      </button>
      <div class="bm-dropdown-divider"></div>
      <div class="bm-dropdown-section">
        <div class="bm-dropdown-section-title">
          <span class="bm-dropdown-icon">🎨</span>
          <span data-lang-en="Nav Settings" data-lang-zh="导航设置">Nav Settings</span>
        </div>
        <!-- 位置 -->
        <div class="bm-dropdown-row bm-dropdown-row--col">
          <label data-lang-en="Position" data-lang-zh="位置">Position</label>
          <div class="bm-pos-group" id="bm-nav-position">
            <button class="bm-pos-btn" data-value="left" title="Left">Left</button>
            <button class="bm-pos-btn" data-value="right" title="Right">Right</button>
            <button class="bm-pos-btn" data-value="top" title="Top">Top</button>
            <button class="bm-pos-btn" data-value="bottom" title="Bottom">Bottom</button>
          </div>
        </div>
      </div>
      <div class="bm-dropdown-divider"></div>
      <button class="bm-dropdown-item" data-action="push-cloud">
        <span class="bm-dropdown-icon">☁️⬆</span>
        <span data-lang-en="Push to Cloud" data-lang-zh="推送到云端">Push to Cloud</span>
      </button>
      <button class="bm-dropdown-item" data-action="pull-cloud">
        <span class="bm-dropdown-icon">☁️⬇</span>
        <span data-lang-en="Pull from Cloud" data-lang-zh="从云端拉取">Pull from Cloud</span>
      </button>
    </div>
  </aside>

  <!-- 侧滑编辑面板 -->
  <div class="bookmark-panel-backdrop" id="bookmark-panel-backdrop"></div>
  <div class="bookmark-slide-panel" id="bookmark-slide-panel">
    <div class="bm-panel-header">
      <span class="bm-panel-title" data-lang-en="Manage Bookmarks" data-lang-zh="管理收藏夹">Manage Bookmarks</span>
      <button class="bm-panel-close" id="bookmark-panel-close" aria-label="Close panel">✕</button>
    </div>
    <div class="bm-panel-hint" data-lang-en="Drag ☰ to reorder" data-lang-zh="拖动 ☰ 调整顺序">Drag ☰ to reorder</div>
    <div class="bm-panel-list" id="bookmark-panel-list"></div>
    <div class="bm-panel-add-form" id="bookmark-panel-add-form">
      <input type="text" class="bm-panel-input" id="bm-panel-url" placeholder="URL, e.g. https://example.com">
      <input type="text" class="bm-panel-input" id="bm-panel-title" placeholder="Title (auto-filled)">
      <button class="bm-panel-add-btn" id="bm-panel-add-btn" data-lang-en="Add Bookmark" data-lang-zh="添加书签">＋ Add Bookmark</button>
    </div>
  </div>

  <div class="home-main">
<section class="hero-home container">
  <div class="hero-copy" data-aos="fade-up">
    <p class="eyebrow">Nous の little nest</p>
    <h1>Build real things.<br>Learn fast. Iterate.</h1>
    <p class="hero-desc lang-en">
      Student • Smart Manufacturing • Aspiring Embedded Engineer
    </p>
    <p class="hero-desc lang-zh" style="display:none">
      学生 • 智能制造 • 未来嵌入式工程师
    </p>
  </div>

  <!-- 图标区域已移除，替换为渐变色标题动画 -->

  <div class="search-panel" data-aos="fade-up" data-aos-delay="120">
    <div class="search-bar">
      <button id="search-mode-btn-inline" class="search-mode-btn" aria-label="toggle search mode">
        <span id="search-mode-icon-inline">🔍</span>
      </button>
      <div class="search-input-wrap">
        <input id="site-search-input" type="text" placeholder="Search posts / projects..." autocomplete="off">
      </div>
      <button id="site-search-btn" class="search-submit">Search</button>
    </div>
    <div id="search-suggestions" class="search-suggestions" style="display:none"></div>
    <div id="search-hints" class="search-hints"></div>
    <div id="search-results" class="search-results"></div>
  </div>
</section>

<section class="container section-gap hero-divider">
  <div class="section-head" data-aos="fade-up">
    <p class="eyebrow">Featured</p>
    <h2>Selected projects</h2>
  </div>
  <div id="featured-project-grid" class="project-grid"></div>
  <div class="section-link-wrap">
    <a class="section-link" href="/projects/">View all projects →</a>
  </div>
</section>

<section class="container section-gap blog-preview-block">
  <div class="section-head" data-aos="fade-up">
    <p class="eyebrow">Blog</p>
    <h2>Latest posts</h2>
    <p class="lead">
      Clean notes and updates — short, readable, and easy to share.
    </p>
  </div>

  <div class="latest-posts-grid">
    {% for post in site.posts limit:3 %}
    <article class="mini-post-card" data-aos="fade-up" data-aos-delay="{{ forloop.index0 | times: 80 }}">
      <p class="mini-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
      <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
      <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
      <div class="mini-actions">
        <a class="read-btn secondary" href="{{ post.url }}">Read</a>
        <button class="share-btn" data-share-url="{{ site.url }}{{ post.url }}" data-share-title="{{ post.title }}">Share</button>
      </div>
    </article>
    {% endfor %}
  </div>

  <div class="section-link-wrap">
    <a class="section-link" href="/blog/">View all posts →</a>
  </div>
</section>

  </div><!-- /.home-main -->
</div><!-- /.home-layout -->