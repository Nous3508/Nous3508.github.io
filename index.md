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

  <div class="search-panel" data-aos="fade-up" data-aos-delay="100">
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

<section class="container section-gap" id="featured-projects">
  <div class="section-head" data-aos="fade-up">
    <p class="eyebrow">Projects</p>
    <h2>Featured projects</h2>
  </div>
  <div id="featured-project-grid" class="project-grid"></div>
  <div class="section-link-wrap">
    <a class="section-link" href="/projects/">View all projects →</a>
  </div>
</section>

<section class="container section-gap" id="latest-posts">
  <div class="section-head" data-aos="fade-up">
    <p class="eyebrow">Blog</p>
    <h2>Latest posts</h2>
  </div>
  <div class="latest-posts-grid">
    {% for post in site.posts limit:3 %}
    <article class="mini-post-card" data-aos="fade-up" data-aos-delay="{{ forloop.index0 | times: 80 }}">
      <p class="mini-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
      <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
      <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
      <div class="mini-actions">
        <a href="{{ post.url }}">Read</a>
        <button class="share-btn" data-share-url="{{ site.url }}{{ post.url }}" data-share-title="{{ post.title }}">Share</button>
      </div>
    </article>
    {% endfor %}
  </div>
  <div class="section-link-wrap">
    <a class="section-link" href="/blog/">View all posts →</a>
  </div>
</section>