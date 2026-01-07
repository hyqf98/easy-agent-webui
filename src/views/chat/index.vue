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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 class="chat-title">{{ currentTitle }}</h1>
        </header>

        <!-- 聊天内容区 -->
        <div class="chat-content-area">
          <!-- 无会话时的欢迎界面 -->
          <Transition name="welcome-fade">
            <div v-if="!hasActiveChat" class="welcome-container">
              <!-- 上部分：标题和艺术字 -->
              <div class="welcome-content-top">
                <div class="welcome-ink-art">
                  <div class="ink-circle-large"></div>
                  <div class="ink-text-large">灵犀</div>
                </div>
                <p class="welcome-title">灵犀问答</p>
              </div>

              <!-- 下部分：副标题和提示 -->
              <div class="welcome-content-bottom">
                <p class="welcome-subtitle">笔墨之间，智慧流淌</p>
                <p class="welcome-hint">新建对话或输入消息开始交流</p>
              </div>
            </div>
          </Transition>

          <!-- 消息区域 -->
          <Transition name="messages-appear">
            <div v-if="hasActiveChat" class="messages-container" ref="messagesContainer">
              <div class="messages-inner">
                <!-- 欢迎消息 -->
                <div v-if="messages.length === 0" class="empty-conversation">
                  <div class="empty-icon">📝</div>
                  <p>开始这段对话...</p>
                </div>

                <!-- 消息列表 -->
                <TransitionGroup name="message-appear" tag="div" class="messages-list">
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
                  <span class="thinking-text">正在思考...</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 输入区域 -->
        <div class="input-area" :class="{ 'centered': !hasActiveChat, 'at-bottom': hasActiveChat }">
          <!-- 滚动按钮 (动态显示) -->
          <Transition name="scroll-button-fade">
            <button
              v-if="showScrollButton"
              @click="handleScrollButtonClick"
              class="scroll-navigation-btn"
              :title="scrollButtonTarget === 'bottom' ? '回到底部' : '回到顶部'"
            >
              <svg v-if="scrollButtonTarget === 'bottom'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18,15 12,9 6,15"/>
              </svg>
            </button>
          </Transition>
          <div class="input-container">
            <!-- 输入框包装器 -->
            <div class="input-wrapper-ink">
              <div class="input-inner-wrapper">
                <!-- 文本输入区域 -->
                <div class="textarea-wrapper">
                  <!-- 当前模式显示 -->
                  <div v-if="currentModeLabel" class="current-mode-display">
                    <span class="mode-name">{{ currentModeLabel }}</span>
                    <span class="mode-desc">{{ getModeDescription(currentChatMode) }}</span>
                  </div>
                  <textarea
                    v-model="inputMessage"
                    @input="handleInput"
                    @keydown.enter.exact.prevent="sendMessage"
                    class="message-input"
                    :placeholder="inputPlaceholder"
                    rows="1"
                    ref="inputRef"
                  ></textarea>
                </div>

                <!-- 发送按钮 -->
                <button
                  @click="sendMessage"
                  class="send-btn-circle"
                  :disabled="!inputMessage.trim() || isSending"
                  :class="{ 'sending': isSending }"
                >
                  <div class="send-seal">
                    <svg class="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 2L11 13"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- 底部工具栏 -->
            <div class="input-toolbar">
              <!-- 左侧功能按钮组 -->
              <div class="toolbar-left">
                <!-- +号按钮（附件） -->
                <button class="tool-btn attachment-btn" @click="handleAttachment" title="上传图片或文件">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>

                <!-- 可复选功能按钮（深度思考、搜索） -->
                <div class="feature-buttons-wrapper">
                  <button
                    v-for="feature in visibleFeatureButtons"
                    :key="feature.id"
                    class="tool-btn mode-btn feature-btn"
                    :class="{ 'active': isFeatureEnabled(feature.id) }"
                    @click="toggleFeature(feature.id)"
                    :title="feature.label"
                  >
                    <!-- 深度思考图标 -->
                    <svg v-if="feature.id === 'deepThink'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6"/>
                      <path d="M1 12h6m6 0h6"/>
                    </svg>
                    <!-- 搜索图标 -->
                    <svg v-else-if="feature.id === 'search'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span>{{ feature.label }}</span>
                  </button>
                </div>

                <!-- 聊天模式按钮（单选） -->
                <div class="mode-buttons-scroll">
                  <div class="mode-buttons-wrapper">
                    <button
                      v-for="mode in visibleChatModes"
                      :key="mode.id"
                      class="tool-btn mode-btn chat-mode-btn"
                      :class="{ 'active': isModeActive(mode.id) }"
                      @click="switchChatMode(mode.id)"
                      :title="mode.label"
                    >
                      <!-- 智能问答图标 -->
                      <svg v-if="mode.id === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <!-- Markdown 图标 -->
                      <svg v-else-if="mode.id === 'markdown'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <path d="M8 12h8"/>
                        <path d="M12 8v8"/>
                      </svg>
                      <!-- 网页图标 -->
                      <svg v-else-if="mode.id === 'web'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      <!-- PPT 图标 -->
                      <svg v-else-if="mode.id === 'ppt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                      <span>{{ mode.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import ConversationList from '@/components/chat/index.vue'
import ThinkingMessage from '@/components/chat/ThinkingMessage/index.vue'
import NormalMessage from '@/components/chat/NormalMessage/index.vue'
import ToolMessage from '@/components/chat/ToolMessage/index.vue'

// 导入所有状态和函数
import {
  conversations,
  activeConversationId,
  messages,
  inputMessage,
  isSending,
  isThinking,
  expandedThinking,
  messagesContainer,
  inputRef,
  fileInputRef,
  sidebarVisible,
  toggleSidebar,
  featureButtons,
  chatModes,
  visibleFeatureButtons,
  visibleChatModes,
  enabledFeatures,
  currentChatMode,
  currentModeLabel,
  getModeDescription,
  isFeatureEnabled,
  isModeActive,
  toggleFeature,
  switchChatMode,
  hasActiveChat,
  currentTitle,
  inputPlaceholder,
  createConversation,
  selectConversation,
  deleteConversation,
  renameConversation,
  toggleThinking,
  sendMessage,
  handleInput,
  handleAttachment,
  showScrollButton,
  scrollButtonTarget,
  handleScrollButtonClick
} from './AiChatView.js'
</script>

<style scoped src="./AiChatView.css"></style>
