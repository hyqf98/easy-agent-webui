<template>
  <div class="single-column-layout">
    <slot />
  </div>
</template>

<script setup>
/**
 * 单列布局组件
 *
 * <p>用于 Chat 模式，提供单列消息展示布局。</p>
 *
 * <h3>布局结构</h3>
 * <pre>
 * ┌─────────────────────────────────────┐
 * │  会话列表 │     消息内容区域          │
 * │           ├─────────────────────────┤
 * │           │ 用户消息                │
 * │           │ 思考过程                │
 * │           │ 工具调用                │
 * │           │ AI 响应                 │
 * │           ├─────────────────────────┤
 * │           │ 输入框                  │
 * └─────────────────────────────────────┘
 * </pre>
 *
 * @author easy-agent
 * @since 1.0.0
 */
</script>

<style scoped>
.single-column-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.single-column-layout :deep(.messages-container) {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.single-column-layout :deep(.message) {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
</style>
