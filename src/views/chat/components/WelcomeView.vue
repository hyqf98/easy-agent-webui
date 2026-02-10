<template>
  <div class="welcome-wrapper">
    <div class="welcome-content">
      <h1 class="welcome-title">Easy Agent</h1>
      <p class="welcome-description">智能生成 PPT、文档、网页等多种报告，提供专业问答服务</p>
      <slot />
    </div>
  </div>
</template>

<script setup>
// 欢迎页面组件 - 无额外逻辑
</script>

<style scoped>
.welcome-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex: 1;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  width: 100%;
}

/* 标题和说明文字区域 */
.welcome-content > :not(.input-area) {
  max-width: 42rem;
  padding: 0 1.5rem;
}

/* 确保 InputArea 容器宽度正确 */
.welcome-content :deep(.input-area) {
  width: 100%;
  padding: 0;
}

.welcome-content :deep(.input-container) {
  max-width: 42rem !important;
  margin: 0 auto !important;
}

.welcome-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  font-family: var(--font-serif, 'Noto Serif SC', serif);
}

.welcome-description {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
  line-height: 1.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 2rem;
  }

  .welcome-description {
    font-size: 0.875rem;
  }

  .welcome-content {
    gap: 1.25rem;
  }
}
</style>
