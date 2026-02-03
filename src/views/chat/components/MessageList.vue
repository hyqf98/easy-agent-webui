<template>
  <div ref="messagesContainer" class="message-list" @scroll="handleScroll">
    <div class="message-list-content">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />

      <!-- 加载中提示 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <span class="loading-text">思考中...</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.3"/>
          <path d="M24 32L30 38L40 26" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
        </svg>
      </div>
      <div class="empty-title">开始一段新对话</div>
      <div class="empty-desc">在下方输入框中输入您的问题</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageItem from './MessageItem.vue'

const chatStore = useChatStore()
const messagesContainer = ref(null)
const isUserScrolling = ref(false)

const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)

// 自动滚动到底部
const scrollToBottom = (force = false) => {
  if (force || !isUserScrolling.value) {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  }
}

// 处理滚动事件
const handleScroll = () => {
  if (!messagesContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
  isUserScrolling.value = !isNearBottom
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 监听加载状态
watch(isLoading, (loading) => {
  if (loading) {
    scrollToBottom(true)
  }
})

// 暴露方法给父组件
defineExpose({
  scrollToBottom: () => scrollToBottom(true)
})
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 1rem;
  background: var(--bg-primary);
}

.message-list-content {
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  justify-content: center;
  background: var(--bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  width: fit-content;
  margin: 0 auto;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--accent-primary);
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.loading-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 20rem;
  color: var(--text-tertiary);
}

.empty-icon {
  margin-bottom: 1rem;
  color: var(--accent-primary);
  opacity: 0.6;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}
</style>
