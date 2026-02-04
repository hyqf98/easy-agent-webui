<template>
  <div class="final-answer-view message-fade-in">
    <!-- AI 头像 -->
    <div class="ai-avatar">
      <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L14 6L10 10L6 6L10 2Z" fill="currentColor"/>
        <path d="M10 18L14 14L10 10L6 14L10 18Z" fill="currentColor"/>
        <path d="M2 10L6 6L10 10L6 14L2 10Z" fill="currentColor" opacity="0.6"/>
        <path d="M18 10L14 6L10 10L14 14L18 10Z" fill="currentColor" opacity="0.6"/>
      </svg>
    </div>

    <!-- 消息内容 -->
    <div class="ai-content-wrapper">
      <div class="ai-content">
        <!-- 使用 Typewriter 组件实现打字机效果（启用 markdown 渲染） -->
        <Typewriter
          v-if="content"
          :content="content"
          :typing="isStreaming ? { step: 1, interval: 30 } : false"
          :is-markdown="true"
          class="markdown-content"
        />
        <!-- 空状态占位符 -->
        <div v-else class="empty-placeholder">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
      </div>
      <!-- 消息元数据 -->
      <div class="message-meta">
        <span class="message-time">{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Typewriter } from 'vue-element-plus-x'

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

const currentTime = ref('')

// 获取当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
})
</script>

<style scoped>
.final-answer-view {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

/* AI 头像 - 独立容器 */
.ai-avatar {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-light);
  color: var(--accent-primary);
  border-radius: var(--radius-md);
}

/* 内容包装器 */
.ai-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

/* AI 内容容器 - 独立背景 */
.ai-content {
  background: var(--msg-ai-bg);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-xl) var(--radius-2xl) var(--radius-xl) var(--radius-xs);
  box-shadow: var(--shadow-sm);
  max-width: 37.5rem; /* 600px → 37.5rem */
  width: fit-content;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

/* Markdown 内容样式 */
.markdown-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-primary);
  max-width: 100%;
}

.markdown-content :deep(p) {
  margin: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-content :deep(h1) { font-size: 1.5rem; }
.markdown-content :deep(h2) { font-size: 1.25rem; }
.markdown-content :deep(h3) { font-size: 1.125rem; }

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.06);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--accent-primary);
  padding-left: 0.75rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
}

.markdown-content :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.375rem 0.5rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background: rgba(0, 0, 0, 0.03);
  font-weight: 600;
}

/* 空状态占位符 */
.empty-placeholder {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0;
}

.empty-placeholder .loading-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--accent-primary);
  animation: loadingPulse 1.4s ease-in-out infinite;
}

.empty-placeholder .loading-dot:nth-child(1) { animation-delay: 0s; }
.empty-placeholder .loading-dot:nth-child(2) { animation-delay: 0.2s; }
.empty-placeholder .loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes loadingPulse {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 消息元数据 */
.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.message-time {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

/* 淡入动画 */
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
