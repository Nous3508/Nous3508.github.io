---
layout: default
title: Home
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
    <a class="quick-link-btn quick-link-bilibili" href="https://www.bilibili.com/" target="_blank" rel="noopener noreferrer" aria-label="Bilibili" title="Bilibili">
      <svg viewBox="0 0 24 24" class="quick-link-svg" aria-hidden="true">
        <path d="M7 5l2 2h6l2-2 2 2v10H5V7l2-2zm1 4v6h8V9H8zm2-2h1v1h-1V7zm4 0h1v1h-1V7z" fill="currentColor"/>
      </svg>
    </a>

    <a class="quick-link-btn quick-link-cnki" href="https://www.cnki.net/" target="_blank" rel="noopener noreferrer" aria-label="知网" title="知网">
      <svg viewBox="0 0 24 24" class="quick-link-svg" aria-hidden="true">
        <path d="M12 2l4 4-4 4-4-4 4-4zm0 6l5 5-5 5-5-5 5-5zm0 2l3 3-3 3-3-3 3-3z" fill="currentColor"/>
      </svg>
    </a>

    <a class="quick-link-btn quick-link-school" href="https://cas.scau.edu.cn/lyuapServer/login?service=https://portal.scau.edu.cn:8080/sso/toLogin" target="_blank" rel="noopener noreferrer" aria-label="学校网站" title="学校网站">
      <svg viewBox="0 0 24 24" class="quick-link-svg" aria-hidden="true">
        <path d="M12 3l9 5-9 5-9-5 9-5zm-6 8v5l6 3 6-3v-5l-6 3-6-3zm1 7h10v2H7v-2z" fill="currentColor"/>
      </svg>
    </a>

    <a class="quick-link-btn quick-link-feishu" href="https://feishu.cn/" target="_blank" rel="noopener noreferrer" aria-label="飞书" title="飞书">
      <svg viewBox="0 0 24 24" class="quick-link-svg" aria-hidden="true">
        <path d="M6 4h12v3H6V4zm0 6h12v3H6v-3zm0 6h8v3H6v-3z" fill="currentColor"/>
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