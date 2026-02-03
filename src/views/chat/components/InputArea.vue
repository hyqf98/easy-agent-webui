<template>
  <div class="input-area">
    <div class="input-container">
      <!-- 输入框 -->
      <div class="input-wrapper" :class="{ focused: isFocused }">
        <textarea
          ref="textareaRef"
          v-model="inputContent"
          class="message-input"
          placeholder="输入消息..."
          rows="1"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />

        <!-- 右侧按钮组 -->
        <div class="input-actions">
          <!-- 取消按钮（发送中显示） -->
          <button
            v-if="isSending"
            class="action-btn cancel-btn"
            @click="handleCancel"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- 发送按钮 -->
          <button
            v-else
            class="action-btn send-btn"
            :class="{ disabled: !canSend }"
            :disabled="!canSend"
            @click="handleSend"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 8H13.5M13.5 8L9 3.5M13.5 8L9 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="input-hint">
        <span class="hint-text">按 Enter 发送，Shift + Enter 换行</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const textareaRef = ref(null)
const inputContent = ref('')
const isSending = ref(false)
const isFocused = ref(false)

const canSend = computed(() => {
  return inputContent.value.trim().length > 0 && !isSending.value
})

// 处理输入 - 自动调整高度
const handleInput = () => {
  autoResize()
}

// 自动调整文本框高度
const autoResize = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = 1.5 * parseFloat(getComputedStyle(textarea).fontSize)

    const minHeight = 2.25
    const maxHeight = 9.75

    if (scrollHeight <= lineHeight * 6) {
      textarea.style.height = `${Math.max(minHeight, scrollHeight / 16)}rem`
    } else {
      textarea.style.height = `${maxHeight}rem`
    }
  })
}

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 发送消息
const handleSend = () => {
  if (!canSend.value) return

  const message = inputContent.value.trim()
  inputContent.value = ''
  isSending.value = true

  nextTick(() => {
    autoResize()
  })

  chatStore.sendMessage({
    message,
    toolIds: []
  })
}

// 取消发送
const handleCancel = () => {
  chatStore.cancelSend()
  isSending.value = false
}

// 监听 store 的发送状态
watch(() => chatStore.isSending, (val) => {
  isSending.value = val
})
</script>

<style scoped>
.input-area {
  padding: 1rem 1.5rem 1.25rem;
  background: var(--bg-primary);
}

.input-container {
  max-width: 42rem;
  margin: 0 auto;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-2xl);
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.input-wrapper:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.input-wrapper.focused {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(124, 154, 109, 0.12), var(--shadow-md);
}

.message-input {
  flex: 1;
  min-height: 2.25rem;
  max-height: 9.75rem;
  padding: 0.5rem 0;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.message-input::placeholder {
  color: var(--text-tertiary);
}

.message-input:disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.send-btn {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.send-btn:hover:not(.disabled) {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.send-btn.disabled {
  background: var(--bg-hover);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--color-error);
  color: var(--text-inverse);
}

.cancel-btn:hover {
  background: #b85c50;
  transform: scale(1.05);
}

.input-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0 0.25rem;
}

.hint-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
</style>
