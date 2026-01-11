<template>
  <!-- 滚动按钮 -->
  <Transition name="scroll-button-fade" v-if="!hideScrollButton">
    <button
      v-if="showScrollButton && mode === 'normal'"
      @click="handleScrollButtonClick"
      class="scroll-navigation-btn"
      :title="scrollButtonTarget === 'bottom' ? '回到底部' : '回到顶部'"
    >
      <svg v-if="scrollButtonTarget === 'bottom'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18,15 12,9 6,15"/>
      </svg>
    </button>
    <button
      v-else-if="showScrollButton && mode === 'compact'"
      @click="handleLeftScrollButtonClick"
      class="scroll-navigation-btn left-scroll-btn"
      :title="leftScrollButtonTarget === 'bottom' ? '回到底部' : '回到顶部'"
    >
      <svg v-if="leftScrollButtonTarget === 'bottom'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6,9 12,15 18,9"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="18,15 12,9 6,15"/>
      </svg>
    </button>
  </Transition>

  <div :class="['input-container', mode === 'compact' ? 'input-container-compact' : '']">
    <!-- 输入框包装器 -->
    <div :class="['input-wrapper-ink', mode === 'compact' ? 'input-wrapper-ink-compact' : '']">
      <div :class="['input-inner-wrapper', mode === 'compact' ? 'input-inner-wrapper-compact' : '']">
        <!-- 文本输入区域 -->
        <div :class="['textarea-wrapper', mode === 'compact' ? 'textarea-wrapper-compact' : '']">
          <!-- 当前模式显示 -->
          <div v-if="currentModeLabel && mode === 'normal'" class="current-mode-display">
            <span class="mode-name">{{ currentModeLabel }}</span>
            <span class="mode-desc">{{ getModeDescription(currentChatMode) }}</span>
          </div>
          <textarea
            :value="inputMessage"
            @input="handleInputChange"
            @keydown.enter.exact.prevent="sendMessage"
            :class="['message-input', mode === 'compact' ? 'message-input-compact' : '']"
            :placeholder="inputPlaceholder"
            rows="1"
            ref="inputRef"
          ></textarea>
        </div>

        <!-- 发送按钮 -->
        <button
          @click="sendMessage"
          :class="[mode === 'compact' ? 'send-btn-compact' : 'send-btn-circle', { 'sending': isSending }]"
          :disabled="!(inputMessage || '').trim() || isSending"
        >
          <div :class="mode === 'compact' ? 'send-seal-compact' : 'send-seal'">
            <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div :class="['input-toolbar', mode === 'compact' ? 'input-toolbar-compact' : '']">
      <!-- 左侧功能按钮组 -->
      <div :class="mode === 'compact' ? 'toolbar-left-compact' : 'toolbar-left'">
        <!-- +号按钮（附件） -->
        <button :class="['tool-btn', 'attachment-btn', mode === 'compact' ? 'tool-btn-compact' : '']" @click="handleAttachment" title="上传图片或文件">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        <!-- 可复选功能按钮 -->
        <div :class="mode === 'compact' ? 'feature-buttons-compact' : 'feature-buttons-wrapper'">
          <button
            v-for="feature in visibleFeatureButtons"
            :key="feature.id"
            :class="['tool-btn', mode === 'compact' ? 'tool-btn-compact' : 'mode-btn feature-btn', { 'active': isFeatureEnabled(feature.id) }]"
            @click="toggleFeature(feature.id)"
            :title="feature.label"
          >
            <!-- 深度思考图标 -->
            <svg v-if="feature.id === 'deepThink'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6"/>
              <path d="M1 12h6m6 0h6"/>
            </svg>
            <!-- 搜索图标 -->
            <svg v-else-if="feature.id === 'search'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>{{ feature.label }}</span>
          </button>
        </div>

        <!-- 聊天模式按钮（仅普通模式显示） -->
        <div v-if="mode === 'normal'" class="mode-buttons-scroll">
          <div class="mode-buttons-wrapper">
            <button
              v-for="chatMode in visibleChatModes"
              :key="chatMode.id"
              class="tool-btn mode-btn chat-mode-btn"
              :class="{ 'active': isModeActive(chatMode.id) }"
              @click="switchChatMode(chatMode.id)"
              :title="chatMode.label"
            >
              <!-- 图标 - 使用chatMode数组中定义的icon -->
              <svg v-if="chatMode.id === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <svg v-else-if="chatMode.id === 'markdown'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M8 12h8"/>
                <path d="M12 8v8"/>
              </svg>
              <svg v-else-if="chatMode.id === 'web'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <svg v-else-if="chatMode.id === 'ppt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span>{{ chatMode.label }}</span>
            </button>
          </div>
        </div>

        <!-- 当前模式显示（仅紧凑模式） -->
        <div v-if="mode === 'compact'" class="current-mode-display-compact">
          <svg v-if="currentChatMode === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mode-icon-compact">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <svg v-else-if="currentChatMode === 'markdown'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mode-icon-compact">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
          </svg>
          <svg v-else-if="currentChatMode === 'web'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mode-icon-compact">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <svg v-else-if="currentChatMode === 'ppt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mode-icon-compact">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span class="mode-name-compact">{{ currentModeLabel }}</span>
        </div>
      </div>

      <!-- 右侧：清空和停止 -->
      <div v-if="mode === 'normal'" class="toolbar-right">
        <!-- 清空按钮 -->
        <button
          v-if="hasActiveChat && ((messages && messages.length > 0) || isThinking)"
          @click="clearCurrentConversation"
          class="tool-btn"
          title="清空对话"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>

        <!-- 停止生成按钮 -->
        <button
          v-if="isThinking || isSending"
          @click="stopGeneration"
          class="tool-btn stop-btn"
          title="停止生成"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:inputMessage'])

const props = defineProps({
  mode: {
    type: String,
    default: 'normal' // 'normal' | 'compact'
  },
  hideScrollButton: {
    type: Boolean,
    default: false
  },
  // 从父组件传入的所有状态和方法
  inputMessage: String,
  inputPlaceholder: String,
  isSending: Boolean,
  isThinking: Boolean,
  hasActiveChat: Boolean,
  messages: Array,
  currentChatMode: String,
  currentModeLabel: String,
  visibleChatModes: Array,
  visibleFeatureButtons: Array,
  enabledFeatures: Array,
  showScrollButton: Boolean,
  scrollButtonTarget: String,
  leftScrollButtonTarget: String,
  // 方法
  sendMessage: Function,
  handleInput: Function,
  handleAttachment: Function,
  handleScrollButtonClick: Function,
  handleLeftScrollButtonClick: Function,
  toggleFeature: Function,
  switchChatMode: Function,
  clearCurrentConversation: Function,
  stopGeneration: Function,
  isFeatureEnabled: Function,
  isModeActive: Function,
  getModeDescription: Function,
})

const inputRef = ref(null)

// 处理输入变化
const handleInputChange = (e) => {
  const value = e.target.value
  emit('update:inputMessage', value)
  if (props.handleInput) {
    props.handleInput()
  }
}

defineExpose({ inputRef })

onMounted(() => {
  if (props.mode === 'compact' || props.mode === 'normal') {
    inputRef.value?.focus()
  }
})
</script>

<style src="../AiChatView.css"></style>
