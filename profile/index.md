---
layout: default
title: Profile
description: "About Nous, skills, timeline, and contact"
permalink: /profile/
---
<section class="profile-hero container" data-aos="fade-up">
  <div class="profile-card">
    <img class="profile-avatar" src="/web-app-manifest-192x192.png" alt="Nous avatar">
    <div class="profile-copy">
      <p class="eyebrow">Profile</p>
      <h1>{{ site.data.profile.en.name }} / {{ site.data.profile.zh.name }}</h1>
      <p class="profile-subtitle lang-en">{{ site.data.profile.en.subtitle }}</p>
      <p class="profile-subtitle lang-zh" style="display:none">{{ site.data.profile.zh.subtitle }}</p>
      <p class="profile-intro lang-en">{{ site.data.profile.en.intro }}</p>
      <p class="profile-intro lang-zh" style="display:none">{{ site.data.profile.zh.intro }}</p>

      <div class="profile-actions">
        <a class="download-btn" href="{{ site.data.profile.en.resume }}" target="_blank" rel="noopener">
          Download Resume
        </a>
      </div>
    </div>
  </div>
</section>

<section class="container profile-sections">
  <div class="profile-block" data-aos="fade-up">
    <h2>Skills / 技术标签</h2>
    <div class="tag-list">
      {% for tag in site.data.profile.en.tags %}
      <span class="tag">{{ tag }}</span>
      {% endfor %}
    </div>
  </div>

  <div class="profile-block" data-aos="fade-up" data-aos-delay="80">
    <h2>Timeline / 时间线</h2>
    <div class="timeline">
      {% for item in site.data.profile.en.timeline %}
      <div class="timeline-item">
        <div class="timeline-year">{{ item.year }}</div>
        <div class="timeline-body">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>

  <div class="profile-block" data-aos="fade-up" data-aos-delay="120">
    <h2>Contact / 联系</h2>
    <div class="social-row">
      <a href="{{ site.data.profile.en.social.github }}" target="_blank" rel="noopener">GitHub</a>
      <a href="mailto:{{ site.data.profile.en.social.email }}">Email</a>
      <a href="{{ site.data.profile.en.social.station }}" target="_blank" rel="noopener">Station</a>
    </div>
  </div>
</section>