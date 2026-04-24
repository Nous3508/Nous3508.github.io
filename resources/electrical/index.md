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
    电控组走的是电子信息 + 自动控制方向，核心是嵌入式软硬件开发 + ROS 上位机协同的完整技术链条。
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
    <strong>底层实时控制 + 高层智能决策闭环</strong>
  </div>
</section>

<section class="container learning-timeline">

  <article class="learning-timeline-item" data-aos="fade-up">
    <div class="learning-step">
      <span class="learning-step-number">01</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">阶段一 · C 语言入门</p>
      <h2>��把编程基础打牢，再进入单片机</h2>
      <p class="learning-goal">目标：能用 C 语言写出基本程序，理解变量、控制流、函数、数组等核心概念。</p>
      <ul class="learning-list">
        <li>3~7 天快速过一遍 C 语言语法</li>
        <li>重点掌握：变量、分支、循环、函数、数组</li>
        <li>先用菜鸟教程把语法跑通</li>
        <li>建议直接搭建 VS Code + gcc 编程环境</li>
        <li>如果图省事，也可以先用 Visual Studio 过渡</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.runoob.com/cprogramming/c-tutorial.html" target="_blank" rel="noopener noreferrer">菜鸟教程：C 语言教程</a></li>
          <li><a href="https://www.bilibili.com/video/BV112z3YUEmU/" target="_blank" rel="noopener noreferrer">B站视频：C 语言环境设置 + VS Code</a></li>
          <li><a href="https://www.bilibili.com/video/BV1BxeRzXEPu/" target="_blank" rel="noopener noreferrer">B站视频：VS Code 配置 C/C++ 环境</a></li>
          <li><a href="https://www.zhihu.com/question/410458353" target="_blank" rel="noopener noreferrer">知乎：Code Runner 插件推荐</a></li>
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
      <p class="learning-kicker">阶段二 · 51 单片机过渡</p>
      <h2>先从 51 入门，再过渡到 STM32</h2>
      <p class="learning-goal">目标：初步理解 GPIO、中断、定时器、串口这些单片机最核心的底层概念。</p>
      <ul class="learning-list">
        <li>如果不想过渡，也可以直接进 STM32</li>
        <li>但建议先用 51 建立“单片机是什么”的直观认知</li>
        <li>掌握 IO 输入输出���中断、定时器、串口</li>
        <li>熟悉 Keil 的安装与基本调试</li>
        <li>学会用最小系统板完成基础实验</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1MJ411A7cV/" target="_blank" rel="noopener noreferrer">B站视频：51 单片机入门教程（江协科技）</a></li>
          <li><a href="https://jiangxiekeji.com/index.html" target="_blank" rel="noopener noreferrer">江协科技官网</a></li>
          <li><a href="https://space.bilibili.com/383400717/channel/series" target="_blank" rel="noopener noreferrer">江协科技 B站专辑</a></li>
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
      <p class="learning-kicker">阶段三 · STM32 单片机入门</p>
      <h2>进入现代单片机开发主战场</h2>
      <p class="learning-goal">目标：熟悉 STM32 的标准库 / HAL 库开发方式，并能完成外设驱动与基础项目。</p>
      <ul class="learning-list">
        <li>STM32 是 32 位单片机，外设更多、功能更强</li>
        <li>标准库：更接近底层，利于理解原理</li>
        <li>HAL 库：官方主推，配合 CubeMX 图形化配置方便</li>
        <li>先掌握 GPIO、EXTI、TIM、USART、ADC、PWM</li>
        <li>后续再学习结构体、指针、枚举、回调函数等进阶内容</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1GztDe4En7/" target="_blank" rel="noopener noreferrer">B站视频：STM32 入门教程（江协科技）</a></li>
          <li><a href="https://www.bilibili.com/video/BV1vt4y1k7DV" target="_blank" rel="noopener noreferrer">B站视频：STM32 HAL 库开发</a></li>
          <li><a href="https://www.bilibili.com/video/BV1fM411Z7cW/" target="_blank" rel="noopener noreferrer">B站视频：嘉立创EDA PCB 设计课程（可辅助硬件开发）</a></li>
          <li><a href="https://www.st.com/content/st_com/en/support/learning/stm32-education.html" target="_blank" rel="noopener noreferrer">官方文档：ST STM32 Education</a></li>
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
      <p class="learning-kicker">阶段四 · 硬件电路设计</p>
      <h2>学会把芯片和外围模块连成系统</h2>
      <p class="learning-goal">目标：能看懂并搭建基础外围电路，逐步具备简单 PCB 设计能力。</p>
      <ul class="learning-list">
        <li>面包板、洞洞板、PCB 三种搭建方式</li>
        <li>理解最小系统板、开发板、独立芯片的区别</li>
        <li>学会用杜邦线、跳线、锡线完成系统连接</li>
        <li>掌握嘉立创 EDA 的原理图和 PCB 流程</li>
        <li>后续再补充模拟电路、数字电路与硬件工程基础</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1w8Q6B2E9k/" target="_blank" rel="noopener noreferrer">B站视频：嘉立创 EDA 原理图到 PCB 全流程实战</a></li>
          <li><a href="https://www.bilibili.com/video/BV1At421h7Ui/" target="_blank" rel="noopener noreferrer">B站视频：零基础入门 PCB 设计</a></li>
          <li><a href="https://www.bilibili.com/video/BV1fFAfeZEBE/" target="_blank" rel="noopener noreferrer">B站视频：零基础入门 PCB 设���（大师篇）</a></li>
          <li><a href="https://www.bilibili.com/video/BV1wsCrB8ES8/" target="_blank" rel="noopener noreferrer">B站视频：嘉立创 EDA 专业版 PCB 设计 100 讲</a></li>
        </ul>
      </div>
    </div>
  </article>

  <article class="learning-timeline-item" data-aos="fade-up" data-aos-delay="320">
    <div class="learning-step">
      <span class="learning-step-number">05</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">阶段五 · ROS 上位机协同</p>
      <h2>把底层控制和上层智能系统接起来</h2>
      <p class="learning-goal">目标：实现 STM32 / ESP32 与 ROS1/ROS2 的通信和协同控制。</p>
      <ul class="learning-list">
        <li>串口 / CAN / 以太网 / WiFi 通信设计</li>
        <li>上位机节点开发、多模块通信、任务调度</li>
        <li>ROS 中控制算法与控制状态机实现</li>
        <li>MoveIt! 机械臂控制与路径规划</li>
        <li>与视觉、导航、机械臂等模块协同</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://docs.ros.org/en/rolling/index.html" target="_blank" rel="noopener noreferrer">官方文档：ROS2 Docs</a></li>
          <li><a href="https://moveit.picknik.ai/main/index.html" target="_blank" rel="noopener noreferrer">官方文档：MoveIt 2 Docs</a></li>
          <li><a href="https://www.bilibili.com/video/BV1AudeB6Ebv/" target="_blank" rel="noopener noreferrer">B站视频：ROS2 零基础入门</a></li>
          <li><a href="https://www.bilibili.com/video/BV1zt411G7Vn/" target="_blank" rel="noopener noreferrer">B站视频：古月居 ROS 入门21讲</a></li>
        </ul>
      </div>
    </div>
  </article>

  <article class="learning-timeline-item" data-aos="fade-up" data-aos-delay="400">
    <div class="learning-step">
      <span class="learning-step-number">06</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">阶段六 · 项目实践</p>
      <h2>在真实系统里完成闭环</h2>
      <p class="learning-goal">目标：做出能稳定运行的智能车、无人机或机器人系统。</p>
      <ul class="learning-list">
        <li>智能车：寻迹、避障、机械臂夹取、任务规划</li>
        <li>无人机：姿态控制、飞控、MAVROS 通信</li>
        <li>机器人：机械臂控制、底盘协同、轨迹执行</li>
        <li>多模块系统联调与任务状态机设计</li>
        <li>传感器融合与实时反馈闭环</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">练习项目</p>
        <ul class="learning-resource-list">
          <li>智能车：下位机寻迹 + 上位机任务规划</li>
          <li>无人机：飞控姿态稳定 + ROS 地面站监控</li>
          <li>机器人：ROS 机械臂控制 + 末端执行器联动</li>
        </ul>
      </div>
    </div>
  </article>

</section>