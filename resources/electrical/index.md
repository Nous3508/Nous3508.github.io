---
layout: default
title: 电控方向
description: "电子信息与自动控制方向学习路径"
permalink: /resources/electrical/
---
<section class="container page-hero" data-aos="fade-up">
  <p class="eyebrow">Learning Path</p>
  <h1>电控方向 🔌</h1>
  <p class="lead">
    电控组走的是电子信息 + 自动控制方向，核心是嵌入式软硬件开发与 ROS 上位机协同的完整技术链条。
  </p>
</section>

<section class="container learning-progress-note" data-aos="fade-up" data-aos-delay="60">
  <div class="learning-note-item">
    <span>方向定位</span>
    <strong>嵌入式软硬件 + ROS 协同</strong>
  </div>
  <div class="learning-note-item">
    <span>核心工具</span>
    <strong>STM32 · ESP32 · ROS2 · MAVROS · MoveIt</strong>
  </div>
  <div class="learning-note-item">
    <span>最终目标</span>
    <strong>实现底层实时控制到高层智能决策闭环</strong>
  </div>
</section>

<section class="container learning-timeline">

  <article class="learning-timeline-item" data-aos="fade-up">
    <div class="learning-step">
      <span class="learning-step-number">01</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">阶段一 · 电路与嵌入式基础</p>
      <h2>先把底层硬件与单片机基础打牢</h2>
      <p class="learning-goal">目标：具备独立搭建嵌入式系统的基础能力，能看懂原理图、焊接、调试和烧录程序。</p>
      <ul class="learning-list">
        <li>电阻、电容、电感、二极管、三极管基础</li>
        <li>欧姆定律、基尔霍夫定律、模拟/数字电路基础</li>
        <li>STM32 / ESP32 开发环境、C/C++ 嵌入式编程</li>
        <li>GPIO、UART、I2C、SPI、ADC、PWM</li>
        <li>万用表、示波器、电源、基础焊接与调试</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1QE411R7pN/" target="_blank" rel="noopener noreferrer">B站视频：电子技术基础（清华大学）</a></li>
          <li><a href="https://www.bilibili.com/video/BV1vt4y1k7DV" target="_blank" rel="noopener noreferrer">B站视频：STM32 HAL 库开发</a></li>
          <li><a href="https://www.st.com/content/st_com/en/support/learning/stm32-education.html" target="_blank" rel="noopener noreferrer">官方文档：ST STM32 Education</a></li>
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
      <p class="learning-kicker">阶段二 · 下位机实时控制</p>
      <h2>让芯片成为系统的“实时神经中枢”</h2>
      <p class="learning-goal">目标：掌握主控芯片 + 外围电路的实时控制能力，完成传感器采集、执行器驱动和闭环控制。</p>
      <ul class="learning-list">
        <li>中断、定时器、DMA、看门狗、RTC</li>
        <li>电机驱动：直流电机、步进电机、舵机、无刷电机</li>
        <li>编码器反馈、姿态解算、闭环控制</li>
        <li>PID 控制与参数整定</li>
        <li>FreeRTOS 任务调度与状态机设计</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1134y1C7zP" target="_blank" rel="noopener noreferrer">B站视频：STM32 电机应用控制</a></li>
          <li><a href="https://www.bilibili.com/video/BV13x411E7Ac" target="_blank" rel="noopener noreferrer">B站视频：FreeRTOS 教程</a></li>
          <li><a href="https://www.freertos.org/" target="_blank" rel="noopener noreferrer">官方文档：FreeRTOS</a></li>
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
      <p class="learning-kicker">阶段三 · ROS 上位机协同</p>
      <h2>让下位机与上位机组成完整智能系统</h2>
      <p class="learning-goal">目标：掌握串口 / CAN / 网络通信，让底层控制与 ROS 节点协同工作。</p>
      <ul class="learning-list">
        <li>ROS1 / ROS2 基础节点开发与通信机制</li>
        <li>串口、CAN、WiFi、以太网通信协议设计</li>
        <li>上下位机数据交互：传感器上传、动作指令下发</li>
        <li>ROS 中控制算法与任务状态机实现</li>
        <li>MoveIt! 机械臂控制与多模块协同</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://docs.ros.org/en/rolling/index.html" target="_blank" rel="noopener noreferrer">官方文档：ROS2 Docs</a></li>
          <li><a href="https://www.bilibili.com/video/BV1AudeB6Ebv/" target="_blank" rel="noopener noreferrer">B站视频：ROS2 入门教程</a></li>
          <li><a href="https://moveit.picknik.ai/main/index.html" target="_blank" rel="noopener noreferrer">官方文档：MoveIt 2 Docs</a></li>
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
      <p class="learning-kicker">阶段四 · 系统项目实践</p>
      <h2>在智能车、无人机、机器人中完成闭环落地</h2>
      <p class="learning-goal">目标：把嵌入式底层和 ROS 上位机整合成可运行的完整系统。</p>
      <ul class="learning-list">
        <li>智能车：寻迹、避障、机械臂夹取、任务规划</li>
        <li>无人机：飞控、姿态控制、MAVROS 上位机通信</li>
        <li>机器人：机械臂控制、底盘协同、轨迹执行</li>
        <li>多模块任务调度与系统联调</li>
        <li>传感器融合与实时反馈闭环</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">练习项目</p>
        <ul class="learning-resource-list">
          <li>智能车：下位机循迹 + 上位机任务规划</li>
          <li>无人机：飞控姿态稳定 + ROS 地面站监控</li>
          <li>机器人：ROS 机械臂控制 + 末端执行器联动</li>
        </ul>
      </div>
    </div>
  </article>

</section>