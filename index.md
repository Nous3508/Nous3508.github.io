---
layout: default
title: Home
permalink: /
---
<section class="hero">
  <div class="inner container">
    <!-- 使用你提供的头像路径（请确保该文件已上传到仓库根或相应路径） -->
    <img class="avatar" src="/web-app-manifest-192x192.png" alt="avatar">

    <!-- 英文（默认显示） -->
    <div class="hero-text lang-en">
      <h1>Hi, I'm <span id="owner-name-en">{{ site.data.profile.en.name }}</span></h1>
      <p class="tagline">{{ site.data.profile.en.tagline }}</p>
      <p class="cta">
        <a class="btn" href="#projects">View projects</a>
        <a class="btn secondary" href="/blog">Read blog</a>
        <a class="btn ghost" href="{{ site.data.profile.en.resume }}" download>Download Resume</a>
      </p>
    </div>

    <!-- 中文 -->
    <div class="hero-text lang-zh" style="display:none">
      <h1>你好，我是 <span id="owner-name-zh">{{ site.data.profile.zh.name }}</span></h1>
      <p class="tagline">{{ site.data.profile.zh.tagline }}</p>
      <p class="cta">
        <a class="btn" href="#projects">查看项目</a>
        <a class="btn secondary" href="/blog">阅读博客</a>
        <a class="btn ghost" href="{{ site.data.profile.zh.resume }}" download>下载简历</a>
      </p>
    </div>
  </div>
</section>

<section id="projects" class="section projects container">
  <h2>Projects / 项目</h2>
  <div id="projects-list" class="grid"></div>
  <p class="muted">Repositories are pulled from GitHub and sorted by stars. / 仓库从 GitHub 自动拉取并按 star 排序。</p>
</section>

<section id="blog" class="section container">
  <h2>Latest posts / 最新博客</h2>
  <ul>
    {% for post in site.posts limit:3 %}
    <li><a href="{{ post.url }}">{{ post.title }}</a> · <small>{{ post.date | date: "%Y-%m-%d" }}</small></li>
    {% endfor %}
  </ul>
  <p><a href="/blog">All posts / 全部文章 →</a></p>
</section>

<section id="about" class="section about container">
  <h2>About / 关于</h2>
  <p class="lang-en">{{ site.data.profile.en.about }}</p>
  <p class="lang-zh" style="display:none">{{ site.data.profile.zh.about }}</p>
</section>