<template>
  <div class="chat-content-area normal-layout">
    <!-- 消息容器 -->
    <Transition name="messages-appear">
      <div class="messages-container" ref="messagesContainer">
        <div class="messages-inner">
          <!-- 空会话提示 -->
          <div v-if="messages && messages.length === 0" class="empty-conversation">
            <div class="empty-icon">📜</div>
            <p>提笔书写，开启对话...</p>
          </div>

          <!-- 消息列表 -->
          <TransitionGroup v-else name="message-appear" tag="div" class="messages-list">
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

              <!-- AI 消息 -->
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

                  <!-- 普通内容 -->
                  <NormalMessage
                    v-if="message.content"
                    :content="message.content"
                    :isStreaming="message.isStreaming"
                  />

                  <!-- 工具调用 -->
                  <ToolMessage
                    v-for="tool in message.tools"
                    :key="tool.id"
                    :tool="tool"
                  />
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
      </div>
    </Transition>

    <!-- 输入区域（在内部，使用 at-bottom class） -->
    <div class="input-area at-bottom">
      <!-- 滚动按钮 -->
      <Transition name="scroll-button-fade">
        <button
          v-if="showScrollButton"
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
      </Transition>

      <ChatInputArea
        mode="normal"
        v-bind="$attrs"
        :hideScrollButton="true"
      />
    </div>
  </div>
</template>

<script setup>
import ThinkingMessage from '@/components/chat/ThinkingMessage/index.vue'
import NormalMessage from '@/components/chat/NormalMessage/index.vue'
import ToolMessage from '@/components/chat/ToolMessage/index.vue'
import ChatInputArea from './ChatInputArea.vue'

const props = defineProps({
  messages: Array,
  isThinking: Boolean,
  expandedThinking: [String, null],
  showScrollButton: Boolean,
  scrollButtonTarget: String,
  // 方法
  toggleThinking: Function,
  checkScrollPosition: Function,
  handleScroll: Function,
  handleScrollButtonClick: Function,
})

const messagesContainer = ref(null)

const emit = defineEmits(['containerReady'])

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', props.handleScroll)
    nextTick(() => {
      props.checkScrollPosition()
    })
  }
  emit('containerReady', messagesContainer)
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', props.handleScroll)
  }
})

defineExpose({ messagesContainer })
</script>

<style src="../AiChatView.css"></style>
