---
layout: default
title: Nous の little nest
description: "Nous の little nest — projects first, search centered, clean blog preview"
permalink: /
---
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

  <div class="quick-links" data-aos="fade-up" data-aos-delay="80">
    <a class="sakura-social-card" href="https://www.bilibili.com/" aria-label="Bilibili" target="_blank" rel="noopener noreferrer" style="--sakura-color-icon: #fb7299;">
      <svg viewBox="0 0 24 24" class="sakura-icon" aria-hidden="true">
        <path d="M7 6h2l1.8 2H13l1.8-2H17a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2.2L13 11H11L9.2 8H7zm2 2h1.5v3H9V10zm4.5 0H15v3h-1.5V10z" fill="currentColor"/>
        <path d="M19.2 8.4h1.2v7.2h-1.2zm-17.6 0h1.2v7.2H1.6z" fill="currentColor"/>
      </svg>
    </a>

    <a class="sakura-social-card" href="https://www.cnki.net/" aria-label="知网" target="_blank" rel="noopener noreferrer" style="--sakura-color-icon: #2f6fbd;">
      <svg viewBox="0 0 24 24" class="sakura-icon" aria-hidden="true">
        <path d="M12 3l4.2 4.2L12 11.4 7.8 7.2 12 3zm0 7.2l4.2 4.2L12 18.6 7.8 14.4 12 10.2z" fill="currentColor"/>
        <path d="M8.2 14.4L12 18.2l3.8-3.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 6h2v12H6zm10 0h2v12h-2z" fill="currentColor" opacity=".18"/>
      </svg>
    </a>

    <a class="sakura-social-card" href="https://cas.scau.edu.cn/lyuapServer/login?service=https://portal.scau.edu.cn:8080/sso/toLogin" aria-label="学校网站" target="_blank" rel="noopener noreferrer" style="--sakura-color-icon: #f59e0b;">
      <svg viewBox="0 0 24 24" class="sakura-icon" aria-hidden="true">
        <path d="M12 3L3.5 7.2 12 11.4l8.5-4.2L12 3zm-6 8.5V16l6 3 6-3v-4.5L12 14.7 6 11.5zm1.5 4.9l4.5 2.2 4.5-2.2" fill="currentColor"/>
        <path d="M12 12.8v6.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </a>

    <a class="sakura-social-card" href="https://feishu.cn/" aria-label="飞书" target="_blank" rel="noopener noreferrer" style="--sakura-color-icon: #2f6bff;">
      <svg viewBox="0 0 24 24" class="sakura-icon" aria-hidden="true">
        <path d="M6.5 4.8h11v2H6.5v-2zm0 5.1h11v2h-11v-2zm0 5.1h8v2h-8v-2z" fill="currentColor"/>
        <path d="M14.5 8l3.6 3.6c.5.5 1.1.8 1.8.8h.6c.5 0 .9.4.9.9 0 2-1.1 3.7-2.7 4.6-1.7.8-3.7.6-5.1-.7L13 16l-1.9-1.9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  </div>

  <div class="search-panel" data-aos="fade-up" data-aos-delay="120">
    <div class="search-bar">
      <button id="search-mode-btn-inline" class="search-mode-btn" aria-label="toggle search mode">
        <span id="search-mode-icon-inline">🔍</span>
      </button>
      <input id="site-search-input" type="text" placeholder="Search posts / projects..." autocomplete="off">
      <button id="site-search-btn" class="search-submit">Search</button>
    </div>
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