---
layout: default
title: Blog
description: "Blog posts, notes, and updates"
permalink: /blog/
---
<section class="container page-hero" data-aos="fade-up">
  <p class="eyebrow">Blog</p>
  <h1>Blog posts</h1>
  <p class="lead lang-en">
    Clean reading experience with table of contents and share buttons.
  </p>
  <p class="lead lang-zh" style="display:none">
    清爽的阅读体验，支持目录和分享按钮。
  </p>
</section>

<section class="container blog-list">
  {% for post in site.posts %}
  <article class="blog-card" data-aos="fade-up" data-aos-delay="{{ forloop.index0 | times: 60 }}">
    <div class="blog-card-main">
      <p class="mini-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <p>{{ post.excerpt | strip_html | truncate: 180 }}</p>
    </div>
    <div class="blog-card-actions">
      <a class="read-btn" href="{{ post.url }}">Read</a>
      <button class="share-btn" data-share-url="{{ site.url }}{{ post.url }}" data-share-title="{{ post.title }}">Share</button>
    </div>
  </article>
  {% endfor %}
</section>