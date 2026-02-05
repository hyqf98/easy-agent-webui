<template>
  <div class="tool-thought-view message-fade-in">
    <!-- 可折叠的推理内容 -->
    <div class="thought-container">
      <!-- 头部：图标 + 标签 + 收起/展开按钮 -->
      <div class="thought-header" @click="toggleExpanded">
        <span class="thought-icon" :class="{ spinning: isStreaming }">
          <svg width="0.875rem" height="0.875rem" viewBox="0 0 18 18" fill="none" :class="{ 'gear-spin': isStreaming }">
            <path d="M9 2L11 5L15 4.5L13.5 8L17 9.5L13.5 11L15 14.5L11 14L9 17L7 14L3 14.5L4.5 11L1 9.5L4.5 8L3 4.5L7 5L9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="thought-label">工具推理</span>
        <div class="thought-toggle" :class="{ expanded: isExpanded }">
          <svg width="0.75rem" height="0.75rem" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 可折叠的内容 -->
      <transition name="thought-collapse">
        <div v-if="isExpanded" class="thought-content">
          {{ content }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

// 默认收起状态
const isExpanded = ref(false)

// 切换展开/收起
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.tool-thought-view {
  width: 100%;
}

.thought-container {
  /* 与 FinalAnswerView 的内容区域左对齐 */
  /* 2rem (头像宽度) + 0.75rem (gap) = 2.75rem */
  margin-left: 2.75rem;
  width: fit-content;
  max-width: calc(100% - 2.75rem);
}

/* 头部 */
.thought-header {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  user-select: none;
  padding: 0.375rem 0.625rem;
  background: var(--tool-thought-bg, rgba(0, 0, 0, 0.04));
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.thought-header:hover {
  background: rgba(0, 0, 0, 0.06);
}

.thought-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--accent-primary);
}

/* 齿轮转动动画 - 仅在流式状态时旋转 */
.thought-icon.spinning .gear-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.thought-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 收起/展开按钮 - 旋转动画 */
.thought-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s;
}

.thought-toggle.expanded {
  transform: rotate(180deg);
}

.thought-header:hover .thought-toggle {
  color: var(--text-secondary);
}

/* 内容区域 */
.thought-content {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  font-family: 'Fira Code', 'Consolas', monospace;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-md);
  max-width: 37.5rem; /* 600px → 37.5rem */
  width: fit-content;
}

/* 折叠动画 */
.thought-collapse-enter-active,
.thought-collapse-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.thought-collapse-enter-from,
.thought-collapse-leave-to {
  opacity: 0;
  transform: scaleY(0);
  max-height: 0;
  margin-top: 0;
}

.thought-collapse-enter-to,
.thought-collapse-leave-from {
  opacity: 1;
  transform: scaleY(1);
  max-height: 500px;
}

/* 淡入动画 */
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
  animation: fadeInUp 0.3s cubic-bezier(0.2, 0, 0.2, 1);
}
</style>
