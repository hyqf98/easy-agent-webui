<template>
  <div class="chat-content-area split-layout">
    <Transition name="messages-appear">
      <div class="messages-container split-layout" ref="messagesContainer">
        <div class="messages-inner">
          <div class="split-layout-wrapper">
            <!-- 左侧：聊天面板 -->
            <div class="split-left-panel">
              <!-- 消息列表区域 -->
              <div class="left-messages-area" ref="leftMessagesAreaRef">
                <TransitionGroup name="message-appear" tag="div" class="left-messages-list">
                  <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
                    <!-- 用户消息 -->
                    <div v-if="message.role === 'user'" class="message-user">
                      <div class="user-message-bubble">
                        <div class="message-content">{{ message.content }}</div>
                        <div class="ink-drip"></div>
                      </div>
                      <div class="user-avatar">
                        <div class="avatar-seal">客</div>
                      </div>
                    </div>

                    <!-- AI 消息 - 显示思考、工具调用和内容进度 -->
                    <div v-else class="message-ai">
                      <div class="ai-avatar">
                        <div class="avatar-ink">墨</div>
                      </div>
                      <div class="ai-message-group">
                        <!-- 思考内容 -->
                        <ThinkingMessage
                          v-if="message.thinking"
                          :content="message.thinking"
                          :isExpanded="expandedThinking === message.id"
                          :lastUpdate="message._lastUpdate"
                          @toggle="toggleThinking(message.id)"
                        />

                        <!-- 工具调用 -->
                        <ToolMessage
                          v-for="tool in message.tools"
                          :key="tool.id"
                          :tool="tool"
                        />

                        <!-- 内容生成进度提示 -->
                        <div v-if="message.content || message.isStreaming" class="content-progress-hint">
                          <span v-if="message.isStreaming" class="generating-text">正在研磨笔墨...</span>
                          <span v-else class="completed-text">已成稿</span>
                          <span v-if="message.content" class="content-preview">{{ message.content.substring(0, 100) }}{{ message.content.length > 100 ? '...' : '' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>

                <!-- 加载中动画 -->
                <div v-if="isThinking" class="thinking-indicator">
                  <div class="ink-ripples">
                    <div class="ripple ripple-1"></div>
                    <div class="ripple ripple-2"></div>
                    <div class="ripple ripple-3"></div>
                  </div>
                  <span class="thinking-text">正在研墨思索...</span>
                </div>
              </div>

              <!-- 输入区域（紧凑版） -->
              <div class="left-input-area">
                <!-- 左侧滚动按钮 -->
                <Transition name="scroll-button-fade">
                  <button
                    v-if="showLeftScrollButton"
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

                <ChatInputArea
                  mode="compact"
                  :inputMessage="inputMessage"
                  :inputPlaceholder="inputPlaceholder"
                  :isSending="isSending"
                  :isThinking="isThinking"
                  :hasActiveChat="hasActiveChat"
                  :messages="messages"
                  :currentChatMode="currentChatMode"
                  :currentModeLabel="currentModeLabel"
                  :visibleChatModes="visibleChatModes"
                  :visibleFeatureButtons="visibleFeatureButtons"
                  :enabledFeatures="enabledFeatures"
                  :showScrollButton="showScrollButton"
                  :scrollButtonTarget="scrollButtonTarget"
                  :leftScrollButtonTarget="leftScrollButtonTarget"
                  :hideScrollButton="true"
                  @update:inputMessage="handleInputMessageUpdate"
                  :sendMessage="sendMessage"
                  :handleInput="handleInput"
                  :handleAttachment="handleAttachment"
                  :handleScrollButtonClick="handleScrollButtonClick"
                  :handleLeftScrollButtonClick="handleLeftScrollButtonClick"
                  :toggleFeature="toggleFeature"
                  :switchChatMode="switchChatMode"
                  :clearCurrentConversation="clearCurrentConversation"
                  :stopGeneration="stopGeneration"
                  :isFeatureEnabled="isFeatureEnabled"
                  :isModeActive="isModeActive"
                  :getModeDescription="getModeDescription"
                />
              </div>
            </div>

            <!-- 右侧：渲染面板 -->
            <div class="split-right-panel">
              <!-- 顶部标题栏 -->
              <div class="right-panel-header">
                <div class="header-decoration-left"></div>
                <h3 class="right-panel-title">实时跟随</h3>
                <div class="header-decoration-right"></div>
              </div>

              <div class="right-content-wrapper" ref="rightContentWrapperRef">
                <!-- 渲染最后一条有内容的 AI 消息 -->
                <div v-if="lastAiMessage" class="render-content-area">
                  <!-- Markdown 模式 -->
                  <NormalMessage
                    v-if="currentChatMode === 'markdown'"
                    :content="lastAiMessage.content"
                    :isStreaming="lastAiMessage.isStreaming"
                  />
                  <!-- 网页模式 -->
                  <HtmlMessage
                    v-else-if="currentChatMode === 'web'"
                    :content="lastAiMessage.content"
                    :isStreaming="lastAiMessage.isStreaming"
                  />
                  <!-- PPT 模式 -->
                  <PptMessage
                    v-else-if="currentChatMode === 'ppt'"
                    :content="lastAiMessage.content"
                    :isStreaming="lastAiMessage.isStreaming"
                  />
                </div>

                <!-- 空状态 -->
                <div v-else class="render-empty-state">
                  <div class="empty-icon">📜</div>
                  <p>静待墨迹落纸...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ThinkingMessage from '@/components/chat/ThinkingMessage/index.vue'
import NormalMessage from '@/components/chat/NormalMessage/index.vue'
import ToolMessage from '@/components/chat/ToolMessage/index.vue'
import HtmlMessage from '@/components/chat/HtmlMessage/index.vue'
import PptMessage from '@/components/chat/PptMessage/index.vue'
import ChatInputArea from './ChatInputArea.vue'

const props = defineProps({
  messages: Array,
  isThinking: Boolean,
  expandedThinking: [String, null],
  currentChatMode: String,
  lastAiMessage: [Object, null],
  showLeftScrollButton: Boolean,
  leftScrollButtonTarget: String,
  // ChatInputArea 需要的 props
  inputMessage: String,
  inputPlaceholder: String,
  isSending: Boolean,
  hasActiveChat: Boolean,
  currentModeLabel: String,
  visibleChatModes: Array,
  visibleFeatureButtons: Array,
  enabledFeatures: Array,
  showScrollButton: Boolean,
  scrollButtonTarget: String,
  // 方法
  toggleThinking: Function,
  checkScrollPosition: Function,
  checkLeftScrollPosition: Function,
  handleScroll: Function,
  handleLeftScroll: Function,
  handleLeftScrollButtonClick: Function,
  sendMessage: Function,
  handleInput: Function,
  handleAttachment: Function,
  handleScrollButtonClick: Function,
  toggleFeature: Function,
  switchChatMode: Function,
  clearCurrentConversation: Function,
  stopGeneration: Function,
  isFeatureEnabled: Function,
  isModeActive: Function,
  getModeDescription: Function,
})

const messagesContainer = ref(null)
const leftMessagesAreaRef = ref(null)
const rightContentWrapperRef = ref(null)

const emit = defineEmits(['containerReady', 'leftAreaReady', 'rightAreaReady', 'update:inputMessage'])

// 处理输入消息更新
const handleInputMessageUpdate = (value) => {
  emit('update:inputMessage', value)
}

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', props.handleScroll)
    nextTick(() => {
      props.checkScrollPosition()
    })
  }

  if (leftMessagesAreaRef.value) {
    leftMessagesAreaRef.value.addEventListener('scroll', props.handleLeftScroll)
    leftMessagesAreaRef.value.dataset.hasScrollListener = 'true'
    nextTick(() => {
      props.checkLeftScrollPosition()
    })
  }

  emit('containerReady', messagesContainer)
  emit('leftAreaReady', leftMessagesAreaRef)
  emit('rightAreaReady', rightContentWrapperRef)
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', props.handleScroll)
  }

  if (leftMessagesAreaRef.value) {
    leftMessagesAreaRef.value.removeEventListener('scroll', props.handleLeftScroll)
    delete leftMessagesAreaRef.value.dataset.hasScrollListener
  }
})

defineExpose({
  messagesContainer,
  leftMessagesAreaRef,
  rightContentWrapperRef
})
</script>

<style src="../AiChatView.css"></style>
