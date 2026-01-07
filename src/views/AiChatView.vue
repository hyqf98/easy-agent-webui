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
    <div class="chat-layout">
      <!-- 左侧会话列表 -->
      <aside class="conversation-sidebar">
        <ConversationList
          :conversations="conversations"
          :activeId="activeConversationId"
          @createChat="createConversation"
          @selectChat="selectConversation"
          @deleteChat="deleteConversation"
          @renameChat="renameConversation"
        />
      </aside>

      <!-- 右侧聊天区域 -->
      <main class="chat-main" :class="{ 'has-active-chat': hasActiveChat }">
        <!-- 顶部标题 -->
        <header class="chat-header">
          <h1 class="chat-title">{{ currentTitle }}</h1>
        </header>

        <!-- 聊天内容区 -->
        <div class="chat-content-area">
          <!-- 无会话时的欢迎界面 -->
          <Transition name="welcome-fade">
            <div v-if="!hasActiveChat" class="welcome-container">
              <div class="welcome-content">
                <div class="welcome-ink-art">
                  <div class="ink-circle-large"></div>
                  <div class="ink-text-large">灵犀</div>
                </div>
                <p class="welcome-title">灵犀问答</p>
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
          <div class="input-container">
            <!-- 输入框包装器 -->
            <div class="input-wrapper-ink">
              <div class="input-inner-wrapper">
                <!-- 文本输入区域 -->
                <div class="textarea-wrapper">
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

                <!-- 深度思考模式 -->
                <button
                  class="tool-btn mode-btn"
                  :class="{ 'active': activeMode === 'deepThink' }"
                  @click="toggleMode('deepThink')"
                  title="深度思考模式"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="M1 12h6m6 0h6"/>
                  </svg>
                  <span>深度思考</span>
                </button>

                <!-- 搜索模式 -->
                <button
                  class="tool-btn mode-btn"
                  :class="{ 'active': activeMode === 'search' }"
                  @click="toggleMode('search')"
                  title="搜索模式"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span>搜索</span>
                </button>

                <!-- Markdown模式 -->
                <button
                  class="tool-btn mode-btn"
                  :class="{ 'active': activeMode === 'markdown' }"
                  @click="toggleMode('markdown')"
                  title="Markdown模式"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <path d="M8 12h8"/>
                    <path d="M12 8v8"/>
                  </svg>
                  <span>Markdown</span>
                </button>

                <!-- 网页模式 -->
                <button
                  class="tool-btn mode-btn"
                  :class="{ 'active': activeMode === 'web' }"
                  @click="toggleMode('web')"
                  title="网页模式"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span>网页</span>
                </button>

                <!-- PPT模式 -->
                <button
                  class="tool-btn mode-btn"
                  :class="{ 'active': activeMode === 'ppt' }"
                  @click="toggleMode('ppt')"
                  title="PPT模式"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span>PPT</span>
                </button>
              </div>

              <!-- 右侧辅助按钮 -->
              <div class="toolbar-right">
                <button class="tool-btn scroll-top-btn" @click="scrollToTop" title="回到顶部">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'
import ConversationList from '../components/chat/ConversationList.vue'
import ThinkingMessage from '../components/chat/ThinkingMessage.vue'
import NormalMessage from '../components/chat/NormalMessage.vue'
import ToolMessage from '../components/chat/ToolMessage.vue'

// 会话管理
const conversations = ref([])
const activeConversationId = ref(null)

// 当前会话的消息
const messages = ref([])
const inputMessage = ref('')
const isSending = ref(false)
const isThinking = ref(false)
const expandedThinking = ref(null)
const messagesContainer = ref(null)
const inputRef = ref(null)

// 新增：模式和功能状态
const activeMode = ref(null) // 当前激活的模式：'deepThink' | 'search' | 'markdown' | 'web' | 'ppt'
const fileInputRef = ref(null) // 文件上传输入框引用

let messageIdCounter = 0
let conversationIdCounter = 0
let eventSource = null

// 创建唯一 ID
const createId = () => `msg_${++messageIdCounter}`
const createConversationId = () => `conv_${++conversationIdCounter}`

// 是否有活跃会话
const hasActiveChat = computed(() => !!activeConversationId.value)

// 当前标题
const currentTitle = computed(() => {
  if (!activeConversationId.value) return '灵犀问答'
  const conv = conversations.value.find(c => c.id === activeConversationId.value)
  return conv ? conv.title : '灵犀问答'
})

// 输入框占位符
const inputPlaceholder = computed(() => {
  return hasActiveChat.value
    ? '输入消息，Enter 发送，Shift+Enter 换行...'
    : '输入消息开始新的对话...'
})

// 创建新会话
const createConversation = () => {
  const newConv = {
    id: createConversationId(),
    title: '新对话',
    preview: '',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  conversations.value.unshift(newConv)
  selectConversation(newConv.id)
}

// 选择会话
const selectConversation = (id) => {
  activeConversationId.value = id
  const conv = conversations.value.find(c => c.id === id)
  if (conv) {
    messages.value = conv.messages || []
  }
  nextTick(() => {
    scrollToBottom()
    inputRef.value?.focus()
  })
}

// 删除会话
const deleteConversation = (id) => {
  const index = conversations.value.findIndex(c => c.id === id)
  if (index > -1) {
    conversations.value.splice(index, 1)
    if (activeConversationId.value === id) {
      activeConversationId.value = null
      messages.value = []
    }
  }
}

// 重命名会话
const renameConversation = (id, newTitle) => {
  const conv = conversations.value.find(c => c.id === id)
  if (conv) {
    conv.title = newTitle
    conv.updatedAt = Date.now()
  }
}

// 更新会话预览
const updateConversationPreview = (title, preview) => {
  if (!activeConversationId.value) return
  const conv = conversations.value.find(c => c.id === activeConversationId.value)
  if (conv) {
    if (title && conv.title === '新对话') {
      conv.title = title
    }
    if (preview) {
      conv.preview = preview
    }
    conv.updatedAt = Date.now()
    conv.messages = [...messages.value]
  }
}

// 切换思考内容展开/折叠
const toggleThinking = (msgId) => {
  if (expandedThinking.value === msgId) {
    expandedThinking.value = null
  } else {
    expandedThinking.value = msgId
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isSending.value) return

  // 如果没有活跃会话，创建新会话
  if (!hasActiveChat.value) {
    createConversation()
  }

  // 添加用户消息
  const userMessage = {
    id: createId(),
    role: 'user',
    content
  }
  messages.value.push(userMessage)
  inputMessage.value = ''

  // 重置输入框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  isSending.value = true
  isThinking.value = true

  // 更新会话预览
  updateConversationPreview(content, content)

  scrollToBottom()

  // 创建 AI 消息占位
  const aiMessage = {
    id: createId(),
    role: 'assistant',
    content: '',
    thinking: null,
    tools: [],
    isStreaming: true
  }
  messages.value.push(aiMessage)

  try {
    // SSE 流式请求
    await streamResponse(content, aiMessage)
  } catch (error) {
    console.error('发送消息失败:', error)
    aiMessage.content = '抱歉，出现了错误。请稍后重试。'
    aiMessage.isStreaming = false
  } finally {
    isSending.value = false
    isThinking.value = false
    scrollToBottom()
  }
}

// SSE 流式响应处理
const streamResponse = async (prompt, aiMessage) => {
  return new Promise((resolve, reject) => {
    eventSource = new EventSource('/api/chat/sse?prompt=' + encodeURIComponent(prompt))

    let currentTool = null
    let fullContent = ''

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'thinking':
            if (!aiMessage.thinking) {
              aiMessage.thinking = ''
            }
            aiMessage.thinking += data.content || ''
            scrollToBottom()
            break

          case 'content':
            aiMessage.content += data.content || ''
            fullContent = aiMessage.content
            scrollToBottom()
            break

          case 'tool_start':
            currentTool = {
              id: createId(),
              name: data.name,
              status: 'calling',
              input: data.input,
              output: null
            }
            aiMessage.tools.push(currentTool)
            scrollToBottom()
            break

          case 'tool_end':
            if (currentTool) {
              currentTool.status = 'completed'
              currentTool.output = data.output
            }
            scrollToBottom()
            break

          case 'done':
            aiMessage.isStreaming = false
            eventSource.close()
            // 更新会话预览
            if (fullContent) {
              updateConversationPreview(null, fullContent.substring(0, 50) + '...')
            }
            resolve()
            break

          case 'error':
            aiMessage.content += '\n\n错误: ' + (data.error || '未知错误')
            aiMessage.isStreaming = false
            eventSource.close()
            reject(new Error(data.error))
            break
        }
      } catch (e) {
        console.error('解析 SSE 数据失败:', e)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE 连接错误:', error)
      eventSource.close()
      aiMessage.isStreaming = false
      reject(error)
    }

    // 超时处理
    setTimeout(() => {
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close()
        aiMessage.isStreaming = false
        reject(new Error('请求超时'))
      }
    }, 60000)
  })
}

// 处理输入事件并动态调整高度（最多6行）
const handleInput = () => {
  adjustTextareaHeight()
}

// 自动调整输入框高度
const adjustTextareaHeight = () => {
  if (inputRef.value) {
    const textarea = inputRef.value

    // 使用 requestAnimationFrame 确保在正确的时机计算高度
    requestAnimationFrame(() => {
      // 临时重置高度以获取正确的 scrollHeight
      textarea.style.height = 'auto'

      // 强制浏览器重新计算布局
      textarea.scrollHeight

      // 计算行高：28px 是单行高度（包含行间距）
      const lineHeight = 28
      const maxHeight = lineHeight * 6 // 6行最大高度

      // 获取实际内容高度
      const scrollHeight = textarea.scrollHeight

      // 计算目标高度（至少 1 行，最多 6 行）
      let targetHeight = Math.max(lineHeight, Math.min(scrollHeight, maxHeight))

      // 设置新高度
      textarea.style.height = targetHeight + 'px'
    })
  }
}

// 切换模式
const toggleMode = (mode) => {
  if (activeMode.value === mode) {
    activeMode.value = null // 取消激活
  } else {
    activeMode.value = mode
  }
}

// 处理附件上传
const handleAttachment = () => {
  // 创建一个隐藏的文件输入框
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,.pdf,.doc,.docx,.txt'
  input.multiple = true
  input.onchange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      console.log('选择的文件:', files)
      // TODO: 实现文件上传逻辑
    }
  }
  input.click()
}

// 滚动到顶部
const scrollToTop = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  // 初始化时聚焦输入框
  inputRef.value?.focus()
  // 初始化输入框高度
  adjustTextareaHeight()
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
})
</script>

<style scoped>
/* ========== 全局容器 - 水墨画风格 ========== */
.ink-wash-chat-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--paper-新);
  font-family: var(--font-宋);
}

/* ========== 水墨晕染背景 ========== */
.ink-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.ink-splash {
  position: absolute;
  filter: blur(60px);
  opacity: 0.03;
  animation: inkDrift 30s ease-in-out infinite;
}

.ink-splash-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--ink-焦) 0%, transparent 70%);
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.ink-splash-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--ink-浓) 0%, transparent 70%);
  bottom: -150px;
  left: -150px;
  animation-delay: -10s;
}

.ink-splash-3 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, var(--ink-重) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -20s;
}

@keyframes inkDrift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.025;
  }
  33% {
    transform: translate(50px, -40px) scale(1.2);
    opacity: 0.05;
  }
  66% {
    transform: translate(-40px, 50px) scale(0.8);
    opacity: 0.035;
  }
}

/* ========== 主布局 ========== */
.chat-layout {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
}

/* ========== 左侧边栏 ========== */
.conversation-sidebar {
  width: 300px;
  flex-shrink: 0;
  background: linear-gradient(180deg,
    var(--paper-新) 0%,
    var(--paper-熟) 100%);
  border-right: var(--border-细);
  display: flex;
  flex-direction: column;
}

/* ========== 右侧主区域 ========== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ========== 顶部标题 ========== */
.chat-header {
  flex-shrink: 0;
  padding: var(--spacing-中) var(--spacing-宽);
  background: rgba(250, 248, 243, 0.98);
  border-bottom: var(--border-细);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  letter-spacing: 16px;
  margin: 0;
}

/* ========== 内容区域 ========== */
.chat-content-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* ========== 欢迎界面 ========== */
.welcome-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  animation: welcomeFadeIn 1s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes welcomeFadeIn {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-ink-art {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 48px;
}

.ink-circle-large {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid var(--ink-清);
  background: radial-gradient(circle,
    transparent 30%,
    var(--ink-晕染-浅) 50%,
    transparent 70%);
  animation: inkRipple 5s ease-in-out infinite;
}

@keyframes inkRipple {
  0%, 100% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

.ink-text-large {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 96px;
  font-weight: 900;
  color: var(--ink-焦);
  font-family: var(--font-楷);
  opacity: 0.15;
  letter-spacing: 24px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  margin-bottom: var(--spacing-中);
  letter-spacing: 16px;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--ink-重);
  font-family: var(--font-楷);
  margin-bottom: var(--spacing-展);
  letter-spacing: 4px;
}

.welcome-hint {
  font-size: 14px;
  color: var(--ink-淡);
  letter-spacing: 2px;
}

/* 欢迎界面过渡动画 */
.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.welcome-fade-enter-from,
.welcome-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.welcome-fade-leave-to {
  position: absolute;
}

/* ========== 消息区域 ========== */
.messages-container {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: var(--spacing-宽) 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-淡) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--ink-淡);
}

.messages-inner {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-appear-enter-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.messages-appear-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

/* 空会话状态 */
.empty-conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ink-淡);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-宽);
  opacity: 0.5;
}

.empty-conversation p {
  font-size: 14px;
  letter-spacing: 2px;
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-中);
  padding-bottom: var(--spacing-中);
}

.message-wrapper {
  animation: messageAppear 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 用户消息 */
.message-user {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: var(--spacing-紧);
}

.user-message-bubble {
  position: relative;
  max-width: 65%;
  padding: 2px var(--spacing-紧);
  background: var(--ink-浓);
  box-shadow: var(--shadow-墨-中);
  overflow: hidden;
}

.user-message-bubble::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(255,255,255,0.06) 0%,
    transparent 50%);
  pointer-events: none;
}

.message-content {
  position: relative;
  color: var(--paper-新);
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  z-index: 1;
}

.ink-drip {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%);
}

.user-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.avatar-seal {
  width: 100%;
  height: 100%;
  background: var(--ink-重);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--paper-新);
  font-size: 13px;
  font-family: var(--font-楷);
  font-weight: 500;
  box-shadow: var(--shadow-墨-浅);
}

/* AI 消息 */
.message-ai {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--spacing-紧);
}

.ai-avatar {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.avatar-ink {
  width: 100%;
  height: 100%;
  background: var(--ink-焦);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--paper-新);
  font-size: 13px;
  font-family: var(--font-楷);
  font-weight: 500;
  box-shadow: var(--shadow-墨-浅);
}

.ai-message-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-紧);
  max-width: 78%;
}

/* 思考指示器 */
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-中);
  padding: 8px var(--spacing-中);
  margin-left: 40px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ink-ripples {
  position: relative;
  width: 32px;
  height: 32px;
}

.ripple {
  position: absolute;
  inset: 0;
  border: 2px solid var(--ink-焦);
  opacity: 0;
  animation: rippleEffect 2.5s ease-out infinite;
}

.ripple-2 { animation-delay: 0.6s; }
.ripple-3 { animation-delay: 1.2s; }

@keyframes rippleEffect {
  0% { transform: scale(0.3); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

.thinking-text {
  color: var(--ink-重);
  font-size: 14px;
  letter-spacing: 1px;
}

/* ========== 输入区域 - 重新设计 ========== */
.input-area {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 10;
}

/* 居中状态 */
.input-area.centered {
  top: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-width: 800px;
}

/* 底部状态 */
.input-area.at-bottom {
  bottom: 40px;
  width: 80%;
  max-width: 900px;
  left: 50%;
  transform: translateX(-50%);
}

/* 输入容器 */
.input-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-紧);
}

/* 输入框水墨包装器 */
.input-wrapper-ink {
  background: rgba(250, 248, 243, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-墨-中);
  border: 1px solid var(--paper-纹理);
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
}

/* 水墨装饰边框 */
.input-wrapper-ink::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg,
    var(--ink-清) 0%,
    var(--ink-淡) 50%,
    var(--ink-清) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.input-wrapper-ink:focus-within::before {
  opacity: 0.5;
  animation: borderBreath 4s ease-in-out infinite;
}

.input-wrapper-ink:focus-within {
  box-shadow: var(--shadow-墨-深);
  background: rgba(255, 255, 255, 0.98);
}

/* 输入框内部包装器 */
.input-inner-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-中);
  padding: var(--spacing-中) var(--spacing-宽);
  position: relative;
}

/* 文本输入区域包装器 */
.textarea-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 48px;
}

/* 消息输入框 */
.message-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  font-family: var(--font-宋);
  color: var(--ink-焦);
  resize: none;
  outline: none;
  line-height: 1.65;
  height: auto;
  min-height: 20px;
  max-height: 156px; /* 6行 × 26px */
  padding: 10px 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-清) transparent;
  transition: all 0.3s ease;
  word-wrap: break-word;
  word-break: break-word;
}

.message-input::-webkit-scrollbar {
  width: 4px;
}

.message-input::-webkit-scrollbar-track {
  background: transparent;
}

.message-input::-webkit-scrollbar-thumb {
  background: var(--ink-清);
  border-radius: 4px;
}

.message-input::-webkit-scrollbar-thumb:hover {
  background: var(--ink-淡);
}

.message-input::placeholder {
  color: var(--ink-淡);
  font-size: 15px;
  transition: all 0.3s ease;
}

.message-input:focus::placeholder {
  opacity: 0.3;
  transform: translateX(4px);
}

/* ========== 发送按钮 - 圆形印章设计 ========== */
.send-btn-circle {
  position: relative;
  width: 48px;
  height: 48px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;
  padding: 0;
}

.send-seal {
  width: 100%;
  height: 100%;
  background: var(--seal-朱砂);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow:
    0 4px 12px rgba(200, 48, 48, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 印章边缘虚线装饰 */
.send-seal::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.send-btn-circle .send-icon {
  width: 20px;
  height: 20px;
  color: white;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}

.send-btn-circle:hover:not(:disabled) .send-seal {
  transform: scale(1.08);
  background: var(--seal-印泥);
  box-shadow:
    0 6px 16px rgba(200, 48, 48, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.send-btn-circle:hover:not(:disabled) .send-icon {
  transform: translateX(2px) translateY(-2px);
}

.send-btn-circle:active:not(:disabled) .send-seal {
  transform: scale(0.95);
}

.send-btn-circle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn-circle:disabled .send-seal {
  background: var(--ink-淡);
  box-shadow: none;
}

.send-btn-circle:disabled .send-icon {
  color: var(--ink-清);
}

.send-btn-circle.sending .send-seal {
  animation: sendingStamp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes sendingStamp {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.15) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* ========== 输入工具栏 ========== */
.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  gap: var(--spacing-中);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-紧);
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-紧);
}

/* ========== 工具按钮 ========== */
.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(250, 248, 243, 0.8);
  border: 1px solid var(--paper-纹理);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  font-size: 13px;
  font-family: var(--font-黑);
  color: var(--ink-重);
  position: relative;
  overflow: hidden;
}

.tool-btn svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* 水墨悬停效果 */
.tool-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(74, 74, 74, 0.03) 0%,
    rgba(74, 74, 74, 0.06) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tool-btn:hover::before {
  opacity: 1;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--ink-清);
  box-shadow: var(--shadow-墨-浅);
  transform: translateY(-1px);
}

.tool-btn:active {
  transform: translateY(0);
}

/* 模式按钮文字 */
.tool-btn.mode-btn span {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 激活状态 */
.tool-btn.active {
  background: linear-gradient(135deg,
    var(--ink-焦) 0%,
    var(--ink-浓) 100%);
  color: var(--paper-新);
  border-color: var(--ink-焦);
  box-shadow:
    0 2px 8px rgba(26, 26, 26, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tool-btn.active::before {
  display: none;
}

.tool-btn.active:hover {
  background: linear-gradient(135deg,
    var(--ink-浓) 0%,
    var(--ink-重) 100%);
  transform: translateY(-1px);
}

/* 附件按钮 - 圆形 */
.tool-btn.attachment-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: rgba(235, 230, 219, 0.6);
}

.tool-btn.attachment-btn svg {
  width: 16px;
  height: 16px;
}

.tool-btn.attachment-btn:hover {
  background: var(--accent-赭石);
  border-color: var(--accent-赭石);
  color: white;
  transform: scale(1.05);
}

.tool-btn.attachment-btn:active {
  transform: scale(0.98);
}

/* 回到顶部按钮 - 圆形 */
.tool-btn.scroll-top-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  background: rgba(235, 230, 219, 0.5);
}

.tool-btn.scroll-top-btn svg {
  width: 13px;
  height: 13px;
}

.tool-btn.scroll-top-btn:hover {
  background: var(--ink-重);
  border-color: var(--ink-重);
  color: white;
  transform: translateY(-2px);
}

/* ========== 响应式调整 ========== */
@media (max-width: 768px) {
  .input-area.at-bottom {
    width: 92%;
    bottom: var(--spacing-中);
  }

  .input-area.centered {
    width: 90%;
  }

  .input-toolbar {
    flex-wrap: wrap;
    gap: var(--spacing-紧);
  }

  .toolbar-left {
    gap: var(--spacing-紧);
  }

  .tool-btn.mode-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .tool-btn.mode-btn span {
    font-size: 12px;
  }

  .tool-btn.mode-btn:not(.active) span {
    display: none;
  }

  .tool-btn.mode-btn:not(.active) {
    padding: 8px;
    border-radius: 50%;
  }
}
</style>
