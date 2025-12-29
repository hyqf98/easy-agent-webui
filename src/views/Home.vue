<template>
  <div class="chat-container">
    <div class="chat-layout">
      <!-- Header -->
      <header class="chat-header">
        <div class="header-content">
          <div class="header-brand">
            <div class="brand-icon">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </div>
            <h1 class="brand-title">ReAct Agent</h1>
          </div>
          <el-button
            v-if="messages.length > 0"
            text
            @click="clearMessages"
            :disabled="loading"
            class="clear-btn"
          >
            <el-icon><Delete /></el-icon>
            <span>清空</span>
          </el-button>
        </div>
      </header>

      <!-- Messages Area -->
      <main class="messages-area" ref="messagesContainer">
        <!-- Welcome Screen -->
        <div v-if="messages.length === 0 && !loading" class="welcome-screen">
          <div class="welcome-content">
            <div class="welcome-avatar">
              <el-icon :size="48"><MagicStick /></el-icon>
            </div>
            <h2 class="welcome-title">你好，我是 ReAct 智能助手</h2>
            <p class="welcome-subtitle">我可以通过推理和工具调用来帮助你解决问题</p>

            <div class="example-prompts">
              <button
                class="prompt-card"
                @click="handleExampleClick('搜索一下Spring AI的最新特性')"
              >
                <el-icon class="prompt-icon"><Search /></el-icon>
                <span class="prompt-text">搜索 Spring AI 最新特性</span>
              </button>

              <button
                class="prompt-card"
                @click="handleExampleClick('计算 1234 * 5678')"
              >
                <el-icon class="prompt-icon"><Operation /></el-icon>
                <span class="prompt-text">计算 1234 × 5678</span>
              </button>

              <button
                class="prompt-card"
                @click="handleExampleClick('查询北京的天气')"
              >
                <el-icon class="prompt-icon"><Sunny /></el-icon>
                <span class="prompt-text">查询北京天气</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Message Thread -->
        <div class="message-thread" v-else>
          <TransitionGroup name="message-fade">
            <div
              v-for="(msg, index) in messages"
              :key="`msg-${index}`"
              class="message-group"
            >
              <!-- User Message -->
              <div v-if="msg.role === 'user'" class="message user-message">
                <div class="message-bubble user-bubble">
                  <p class="message-text">{{ msg.content }}</p>
                </div>
              </div>

              <!-- Assistant Message -->
              <div v-else class="message assistant-message">
                <div class="message-content">
                  <!-- Reasoning Section -->
                  <div v-if="msg.reasoning" class="reasoning-block">
                    <el-collapse accordion>
                      <el-collapse-item>
                        <template #title>
                          <div class="collapse-title">
                            <el-icon class="title-icon"><Orange /></el-icon>
                            <span class="title-text">思考过程</span>
                            <el-tag size="small" type="info" class="title-tag">Reasoning</el-tag>
                          </div>
                        </template>
                        <div class="reasoning-text">
                          <pre>{{ msg.reasoning }}</pre>
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>

                  <!-- Tool Calls Section -->
                  <div v-if="msg.toolCalls && msg.toolCalls.length > 0" class="tools-block">
                    <div class="block-header">
                      <el-icon class="header-icon"><Tools /></el-icon>
                      <span class="header-text">工具调用</span>
                      <el-tag size="small" type="primary" class="header-tag">Actions</el-tag>
                    </div>
                    <div class="tools-list">
                      <div
                        v-for="tool in msg.toolCalls"
                        :key="tool.toolCallId"
                        class="tool-item"
                      >
                        <div class="tool-main">
                          <div class="tool-left">
                            <el-icon
                              v-if="tool.status === 'loading'"
                              class="tool-icon rotating"
                            >
                              <Loading />
                            </el-icon>
                            <el-icon
                              v-else
                              class="tool-icon success"
                            >
                              <CircleCheck />
                            </el-icon>
                            <span class="tool-label">{{ getToolDisplayName(tool.toolName) }}</span>
                          </div>
                          <el-tag
                            :type="getToolTagType(tool.status)"
                            size="small"
                            class="tool-status"
                          >
                            {{ getToolStatusText(tool.status) }}
                          </el-tag>
                        </div>
                        <div v-if="tool.result" class="tool-result">
                          <div class="result-divider"></div>
                          <p class="result-text">{{ formatToolResult(tool.result) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Final Answer Section -->
                  <div v-if="msg.finalAnswer" class="answer-block">
                    <div class="answer-content">
                      <MarkdownRenderer :content="msg.finalAnswer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- Current Generating Message -->
          <div v-if="loading" class="message assistant-message generating">
            <div class="message-content">
              <!-- Reasoning -->
              <div v-if="currentMessage.reasoning" class="reasoning-block">
                <div class="block-header">
                  <el-icon class="header-icon rotating"><Orange /></el-icon>
                  <span class="header-text">思考中...</span>
                </div>
                <div class="reasoning-text">
                  <pre>{{ currentMessage.reasoning }}</pre>
                </div>
              </div>

              <!-- Tool Calls -->
              <div v-if="currentMessage.toolCalls && currentMessage.toolCalls.length > 0" class="tools-block">
                <div class="block-header">
                  <el-icon class="header-icon"><Tools /></el-icon>
                  <span class="header-text">执行工具</span>
                </div>
                <div class="tools-list">
                  <div
                    v-for="tool in currentMessage.toolCalls"
                    :key="tool.toolCallId"
                    class="tool-item"
                  >
                    <div class="tool-main">
                      <div class="tool-left">
                        <el-icon
                          v-if="tool.status === 'loading'"
                          class="tool-icon rotating"
                        >
                          <Loading />
                        </el-icon>
                        <el-icon
                          v-else
                          class="tool-icon success"
                        >
                          <CircleCheck />
                        </el-icon>
                        <span class="tool-label">{{ getToolDisplayName(tool.toolName) }}</span>
                      </div>
                      <el-tag
                        :type="getToolTagType(tool.status)"
                        size="small"
                        class="tool-status"
                      >
                        {{ getToolStatusText(tool.status) }}
                      </el-tag>
                    </div>
                    <div v-if="tool.result" class="tool-result">
                      <div class="result-divider"></div>
                      <p class="result-text">{{ formatToolResult(tool.result) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loading Indicator -->
              <div
                v-if="!currentMessage.reasoning && (!currentMessage.toolCalls || currentMessage.toolCalls.length === 0)"
                class="thinking-indicator"
              >
                <div class="thinking-dots">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
                <span class="thinking-text">正在思考</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Input Area -->
      <footer class="input-area">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 6 }"
            placeholder="输入你的问题..."
            :disabled="loading"
            @keydown.enter.exact.prevent="handleSend"
            class="input-field"
          />
          <button
            :disabled="!inputMessage.trim() || loading"
            @click="handleSend"
            class="send-button"
            :class="{ active: inputMessage.trim() && !loading }"
          >
            <el-icon v-if="!loading" :size="20"><Promotion /></el-icon>
            <el-icon v-else class="rotating" :size="20"><Loading /></el-icon>
          </button>
        </div>
        <div class="input-hint">
          <span>按 <kbd>Enter</kbd> 发送，<kbd>Shift</kbd> + <kbd>Enter</kbd> 换行</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useChat } from '@/composables/useChat'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const messagesContainer = ref(null)
const inputMessage = ref('')

const { messages, currentMessage, loading, sendMessage, clearMessages } = useChat()

const handleSend = () => {
  if (!inputMessage.value.trim() || loading.value) return
  sendMessage(inputMessage.value, 'chat')
  inputMessage.value = ''
}

const handleExampleClick = (prompt) => {
  if (loading.value) return
  inputMessage.value = prompt
  handleSend()
}

// Tool helper functions
const getToolDisplayName = (toolName) => {
  const names = {
    webSearch: '网页搜索',
    calculator: '计算器',
    weather: '天气查询'
  }
  return names[toolName] || toolName
}

const getToolStatusText = (status) => {
  const texts = {
    loading: '执行中',
    success: '完成',
    error: '失败'
  }
  return texts[status] || status
}

const getToolTagType = (status) => {
  const types = {
    loading: 'info',
    success: 'success',
    error: 'danger'
  }
  return types[status] || ''
}

const formatToolResult = (result) => {
  if (typeof result === 'string') {
    return result.length > 200 ? result.substring(0, 200) + '...' : result
  }
  return JSON.stringify(result).substring(0, 200)
}

// Auto-scroll to bottom
watch(
  [messages, currentMessage],
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  },
  { deep: true }
)
</script>

<style scoped>
/* Base Layout */
.chat-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-layout {
  width: 100%;
  max-width: 1000px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.08);
}

/* Header */
.chat-header {
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.01em;
}

.clear-btn {
  color: #6b7280;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: #374151;
}

/* Messages Area */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px 24px;
  background: #fafbfc;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  margin: 0 0 48px 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.prompt-card {
  padding: 16px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.prompt-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.prompt-icon {
  font-size: 20px;
  color: #667eea;
  flex-shrink: 0;
}

.prompt-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* Message Thread */
.message-thread {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.message-group {
  margin-bottom: 28px;
}

/* Message Fade Animation */
.message-fade-enter-active {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* User Message */
.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  max-width: 75%;
  padding: 14px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 18px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.message-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: white;
  word-wrap: break-word;
}

/* Assistant Message */
.assistant-message {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Reasoning Block */
.reasoning-block {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.reasoning-block :deep(.el-collapse) {
  border: none;
}

.reasoning-block :deep(.el-collapse-item__header) {
  padding: 16px 20px;
  background: #fafbfc;
  border: none;
  font-size: 14px;
  height: auto;
  line-height: 1.5;
}

.reasoning-block :deep(.el-collapse-item__wrap) {
  border: none;
  background: white;
}

.reasoning-block :deep(.el-collapse-item__content) {
  padding: 0;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.title-icon {
  font-size: 18px;
  color: #f59e0b;
}

.title-text {
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.title-tag {
  margin-left: auto;
}

.reasoning-text {
  padding: 20px;
  background: #fffbeb;
  border-top: 1px solid #fde68a;
}

.reasoning-text pre {
  margin: 0;
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #92400e;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Tools Block */
.tools-block {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 20px;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 18px;
  color: #3b82f6;
}

.header-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.header-tag {
  margin-left: auto;
}

.tools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-item {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.tool-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.tool-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.tool-icon {
  font-size: 16px;
}

.tool-icon.success {
  color: #10b981;
}

.tool-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.tool-status {
  flex-shrink: 0;
}

.tool-result {
  margin-top: 12px;
  padding-top: 12px;
}

.result-divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 12px;
}

.result-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

/* Answer Block */
.answer-block {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.answer-content {
  font-size: 15px;
  line-height: 1.75;
  color: #1f2937;
}

.answer-content :deep(p) {
  margin: 0 0 16px 0;
}

.answer-content :deep(p:last-child) {
  margin-bottom: 0;
}

.answer-content :deep(code) {
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
}

.answer-content :deep(pre) {
  padding: 16px;
  background: #1f2937;
  border-radius: 8px;
  overflow-x: auto;
}

.answer-content :deep(pre code) {
  padding: 0;
  background: transparent;
  color: #e5e7eb;
}

/* Thinking Indicator */
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.thinking-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.thinking-text {
  font-size: 14px;
  color: #6b7280;
}

/* Input Area */
.input-area {
  flex-shrink: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 20px 24px;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto;
}

.input-field {
  flex: 1;
}

.input-field :deep(.el-textarea__inner) {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  transition: all 0.2s;
}

.input-field :deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field :deep(.el-textarea__inner::placeholder) {
  color: #9ca3af;
}

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #e5e7eb;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-button.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.input-hint {
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.input-hint kbd {
  padding: 2px 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

/* Animations */
.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Generating Message Pulse */
.generating {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chat-layout {
    max-width: 100%;
  }

  .messages-area {
    padding: 20px 16px;
  }

  .user-bubble {
    max-width: 85%;
  }

  .example-prompts {
    grid-template-columns: 1fr;
  }
}
</style>
