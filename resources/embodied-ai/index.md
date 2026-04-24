---
layout: default
title: 具身智能方向
description: "ROS2、MoveIt、机器人与具身智能学习资料"
permalink: /resources/embodied-ai/
---
<section class="container page-hero" data-aos="fade-up">
  <p class="eyebrow">Learning Path</p>
  <h1>具身智能方向 🤖</h1>
  <p class="lead">
    面向实战的工程路线图：基础学习 → 工程实践 → 理论深化 → 工程落地。
  </p>
</section>

<section class="container learning-progress-note" data-aos="fade-up" data-aos-delay="60">
  <div class="learning-note-item">
    <span>方向定位</span>
    <strong>机器人学 + ROS2 + MoveIt + 具身智能</strong>
  </div>
  <div class="learning-note-item">
    <span>核心工具</span>
    <strong>ROS2 · MoveIt!2 · RViz · Gazebo · LeRobot</strong>
  </div>
  <div class="learning-note-item">
    <span>最终目标</span>
    <strong>让机器人具备可规划、可学习、可落地的智能能力</strong>
  </div>
</section>

<section class="container learning-timeline">

  <article class="learning-timeline-item" data-aos="fade-up">
    <div class="learning-step">
      <span class="learning-step-number">01</span>
      <span class="learning-step-line"></span>
    </div>
    <div class="learning-card">
      <p class="learning-kicker">阶段一 · 理论与编程基础</p>
      <h2>先掌握机器人学的数学语言和实现工具</h2>
      <p class="learning-goal">目标：理解机器人位姿、运动关系与基础编程实现，为后续系统开发打地基。</p>
      <ul class="learning-list">
        <li>机器人学基础概念</li>
        <li>运动学 / 动力学基础</li>
        <li>C++17 编程基础</li>
        <li>MATLAB / 数值计算工具</li>
        <li>坐标变换、旋转矩阵、四元数</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1C7411K7HP/" target="_blank" rel="noopener noreferrer">B站视频：工业机器人技术基础</a></li>
          <li><a href="https://www.bilibili.com/video/BV1gL4y177s4/" target="_blank" rel="noopener noreferrer">B站视频：Robotics 机器人学合集</a></li>
          <li><a href="https://docs.ros.org/en/rolling/index.html" target="_blank" rel="noopener noreferrer">官方文档：ROS2 Docs</a></li>
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
      <p class="learning-kicker">阶段二 · ROS2 + MoveIt!2 架构</p>
      <h2>搭建机器人操作系统与规划大脑</h2>
      <p class="learning-goal">目标：能让机械臂在仿真或实物中稳健地“动起来”，建立标准化通信与规划框架。</p>
      <ul class="learning-list">
        <li>ROS2 节点、话题、服务、动作通信</li>
        <li>URDF / Xacro 模型描述</li>
        <li>TF2 坐标变换与状态广播</li>
        <li>MoveIt!2 轨迹规划、碰撞检测、轨迹平滑</li>
        <li>传感器集成与分布式通信</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1AudeB6Ebv/" target="_blank" rel="noopener noreferrer">B站视频：ROS2 零基础入门</a></li>
          <li><a href="https://www.bilibili.com/video/BV1zt411G7Vn/" target="_blank" rel="noopener noreferrer">B站视频：古月居 ROS 入门21讲</a></li>
          <li><a href="https://moveit.picknik.ai/main/index.html" target="_blank" rel="noopener noreferrer">官方文档：MoveIt 2 Docs</a></li>
          <li><a href="https://moveit.github.io/moveit_tutorials/" target="_blank" rel="noopener noreferrer">官方文档：MoveIt Tutorials</a></li>
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
      <p class="learning-kicker">阶段三 · 实践反哺理论</p>
      <h2>带着问题回头补理论</h2>
      <p class="learning-goal">目标：遇到逆运动学不收敛、动作变形或轨迹异常时，能追溯到数学与控制层面解决问题。</p>
      <ul class="learning-list">
        <li>逆运动学收敛与奇异性分析</li>
        <li>雅可比矩阵与速度映射</li>
        <li>动力学补偿与控制问题排查</li>
        <li>轨迹规划失败原因定位</li>
        <li>仿真环境中的调试与验证</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://www.bilibili.com/video/BV1BP4y1o7pw/" target="_blank" rel="noopener noreferrer">B站视频：ROS 快速入门教程</a></li>
          <li><a href="https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/Using-URDF-with-robot-state-publisher.html" target="_blank" rel="noopener noreferrer">官方文档：URDF / robot_state_publisher</a></li>
          <li><a href="https://www.bilibili.com/video/BV1rC4y1H7AU/" target="_blank" rel="noopener noreferrer">B站视频：ABB 机器人官方入门到精通</a></li>
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
      <p class="learning-kicker">阶段四 · 具身智能工程落地</p>
      <h2>从规则系统走向数据驱动与自主学习</h2>
      <p class="learning-goal">目标：在真实项目中完成“规则控制 + 数据学习”的工程闭环。</p>
      <ul class="learning-list">
        <li>LeRobot、Isaac Sim 等具身智能工具链</li>
        <li>模仿学习（IL）与强化学习（RL）基础</li>
        <li>仿真到现实（Sim2Real）思路</li>
        <li>感知、规划、执行的一体化系统</li>
        <li>广东省农科院等项目需求导向的工程落地</li>
      </ul>
      <div class="learning-resource-block">
        <p class="learning-resource-title">学习资料</p>
        <ul class="learning-resource-list">
          <li><a href="https://github.com/ros-wg-embodied-ai" target="_blank" rel="noopener noreferrer">官方/社区：ROS Embodied AI Community</a></li>
          <li><a href="https://docs.universal-robots.com/Universal_Robots_ROS_Documentation/doc/ur_tutorials/tutorial_index.html" target="_blank" rel="noopener noreferrer">官方：Universal Robots ROS Tutorials</a></li>
          <li><a href="https://www.bilibili.com/video/BV1FDSqYMEJY/" target="_blank" rel="noopener noreferrer">B站视频：12步搭建智能机器人</a></li>
        </ul>
      </div>
    </div>
  </article>

</section>