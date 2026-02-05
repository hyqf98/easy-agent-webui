<template>
  <div class="message-item" :class="messageClass">
    <!-- 用户消息 -->
    <div v-if="message.type === 'user'" class="user-message">
      <div class="message-bubble user-bubble">
        {{ message.content }}
      </div>
      <div class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>

    <!-- 思考消息 -->
    <ThinkingView
      v-else-if="message.type === 'thinking'"
      :content="message.content"
      :is-streaming="message.status === 'streaming'"
    />

    <!-- 工具思考消息 -->
    <ToolThoughtView
      v-else-if="message.type === 'tool_through'"
      :content="message.content"
      :is-streaming="message.status === 'streaming'"
    />

    <!-- 最终答案 -->
    <FinalAnswerView
      v-else-if="message.type === 'final_answer' || message.type === 'content_chunk'"
      :content="message.content"
      :is-streaming="message.status === 'streaming'"
    />

    <!-- 工具调用 -->
    <ToolCallView
      v-else-if="message.type === 'tool_call'"
      :tool-call="message.content"
    />

    <!-- 错误消息 -->
    <div v-else-if="message.type === 'error'" class="error-message">
      <div class="error-content">
        <div class="error-header">
          <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6V10M10 14V14.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>出错了</span>
        </div>
        <div class="error-text">{{ message.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ThinkingView from './ThinkingView.vue'
import ToolThoughtView from './ToolThoughtView.vue'
import FinalAnswerView from './FinalAnswerView.vue'
import ToolCallView from './ToolCallView.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const messageClass = computed(() => {
  return `message-${props.message.type}`
})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.message-item {
  width: 100%;
  display: flex;
  animation: fadeInUp 0.35s cubic-bezier(0.2, 0, 0.2, 1);
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

/* 用户消息 */
.user-message {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
}

.message-bubble {
  max-width: 70%;
  min-width: 4rem;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: var(--shadow-sm);
}

.user-bubble {
  background: var(--msg-user-bg);
  color: var(--msg-user-text);
  border-radius: var(--radius-2xl) var(--radius-xs) var(--radius-xl) var(--radius-2xl);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem;
}

.message-time {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

/* 错误消息 */
.error-message {
  width: 100%;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.125rem;
  background: linear-gradient(135deg, rgba(196, 120, 106, 0.08) 0%, rgba(196, 120, 106, 0.04) 100%);
  border: 1px solid rgba(196, 120, 106, 0.2);
  border-radius: var(--radius-xl);
  max-width: 75%;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-error);
  font-size: 0.8125rem;
  font-weight: 600;
}

.error-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
