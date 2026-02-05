<template>
  <div class="input-area">
    <div class="input-container">
      <!-- 输入框 -->
      <div class="input-wrapper" :class="{ focused: isFocused }">
        <!-- 工具选择器 -->
        <div class="tool-selector-wrapper" v-click-outside="closeToolSelector">
          <!-- 折叠按钮 -->
          <div
            class="tool-selector-btn"
            @mousedown.prevent
            @click="toggleToolSelector"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8.5 2.5C8.5 2.22386 8.27614 2 8 2C7.72386 2 7.5 2.22386 7.5 2.5V7.5H2.5C2.22386 7.5 2 7.72386 2 8C2 8.27614 2.22386 8.5 2.5 8.5H7.5V13.5C7.5 13.7761 7.72386 14 8 14C8.27614 14 8.5 13.7761 8.5 13.5V8.5H13.5C13.7761 8.5 14 8.27614 14 8C14 7.72386 13.7761 7.5 13.5 7.5H8.5V2.5Z" fill="currentColor"/>
              <circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/>
              <circle cx="10.5" cy="5.5" r="1.5" fill="currentColor"/>
              <circle cx="5.5" cy="10.5" r="1.5" fill="currentColor"/>
              <circle cx="10.5" cy="10.5" r="1.5" fill="currentColor"/>
            </svg>
            <span>工具</span>
            <span v-if="selectedToolsCount > 0" class="tool-badge">{{ selectedToolsCount }}</span>
          </div>

          <!-- 展开面板 -->
          <Transition name="tool-panel">
            <div v-if="toolSelectorOpen" class="tool-selector-panel">
              <!-- 加载中 -->
              <div v-if="mcpLoading" class="loading-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="spin">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.3"/>
                  <path d="M12 2C17.5228 2 22 6.47715 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>加载中...</span>
              </div>

              <!-- 错误状态 -->
              <div v-else-if="mcpError" class="error-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="error-text">加载失败</span>
                <button class="retry-btn" @click.stop="loadMcpConfigs">重试</button>
              </div>

              <!-- 空状态 -->
              <div v-else-if="mcpConfigs.length === 0" class="empty-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9.5 10C9.5 10 10.5 11 12 11C13.5 11 14.5 10 14.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="9" cy="7" r="1" fill="currentColor"/>
                  <circle cx="15" cy="7" r="1" fill="currentColor"/>
                  <path d="M21 15C21 18.866 17.4183 22 12 22C6.58172 22 3 18.866 3 15" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 13C3 13 4.5 15 7.5 15C10.5 15 12 13 12 13C12 13 13.5 15 16.5 15C19.5 15 21 13 21 13" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span class="empty-text">暂无可用工具</span>
                <span class="empty-hint">请联系管理员配置 MCP 服务</span>
              </div>

              <!-- 工具列表 -->
              <div v-else class="tool-list">
                <div
                  v-for="config in mcpConfigs"
                  :key="config.id"
                  class="tool-item"
                  :class="{ selected: selectedToolIds.includes(config.id) }"
                  @mousedown.prevent
                  @click="toggleTool(config.id)"
                >
                  <input
                    type="checkbox"
                    :checked="selectedToolIds.includes(config.id)"
                    @click.stop
                    readonly
                  />
                  <span class="tool-name">{{ config.serverName }}</span>
                  <span v-if="config.serverDesc" class="tool-desc" :title="config.serverDesc">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M8 5V8H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 输入框和按钮的包装器 -->
        <div class="input-row">
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
      </div>

      <!-- 底部提示 -->
      <div class="input-hint">
        <span class="hint-text">按 Enter 发送，Shift + Enter 换行</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, toRefs } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const textareaRef = ref(null)
const inputContent = ref('')
const isSending = ref(false)
const isFocused = ref(false)

// 工具选择器相关状态
const toolSelectorOpen = ref(false)

// 从 store 解构 MCP 相关状态（使用 toRefs 保持响应性）
const { mcpConfigs, selectedToolIds, mcpLoading, mcpError, selectedToolsCount } = toRefs(chatStore)

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

  // 从 store 获取选中的工具 ID
  const toolIds = chatStore.selectedToolIds

  chatStore.sendMessage({
    message,
    toolIds  // 传递选中的 MCP 配置 ID 列表（可能为空数组）
  })
}

// ============ 工具选择器相关方法 ============

// 切换工具选择器展开/收起
const toggleToolSelector = async () => {
  if (!toolSelectorOpen.value) {
    // 首次展开时加载 MCP 配置
    await chatStore.loadMcpConfigs()
  }
  toolSelectorOpen.value = !toolSelectorOpen.value
}

// 关闭工具选择器
const closeToolSelector = () => {
  toolSelectorOpen.value = false
}

// 切换工具选择状态
const toggleTool = (toolId) => {
  chatStore.toggleToolSelection(toolId)
}

// 加载 MCP 配置
const loadMcpConfigs = () => {
  chatStore.loadMcpConfigs()
}

// 点击外部关闭功能（使用自定义指令）
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
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
  flex-direction: column;
  align-items: stretch;
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

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 0.625rem;
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

/* ============ 工具选择器样式 ============ */

.tool-selector-wrapper {
  position: relative;
  margin-bottom: 0.5rem;
}

.tool-selector-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  width: fit-content;
}

.tool-selector-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
  color: var(--text-primary);
}

.tool-badge {
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  min-width: 1.25rem;
  text-align: center;
}

.tool-selector-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  min-width: 16rem;
  max-width: 24rem;
  max-height: 18rem;
  overflow-y: auto;
  z-index: 10;
}

/* 工具面板过渡动画 */
.tool-panel-enter-active,
.tool-panel-leave-active {
  transition: all 0.2s ease-out;
}

.tool-panel-enter-from,
.tool-panel-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* 加载中状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.loading-state .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  color: var(--text-secondary);
}

.error-text {
  font-size: 0.875rem;
  color: var(--color-error);
}

.retry-btn {
  padding: 0.375rem 0.875rem;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: var(--transition-base);
}

.retry-btn:hover {
  background: var(--accent-hover);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* 工具列表 */
.tool-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
}

.tool-item:hover {
  background: var(--bg-hover);
}

.tool-item.selected {
  background: rgba(124, 154, 109, 0.08);
}

.tool-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.tool-name {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.tool-desc {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  cursor: help;
}
</style>
