/**
 * particles.js - 首页背景星空粒子漂浮效果
 *
 * 在 canvas 上绘制缓慢飘浮的彩色粒子，使用主题色渐变。
 * 仅在首页（.home-layout 存在时）自动初始化。
 */
(() => {
  'use strict';

  // ==================== 配置 ====================
  const CONFIG = {
    count: 60,            // 粒子数量
    minSize: 1.5,         // 最小尺寸 (px)
    maxSize: 4.5,         // 最大尺寸 (px)
    minSpeed: 0.15,       // 最小飘浮速度
    maxSpeed: 0.45,       // 最大飘浮速度
    minOpacity: 0.15,     // 最小透明度
    maxOpacity: 0.55,     // 最大透明度
    connectionDist: 130,  // 连线距离 (px)，设为 0 则不连线
    colors: [             // 使用主题色渐变
      { r: 155, g: 92, b: 255 },   // 紫色 #9b5cff
      { r: 35,  g: 213, b: 255 },  // 青色 #23d5ff
      { r: 142, g: 92, b: 255 },   // 深紫 #8e5cff
      { r: 100, g: 160, b: 255 },  // 中间蓝紫
    ],
  };

  // ==================== 状态 ====================
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animId = null;
  let width = 0;
  let height = 0;
  let isDark = false;

  // ==================== 粒子类 ====================
  class Particle {
    constructor() {
      this.reset(true);
    }

    /** 初始化或重置粒子位置/速度 */
    reset(initial = false) {
      // 位置：全屏随机分布
      this.x = Math.random() * width;
      this.y = initial
        ? Math.random() * height
        : height + 10; // 重置到底部

      // 大小
      this.size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);

      // 速度（向上飘浮为主，加轻微水平漂移）
      this.speedY = -(CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed));
      this.speedX = (Math.random() - 0.5) * 0.2;

      // 透明度
      this.opacity = CONFIG.minOpacity + Math.random() * (CONFIG.maxOpacity - CONFIG.minOpacity);

      // 颜色：从配置颜色数组中随机选一个，加一点随机偏移
      const base = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.color = {
        r: Math.min(255, Math.max(0, base.r + (Math.random() - 0.5) * 30)),
        g: Math.min(255, Math.max(0, base.g + (Math.random() - 0.5) * 30)),
        b: Math.min(255, Math.max(0, base.b + (Math.random() - 0.5) * 30)),
      };

      // 微小的闪烁速度
      this.twinkleSpeed = 0.5 + Math.random() * 1.5;
      this.twinklePhase = Math.random() * Math.PI * 2;
    }

    /** 更新位置 */
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // 超出顶部则重置到底部
      if (this.y < -20) {
        this.reset(false);
        // 重置时水平位置随机
        this.x = Math.random() * (width + 40) - 20;
      }

      // 超出左右边界则折返
      if (this.x < -20) this.x = width + 10;
      if (this.x > width + 20) this.x = -10;

      // 更新闪烁相位
      this.twinklePhase += this.twinkleSpeed * 0.02;
    }

    /** 绘制到 canvas */
    draw(ctx) {
      const twinkle = 0.7 + 0.3 * Math.sin(this.twinklePhase);
      const alpha = this.opacity * twinkle;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`;
      ctx.fill();

      // 给较大的粒子加一点发光光晕
      if (this.size > 3) {
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.4})`;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==================== 绘制粒子间连线 ====================
  function drawConnections(ctx) {
    if (!CONFIG.connectionDist) return;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDist) {
          const alpha = (1 - dist / CONFIG.connectionDist) * 0.12;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isDark
            ? 'rgba(200, 200, 255, 0.6)'
            : 'rgba(142, 92, 255, 0.5)';
          ctx.lineWidth = 0.6;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // ==================== 主循环 ====================
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 更新并绘制粒子
    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }

    // 画连线
    drawConnections(ctx);

    animId = requestAnimationFrame(animate);
  }

  // ==================== 初始化 Canvas ====================
  function initCanvas() {
    // 检查是否已存在
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.className = 'bg-particles-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    // 插到 .home-layout 之前（作为背景层）
    const homeLayout = document.querySelector('.home-layout');
    if (!homeLayout) return;

    homeLayout.parentNode.insertBefore(canvas, homeLayout);
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // 检测当前主题
    isDark = document.documentElement.dataset.theme === 'dark';
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.dataset.theme === 'dark';
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // 创建粒子
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(new Particle());
    }

    // 启动动画
    if (animId) cancelAnimationFrame(animId);
    animate();
  }

  // ==================== 尺寸更新 ====================
  function resize() {
    if (!canvas) return;
    const rect = canvas.parentNode.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  // ==================== 销毁 ====================
  function destroy() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    canvas = null;
    ctx = null;
    particles = [];
  }

  // ==================== 启动 ====================
  // 仅在首页有 .home-layout 时初始化
  if (document.querySelector('.home-layout')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCanvas);
    } else {
      initCanvas();
    }
  }
})();
