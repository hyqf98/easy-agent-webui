# Easy Agent WebUI

基于 Vue 3 + Vite 的 Agent Skills Marketplace 展示页面。

## 技术栈

- **Vue 3.5.24**: 使用 Composition API + `<script setup>`
- **Vite 7.2.4**: 构建工具

## 项目结构

```
src/
├── App.vue                 # 根组件
├── main.js                 # 应用入口
└── views/
    └── Demo.vue            # Demo 页面（Agent Skills Marketplace）
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 10000)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## Demo 页面功能

Agent Skills Marketplace 展示页面包含：

- 顶部状态指示器和导航栏
- Hero 区域展示核心概念
- 趋势分析图表（SVG）
- 搜索功能（支持回车搜索、ESC 清除）
- 模块卡片网格展示（10 个技能模块）
- 卡片选择交互
- 响应式布局（支持 1200px、900px、600px 断点）
- 浮动回到顶部按钮

## 样式系统

使用 CSS 变量管理主题：

```css
/* 基础色彩 */
--bg-cream: #faf8f5;
--bg-white: #ffffff;
--text-primary: #1a1a2e;
--text-secondary: #4a4a5a;

/* 强调色 */
--accent-blue: #4a90d9;
--accent-purple: #9b7ed8;
--accent-green: #5cb58a;
--accent-orange: #e8a84c;
```
