<template>
  <div class="final-answer-view message-fade-in">
    <div class="message-bubble ai-bubble">
      <!-- AI 头像 -->
      <div class="ai-avatar">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L14 6L10 10L6 6L10 2Z" fill="currentColor"/>
          <path d="M10 18L14 14L10 10L6 14L10 18Z" fill="currentColor"/>
          <path d="M2 10L6 6L10 10L6 14L2 10Z" fill="currentColor" opacity="0.6"/>
          <path d="M18 10L14 6L10 10L14 14L18 10Z" fill="currentColor" opacity="0.6"/>
        </svg>
      </div>

      <!-- 消息内容 -->
      <div class="ai-content">
        <XMarkdown
          v-if="content && !isStreaming"
          :source="content"
          class="markdown-content"
        />
        <div v-else-if="isStreaming" class="streaming-content">
          <XMarkdown
            :source="displayContent"
            class="markdown-content"
          />
          <span class="typewriter-cursor"></span>
        </div>
        <div v-else class="empty-placeholder">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
      </div>
    </div>

    <!-- 消息元数据 -->
    <div class="message-meta">
      <span class="message-time">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { XMarkdown } from 'vue-element-plus-x'

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

const displayContent = ref('')
const currentTime = ref('')

// 获取当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 打字机效果
watch(() => props.content, (newContent) => {
  if (props.isStreaming && newContent) {
    displayContent.value = newContent
  } else if (!props.isStreaming) {
    displayContent.value = newContent
  }
}, { immediate: true })

onMounted(() => {
  displayContent.value = props.content || ''
  updateTime()
})
</script>

<style scoped>
.final-answer-view {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.message-bubble {
  display: flex;
  gap: 0.75rem;
  max-width: 85%;
  box-shadow: var(--shadow-sm);
}

.ai-bubble {
  background: var(--msg-ai-bg);
  padding: 0;
  border-radius: var(--radius-xl) var(--radius-2xl) var(--radius-xl) var(--radius-xs);
  overflow: hidden;
}

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
  margin-top: 0.5rem;
  margin-left: 0.875rem;
}

.ai-content {
  flex: 1;
  padding: 0.75rem 1rem 0.875rem 0;
  min-width: 0;
}

.markdown-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.markdown-content :deep(p) {
  margin: 0.4em 0;
}

.markdown-content :deep(p:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(code) {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-xs);
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.85em;
  color: var(--accent-primary);
}

.markdown-content :deep(pre) {
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0.6em 0;
  border: 1px solid var(--border-subtle);
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: var(--text-primary);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.25em;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

.markdown-content :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: var(--accent-primary);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 0.75em 0 0.5em;
  font-weight: 600;
}

.markdown-content :deep(h1) { font-size: 1.25em; }
.markdown-content :deep(h2) { font-size: 1.125em; }
.markdown-content :deep(h3) { font-size: 1em; }

.markdown-content :deep(blockquote) {
  margin: 0.75em 0;
  padding-left: 0.75rem;
  border-left: 3px solid var(--accent-primary);
  color: var(--text-secondary);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.5rem;
  border: 1px solid var(--border-subtle);
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

/* 流式输出容器 */
.streaming-content {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
}

/* 打字机光标 */
@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.typewriter-cursor {
  display: inline-block;
  width: 0.125rem;
  height: 1.1em;
  background: var(--accent-primary);
  margin-left: 0.0625rem;
  animation: blink 1s step-end infinite;
  flex-shrink: 0;
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
  padding: 0 3rem;
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
