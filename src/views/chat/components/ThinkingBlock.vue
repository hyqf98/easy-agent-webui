<template>
  <div class="thinking-block">
    <button
      class="thinking-header"
      @click="isExpanded = !isExpanded"
      :aria-expanded="isExpanded"
      aria-label="切换思考过程显示"
    >
      <div class="thinking-icon">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2C8 5 5 7 5 10C5 13 7 15 10 18C13 15 15 13 15 10C15 7 12 5 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="10" cy="10" r="2" fill="currentColor"/>
        </svg>
      </div>
      <span class="thinking-label">思考过程</span>
      <el-icon class="expand-icon" :size="16">
        <ArrowDown v-if="!isExpanded" />
        <ArrowUp v-else />
      </el-icon>
    </button>

    <Transition name="thinking-expand">
      <div v-if="isExpanded" class="thinking-content">
        <div class="thinking-text">{{ content }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  }
})

const isExpanded = ref(props.defaultExpanded)
</script>

<style scoped>
/* Hand-Drawn Sketch Style */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=ZCOOL+XiaoWei&family=Patrick+Hand&display=swap');

:root {
  --paper-base: #FAF7F0;
  --paper-warm: #F5F0E6;
  --ink-dark: #2C2C2C;
  --ink-medium: #4A4A4A;
  --ink-light: #6B6B6B;
  --ink-faint: #999999;
  --pencil-blue: #5B7A8C;
  --pencil-orange: #C4875B;
  --pencil-green: #7A9B6E;
  --highlight-blue: rgba(180, 210, 255, 0.35);
  --highlight-green: rgba(180, 220, 150, 0.35);
  --border-thin: 1.5px;
  --border-sketch: 2px;
  --shadow-pencil: 2px 2px 0 rgba(0, 0, 0, 0.08);
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --ease-sketch: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Typography */
  --font-primary: 'Noto Serif SC', 'Songti SC', serif;
  --font-display: 'ZCOOL XiaoWei', serif;
  --font-hand: 'Patrick Hand', cursive;
  --text-xs: 11px;
  --text-sm: 12px;
  --text-md: 14px;
  --text-lg: 15px;
}

/* Pencil sketch animation for thinking icon */
@keyframes pencil-sketch {
  0%, 100% {
    transform: rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: rotate(-5deg);
    opacity: 1;
  }
  75% {
    transform: rotate(5deg);
    opacity: 0.9;
  }
}

.thinking-block {
  margin-bottom: var(--space-lg);
  border: var(--border-sketch) solid var(--pencil-blue);
  border-radius: 8px;
  overflow: hidden;
  background: var(--highlight-blue);
  transition: all var(--duration-normal) var(--ease-sketch);
  font-family: 'Noto Sans Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  transform: rotate(-0.3deg);
  box-shadow: var(--shadow-pencil);
  position: relative;
  /* 固定宽度，确保收起和展开状态一致 */
  width: 300px;
  max-width: 300px;
}

/* Sketchy doodle decoration */
.thinking-block::before {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: var(--border-thin) solid var(--pencil-blue);
  border-radius: 50%;
  opacity: 0.2;
  clip-path: polygon(
    0 30%, 15% 20%, 30% 25%, 45% 15%, 60% 20%, 75% 10%, 90% 15%, 100% 25%,
    100% 70%, 90% 80%, 75% 75%, 60% 85%, 45% 80%, 30% 90%, 15% 85%, 0 75%
  );
}

.thinking-block:hover {
  border-color: var(--pencil-green);
  background: var(--highlight-green);
  transform: rotate(0deg) scale(1.01);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.thinking-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-sketch);
  font-family: var(--font-hand);
  position: relative;
  z-index: 1;
}

.thinking-header:hover {
  background: rgba(255, 255, 255, 0.3);
}

.thinking-header:focus-visible {
  outline: var(--border-sketch) solid var(--pencil-blue);
  outline-offset: 2px;
  border-radius: 4px;
}

.thinking-icon {
  width: 26px;
  height: 26px;
  color: var(--pencil-blue);
  flex-shrink: 0;
  transition: transform var(--duration-normal) var(--ease-sketch);
}

.thinking-header:hover .thinking-icon {
  transform: rotate(-10deg) scale(1.1);
}

.thinking-icon svg {
  animation: pencil-sketch 3s ease-in-out infinite;
}

.thinking-label {
  flex: 1;
  font-size: var(--text-md);
  font-weight: 400;
  color: var(--ink-dark);
  text-align: left;
}

.expand-icon {
  color: var(--ink-medium);
  transition: transform var(--duration-fast) var(--ease-sketch);
}

.thinking-content {
  padding: 0 var(--space-md) var(--space-md);
  border-top: var(--border-thin) dashed var(--pencil-blue);
  background: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  /* 50行文字大约 800px 高度 */
  max-height: 800px;
  overflow: auto;
  /* 固定宽度，超出时横向滚动 */
  width: 300px;
  max-width: 300px;
}

.thinking-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.thinking-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.thinking-content::-webkit-scrollbar-thumb {
  background: var(--pencil-blue);
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background-clip: padding-box;
}

.thinking-content::-webkit-scrollbar-thumb:hover {
  background: #4A6B7C;
}

.thinking-text {
  font-size: var(--text-md);
  line-height: 1.8;
  color: var(--ink-dark);
  font-family: 'Noto Sans Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-weight: 400;
  white-space: pre-wrap;
  word-break: break-word;
  padding-top: var(--space-sm);
}

/* Smooth Transition */
.thinking-expand-enter-active,
.thinking-expand-leave-active {
  transition: all var(--duration-normal) var(--ease-sketch);
  overflow: hidden;
}

.thinking-expand-enter-from,
.thinking-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.thinking-expand-enter-to,
.thinking-expand-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .thinking-expand-enter-active,
  .thinking-expand-leave-active,
  .thinking-icon svg {
    transition: none;
    animation: none;
  }
}
</style>
