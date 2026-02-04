<template>
  <div class="thinking-view message-fade-in">
    <div class="thinking-header">
      <span class="thinking-icon">
        <svg width="1.125rem" height="1.125rem" viewBox="0 0 18 18" fill="none" class="thinking-icon-pulse">
          <path d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C12.87 16 16 12.87 16 9C16 5.13 12.87 2 9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9 6V9L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="thinking-label">思考中</span>
    </div>
    <div v-if="content" class="thinking-content">
      {{ content }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.thinking-view {
  /* 与 FinalAnswerView 的内容区域左对齐 */
  /* 2rem (头像宽度) + 0.75rem (gap) = 2.75rem */
  margin-left: 2.75rem;
  background: var(--thinking-bg);
  border-radius: var(--radius-xl);
  padding: 0.875rem 1.125rem;
  max-width: calc(100% - 2.75rem);
  box-shadow: var(--shadow-xs);
  width: fit-content;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}

.thinking-header:empty {
  margin-bottom: 0;
}

.thinking-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
}

.thinking-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.thinking-content {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.thinking-icon-pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-fade-in {
  animation: fadeInUp 0.35s cubic-bezier(0.2, 0, 0.2, 1);
}
</style>
