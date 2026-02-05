<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// App 根组件
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 简约优雅 · 自然暖色主题 CSS 变量 */
:root {
  /* 背景色 - 米色、木色系 */
  --bg-primary: #fdfcf8;
  --bg-secondary: #f7f4ef;
  --bg-tertiary: #f1ede6;
  --bg-elevated: #ffffff;
  --bg-sidebar: #f3f0ea;
  --bg-hover: #e8e4dc;
  --bg-active: #e0dccf;

  /* 文字色 - 温暖深色 */
  --text-primary: #2d2a26;
  --text-secondary: #6b6560;
  --text-tertiary: #9a958e;
  --text-inverse: #ffffff;

  /* 强调色 - 自然绿色系 */
  --accent-primary: #7c9a6d;
  --accent-hover: #6a8549;
  --accent-light: #e8efe3;
  --accent-subtle: #d5dfc8;

  /* 功能色 */
  --color-success: #7c9a6d;
  --color-warning: #d4a574;
  --color-error: #c4786a;
  --color-info: #7c9a6d;

  /* 边框色 */
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-default: rgba(0, 0, 0, 0.1);
  --border-strong: rgba(0, 0, 0, 0.15);

  /* 阴影 - 精致多层次 */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.03);
  --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);

  /* 消息样式 */
  --msg-user-bg: linear-gradient(135deg, #7c9a6d 0%, #6a8549 100%);
  --msg-user-text: #ffffff;
  --msg-ai-bg: #ffffff;
  --msg-ai-text: #2d2a26;
  --thinking-bg: linear-gradient(135deg, #e8efe3 0%, #d5dfc8 100%);
  --tool-thought-bg: linear-gradient(135deg, #e8ecf0 0%, #d5dce5 100%);

  /* 工具调用状态色 */
  --tool-border-calling: #d4a574;
  --tool-border-success: #7c9a6d;
  --tool-border-failed: #c4786a;

  /* 圆角 */
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;

  /* 过渡 */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* 滚动条样式 - 精致纤细 */
::-webkit-scrollbar {
  width: 0.375rem;
  height: 0.375rem;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 0.1875rem;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* 选择文字样式 */
::selection {
  background: var(--accent-subtle);
  color: var(--text-primary);
}

/* ==================== 模型选择器下拉面板全局样式 ==================== */
.model-select-dropdown.el-select-dropdown {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  padding: 0.375rem;
  margin-top: 0.375rem;
  max-height: 300px;
}

.model-select-dropdown .el-select-dropdown__list {
  padding: 0;
}

.model-select-dropdown .el-select-dropdown__item {
  padding: 0.625rem 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: transparent;
  height: auto;
  line-height: 1.5;
}

.model-select-dropdown .el-select-dropdown__item:last-child {
  margin-bottom: 0;
}

.model-select-dropdown .el-select-dropdown__item:hover {
  background: var(--bg-hover);
}

.model-select-dropdown .el-select-dropdown__item.is-selected {
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-weight: 600;
}
</style>
