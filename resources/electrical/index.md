---
layout: default
title: 电控方向
description: "单片机、嵌入式、电路与控制系统学习资料"
permalink: /resources/electrical/
---
<section class="container page-hero" data-aos="fade-up">
  <p class="eyebrow">Learning Path</p>
  <h1>电控方向 🔌</h1>
  <p class="lead">
    从电路基础到嵌入式开发，再到控制与通信，逐步建立完整的电控能力。
  </p>
</section>

<section class="container learning-progress-note" data-aos="fade-up" data-aos-delay="60">
  <div class="learning-note-item">
    <span>建议周期</span>
    <strong>4 - 8 个月</strong>
  </div>
  <div class="learning-note-item">
    <span>核心工具</span>
    <strong>STM32 · Keil · CubeMX · 示波器</strong>
  </div>
  <div class="learning-note-item">
    <span>最终目标</span>
    <strong>能完成嵌入式控制与电机驱动项目</strong>
  </div>
</section>

<section class="container learning-timeline">

  <article class="learning-timeline-item" data-aos="fade-up">
    <div class="learning-step">
      <span class="learning-step-number">01</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">基础入门 · 2-3 周</p>
      <h2>先把底层概念打牢</h2>
      <p class="learning-goal">目标：能看懂基础电路并完成简单测量与判断。</p>
      <ul class="learning-list">
        <li>电阻、电容、电感、二极管、三极管基础</li>
        <li>欧姆定律、基尔霍夫定律、分压分流</li>
        <li>模拟电路与数字电路基础</li>
        <li>万用表、示波器、电源使用方法</li>
        <li>电路图识读与基础焊接</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1QE411R7pN/" target="_blank" rel="noopener noreferrer">B站视频：电子技术基础（清华大学）</a></li>
          <li><a href="https://www.st.com/content/st_com/en/support/learning/stm32-education.html" target="_blank" rel="noopener noreferrer">官方：ST STM32 Education</a></li>
          <li><a href="https://www.bilibili.com/video/BV1BV41197rY/" target="_blank" rel="noopener noreferrer">B站视频：零基础入门嵌入式</a></li>
        </ul>
      </div>
    </div>
  </article>

  <article class="learning-timeline-item" data-aos="fade-up" data-aos-delay="80">
    <div class="learning-step">
      <span class="learning-step-number">02</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">核心开发 · 4-6 周</p>
      <h2>进入单片机与嵌入式</h2>
      <p class="learning-goal">目标：能独立完成 MCU 外设开发和基础调试。</p>
      <ul class="learning-list">
        <li>C 语言基础与嵌入式 C 习惯</li>
        <li>STM32 / 其他 MCU 开发环境搭建</li>
        <li>GPIO、UART、I2C、SPI、ADC、PWM</li>
        <li>中断、定时器、DMA、看门狗</li>
        <li>传感器驱动与外设调试</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1vt4y1k7DV" target="_blank" rel="noopener noreferrer">B站视频：STM32 HAL 库开发</a></li>
          <li><a href="https://www.st.com/en/development-tools/stm32cubeide.html" target="_blank" rel="noopener noreferrer">官方：STM32CubeIDE</a></li>
          <li><a href="https://www.bilibili.com/video/BV1qP41187Pq/" target="_blank" rel="noopener noreferrer">B站视频：AutoCAD 机械制图入门（辅助硬件出图）</a></li>
        </ul>
      </div>
    </div>
  </article>

  <article class="learning-timeline-item" data-aos="fade-up" data-aos-delay="160">
    <div class="learning-step">
      <span class="learning-step-number">03</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">控制与通信 · 3-5 周</p>
      <h2>把系统真正跑起来</h2>
      <p class="learning-goal">目标：能把电机、传感器、通信和控制组合成完整系统。</p>
      <ul class="learning-list">
        <li>PID 控制基础与参数整定</li>
        <li>电机驱动：直流电机、步进电机、舵机、无刷电机</li>
        <li>编码器反馈与闭环控制</li>
        <li>UART、CAN、I2C、RS485 通信</li>
        <li>FreeRTOS 与任务调度基础</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1134y1C7zP" target="_blank" rel="noopener noreferrer">B站视频：STM32 电机应用控制</a></li>
          <li><a href="https://www.bilibili.com/video/BV13x411E7Ac" target="_blank" rel="noopener noreferrer">B站视频：FreeRTOS 教程</a></li>
          <li><a href="https://www.freertos.org/" target="_blank" rel="noopener noreferrer">官方：FreeRTOS</a></li>
        </ul>
      </div>
    </div>
  </article>

  <article class="learning-timeline-item" data-aos="fade-up" data-aos-delay="240">
    <div class="learning-step">
      <span class="learning-step-number">04</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">项目实践 · 持续迭代</p>
      <h2>用项目把知识串起来</h2>
      <p class="learning-goal">目标：做出一个可以稳定运行的完整电控项目。</p>
      <ul class="learning-list">
        <li>循迹��车 / 平衡车</li>
        <li>电机调速系统</li>
        <li>多传感器数据采集系统</li>
        <li>机械臂底层控制模块</li>
        <li>嵌入式综合实战项目</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://github.com/oguzoktem/embedded-journey" target="_blank" rel="noopener noreferrer">练习参考：Embedded Journey</a></li>
          <li><a href="https://www.bilibili.com/video/BV1BV41197rY/" target="_blank" rel="noopener noreferrer">B站视频：零基础入门嵌入式</a></li>
          <li><a href="https://controllerstech.com/introduction-to-free-rtos-in-stm32/?page" target="_blank" rel="noopener noreferrer">B站/教程参考：FreeRTOS 实战</a></li>
        </ul>
      </div>
    </div>
  </article>

</section>