<template>
  <div class="ink-wash-chat-container">
    <!-- 水墨晕染动态背景 -->
    <div class="ink-background">
      <div class="ink-splash ink-splash-1"></div>
      <div class="ink-splash ink-splash-2"></div>
      <div class="ink-splash ink-splash-3"></div>
      <div class="cloud-pattern cloud-1"></div>
      <div class="cloud-pattern cloud-2"></div>
      <div class="cloud-pattern cloud-3"></div>
    </div>

    <!-- 主界面布局 -->
    <div class="chat-layout" :class="{ 'sidebar-collapsed': !sidebarVisible }">
      <!-- 左侧会话列表 -->
      <aside class="conversation-sidebar" :class="{ 'collapsed': !sidebarVisible }">
        <Transition name="sidebar-collapse">
          <div v-show="sidebarVisible" class="sidebar-content">
            <ConversationList
              :conversations="conversations"
              :activeId="activeConversationId"
              @createChat="createConversation"
              @selectChat="selectConversation"
              @deleteChat="deleteConversation"
              @renameChat="renameConversation"
            />
          </div>
        </Transition>
      </aside>

      <!-- 右侧聊天区域 -->
      <main class="chat-main" :class="{ 'has-active-chat': hasActiveChat, 'expanded': !sidebarVisible }">
        <!-- 顶部标题 -->
        <header class="chat-header">
          <button class="sidebar-toggle" @click="toggleSidebar" :title="sidebarVisible ? '收起侧边栏' : '展开侧边栏'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 class="chat-title">{{ currentTitle }}</h1>
        </header>

        <!-- 根据状态渲染不同视图 -->
        <ChatWelcomeView
          v-if="!hasActiveChat"
          v-bind="inputProps"
          v-on="inputEvents"
        />

        <ChatNormalView
          v-else-if="!isSplitLayoutMode"
          :messages="messages"
          :isThinking="isThinking"
          :expandedThinking="expandedThinking"
          :toggleThinking="toggleThinking"
          :checkScrollPosition="checkScrollPosition"
          :handleScroll="handleScroll"
          @containerReady="handleContainerReady"
          v-bind="inputProps"
          v-on="inputEvents"
        />

        <ChatSplitView
          v-else
          :messages="messages"
          :isThinking="isThinking"
          :expandedThinking="expandedThinking"
          :currentChatMode="currentChatMode"
          :lastAiMessage="lastAiMessage"
          :toggleThinking="toggleThinking"
          :checkScrollPosition="checkScrollPosition"
          :checkLeftScrollPosition="checkLeftScrollPosition"
          :handleScroll="handleScroll"
          :handleLeftScroll="handleLeftScroll"
          @containerReady="handleContainerReady"
          @leftAreaReady="handleLeftAreaReady"
          @rightAreaReady="handleRightAreaReady"
          v-bind="inputProps"
          v-on="inputEvents"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ConversationList from '@/components/chat/index.vue'
import ChatWelcomeView from './components/ChatWelcomeView.vue'
import ChatNormalView from './components/ChatNormalView.vue'
import ChatSplitView from './components/ChatSplitView.vue'

// 导入所有状态和函数
import {
  conversations,
  activeConversationId,
  messages,
  isSending,
  isThinking,
  expandedThinking,
  sidebarVisible,
  toggleSidebar,
  currentChatMode,
  currentTitle,
  hasActiveChat,
  isSplitLayoutMode,
  lastAiMessage,
  createConversation,
  selectConversation,
  deleteConversation,
  renameConversation,
  toggleThinking,
  checkScrollPosition,
  checkLeftScrollPosition,
  handleScroll,
  handleLeftScroll,
  inputMessage,
  inputPlaceholder,
  currentModeLabel,
  getModeDescription,
  visibleChatModes,
  visibleFeatureButtons,
  enabledFeatures,
  showScrollButton,
  scrollButtonTarget,
  showLeftScrollButton,
  leftScrollButtonTarget,
  sendMessage,
  handleInput,
  handleAttachment,
  handleScrollButtonClick,
  handleLeftScrollButtonClick,
  toggleFeature,
  switchChatMode,
  clearCurrentConversation,
  stopGeneration,
  isFeatureEnabled,
  isModeActive,
  messagesContainer,
  leftMessagesAreaRef,
  rightContentWrapperRef
} from './AiChatView.js'

// 处理容器引用
const handleContainerReady = (ref) => {
  // 保存 messagesContainer 引用
  if (ref) {
    messagesContainer.value = ref.value
    // 事件监听器已在组件内部添加，这里不需要重复添加
    // 只检查滚动位置
    setTimeout(() => {
      checkScrollPosition()
    }, 100)
  }
}

const handleLeftAreaReady = (ref) => {
  // 保存 leftMessagesAreaRef 引用
  if (ref) {
    leftMessagesAreaRef.value = ref.value
    // 添加事件监听器
    if (leftMessagesAreaRef.value && !leftMessagesAreaRef.value.dataset.hasScrollListener) {
      leftMessagesAreaRef.value.addEventListener('scroll', handleLeftScroll)
      leftMessagesAreaRef.value.dataset.hasScrollListener = 'true'
    }
    // 检查滚动位置
    setTimeout(() => {
      checkLeftScrollPosition()
    }, 100)
  }
}

const handleRightAreaReady = (ref) => {
  // 保存 rightContentWrapperRef 引用
  if (ref) {
    rightContentWrapperRef.value = ref.value
  }
}

// 输入组件需要的 props
const inputProps = computed(() => ({
  inputMessage: inputMessage.value,
  inputPlaceholder: inputPlaceholder.value,
  isSending: isSending.value,
  isThinking: isThinking.value,
  hasActiveChat: hasActiveChat.value,
  messages: messages.value,
  currentChatMode: currentChatMode.value,
  currentModeLabel: currentModeLabel.value,
  visibleChatModes: visibleChatModes.value,
  visibleFeatureButtons: visibleFeatureButtons.value,
  enabledFeatures: enabledFeatures.value,
  showScrollButton: showScrollButton.value,
  scrollButtonTarget: scrollButtonTarget.value,
  showLeftScrollButton: showLeftScrollButton.value,
  leftScrollButtonTarget: leftScrollButtonTarget.value,
  // 方法作为 props 传递
  sendMessage,
  handleInput,
  handleAttachment,
  handleScrollButtonClick,
  handleLeftScrollButtonClick,
  toggleFeature,
  switchChatMode,
  clearCurrentConversation,
  stopGeneration,
  isFeatureEnabled,
  isModeActive,
  getModeDescription,
}))

// 输入组件需要的事件
const inputEvents = {
  'update:inputMessage': (value) => {
    inputMessage.value = value
  },
}
</script>

<style scoped src="./AiChatView.css"></style>
