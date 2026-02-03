<template>
  <div class="tool-thought-view message-fade-in">
    <div class="tool-thought-header">
      <span class="tool-thought-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L11 5L15 4.5L13.5 8L17 9.5L13.5 11L15 14.5L11 14L9 17L7 14L3 14.5L4.5 11L1 9.5L4.5 8L3 4.5L7 5L9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="tool-thought-label">工具推理</span>
    </div>
    <div v-if="content" class="tool-thought-content">
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
.tool-thought-view {
  background: var(--tool-thought-bg);
  border-radius: var(--radius-xl);
  padding: 0.875rem 1.125rem;
  max-width: 75%;
  box-shadow: var(--shadow-xs);
}

.tool-thought-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}

.tool-thought-header:empty {
  margin-bottom: 0;
}

.tool-thought-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-md);
}

.tool-thought-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tool-thought-content {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  font-family: 'Fira Code', 'Consolas', monospace;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
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
