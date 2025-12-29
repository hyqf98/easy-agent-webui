<template>
  <div class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <div class="header-content">
        <div class="brand">
          <div class="brand-icon">
            <el-icon :size="24"><ChatDotRound /></el-icon>
          </div>
          <div class="brand-info">
            <h1 class="brand-title">Precision AI</h1>
            <p class="brand-subtitle">Designed to Elevate Your Workflow</p>
          </div>
        </div>
        <el-button
          v-if="messages.length > 0"
          type="default"
          @click="clearMessages"
          :disabled="loading"
          class="clear-btn"
        >
          <el-icon><Delete /></el-icon>
          Clear
        </el-button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="chat-main" ref="chatMainRef">
      <!-- Welcome Screen -->
      <div v-if="messages.length === 0 && !loading" class="welcome-screen">
        <div class="welcome-content">
          <div class="welcome-icon">
            <el-icon :size="64"><MagicStick /></el-icon>
          </div>
          <h2 class="welcome-title">Hello! I'm Your AI Assistant</h2>
          <p class="welcome-desc">
            A refined system of intelligent components that analyze, organize, and automate your work faster, clearer, and effortlessly.
          </p>

          <div class="feature-cards">
            <div class="feature-card">
              <el-icon :size="32" class="feature-icon"><Search /></el-icon>
              <h3>Sharp Intelligence</h3>
              <p>Instantly delivers clear, useful insights</p>
            </div>
            <div class="feature-card">
              <el-icon :size="32" class="feature-icon"><Setting /></el-icon>
              <h3>Effortless Automation</h3>
              <p>Workflows that run themselves</p>
            </div>
            <div class="feature-card">
              <el-icon :size="32" class="feature-icon"><Lightning /></el-icon>
              <h3>Instant Creation</h3>
              <p>Create content and ideas in seconds</p>
            </div>
          </div>

          <div class="example-prompts">
            <button
              v-for="(prompt, index) in examplePrompts"
              :key="index"
              class="prompt-button"
              @click="handleExampleClick(prompt.text)"
            >
              <el-icon class="prompt-icon">
                <component :is="prompt.icon" />
              </el-icon>
              <span>{{ prompt.text }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Message List -->
      <div v-else class="message-list">
        <TransitionGroup name="message">
          <div
            v-for="(msg, index) in messages"
            :key="`msg-${index}`"
            class="message-wrapper"
          >
            <!-- User Message -->
            <div v-if="msg.role === 'user'" class="message user-message">
              <div class="message-bubble">
                <p>{{ msg.content }}</p>
              </div>
              <div class="message-avatar user-avatar">
                <el-icon><User /></el-icon>
              </div>
            </div>

            <!-- Assistant Message -->
            <div v-else class="message assistant-message">
              <div class="message-avatar assistant-avatar">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="message-content">
                <!-- Thinking (可展开) -->
                <div v-if="msg.thinking" class="thinking-section">
                  <el-collapse>
                    <el-collapse-item>
                      <template #title>
                        <div class="thinking-header">
                          <el-icon class="section-icon"><Orange /></el-icon>
                          <span class="section-title">Reasoning Process</span>
                          <el-tag size="small" type="warning">Thought</el-tag>
                        </div>
                      </template>
                      <div class="thinking-content">
                        <pre>{{ msg.thinking }}</pre>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>

                <!-- Tool Calls -->
                <div v-if="msg.toolCalls && msg.toolCalls.length > 0" class="tools-section">
                  <div class="section-header">
                    <el-icon class="section-icon"><Tools /></el-icon>
                    <span class="section-title">Tool Execution</span>
                    <el-tag size="small">{{ msg.toolCalls.length }} calls</el-tag>
                  </div>
                  <div class="tool-list">
                    <div
                      v-for="tool in msg.toolCalls"
                      :key="tool.toolCallId"
                      class="tool-item"
                    >
                      <div class="tool-header">
                        <div class="tool-name">
                          <el-icon class="tool-icon">
                            <component :is="getToolIcon(tool.toolName)" />
                          </el-icon>
                          <span>{{ getToolDisplayName(tool.toolName) }}</span>
                        </div>
                        <el-tag :type="getToolStatusType(tool.status)" size="small">
                          {{ tool.status }}
                        </el-tag>
                      </div>
                      <div v-if="tool.result" class="tool-result">
                        <pre>{{ formatToolResult(tool.result) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Final Answer -->
                <div v-if="msg.content" class="answer-section">
                  <MarkdownRenderer :content="msg.content" />
                </div>
              </div>
            </div>
          </div>

          <!-- Current Generating Message -->
          <div v-if="loading" key="loading" class="message-wrapper">
            <div class="message assistant-message generating">
              <div class="message-avatar assistant-avatar">
                <el-icon class="rotating"><Cpu /></el-icon>
              </div>
              <div class="message-content">
                <!-- Thinking -->
                <div v-if="currentMessage.thinking" class="thinking-section">
                  <div class="thinking-header">
                    <el-icon class="section-icon rotating"><Orange /></el-icon>
                    <span class="section-title">Thinking...</span>
                  </div>
                  <div class="thinking-content">
                    <pre>{{ currentMessage.thinking }}</pre>
                  </div>
                </div>

                <!-- Tool Calls -->
                <div v-if="currentMessage.toolCalls && currentMessage.toolCalls.length > 0" class="tools-section">
                  <div class="section-header">
                    <el-icon class="section-icon"><Tools /></el-icon>
                    <span class="section-title">Executing Tools...</span>
                  </div>
                  <div class="tool-list">
                    <div
                      v-for="tool in currentMessage.toolCalls"
                      :key="tool.toolCallId"
                      class="tool-item"
                    >
                      <div class="tool-header">
                        <div class="tool-name">
                          <el-icon :class="{ rotating: tool.status === 'loading' }">
                            <component :is="getToolIcon(tool.toolName)" />
                          </el-icon>
                          <span>{{ getToolDisplayName(tool.toolName) }}</span>
                        </div>
                        <el-tag :type="getToolStatusType(tool.status)" size="small">
                          {{ tool.status }}
                        </el-tag>
                      </div>
                      <div v-if="tool.result" class="tool-result">
                        <pre>{{ formatToolResult(tool.result) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Loading Indicator -->
                <div
                  v-if="!currentMessage.thinking && (!currentMessage.toolCalls || currentMessage.toolCalls.length === 0)"
                  class="loading-indicator"
                >
                  <div class="dot-flashing"></div>
                  <span>Processing...</span>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </main>

    <!-- Input Area -->
    <footer class="chat-footer">
      <div class="input-wrapper">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="1"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="Type your message..."
          :disabled="loading"
          @keydown.enter.exact.prevent="handleSend"
          class="message-input"
        />
        <button
          class="send-button"
          :class="{ active: inputMessage.trim() && !loading }"
          :disabled="!inputMessage.trim() || loading"
          @click="handleSend"
        >
          <el-icon v-if="!loading" :size="20"><Promotion /></el-icon>
          <el-icon v-else :size="20" class="rotating"><Loading /></el-icon>
        </button>
      </div>
      <div class="input-hint">
        Press <kbd>Enter</kbd> to send • <kbd>Shift + Enter</kbd> for new line
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { Search, Operation, Sunny, Cpu, Tools as ToolsIcon, Setting, Lightning } from '@element-plus/icons-vue'

const chatMainRef = ref(null)
const inputMessage = ref('')

const { messages, currentMessage, loading, sendMessage, clearMessages } = useChat()

// Example prompts
const examplePrompts = [
  { text: 'Search for Spring AI features', icon: 'Search' },
  { text: 'Calculate 1234 × 5678', icon: 'Operation' },
  { text: 'Check weather in Beijing', icon: 'Sunny' }
]

// Send message
const handleSend = () => {
  if (!inputMessage.value.trim() || loading.value) return
  sendMessage(inputMessage.value, 'chat')
  inputMessage.value = ''
}

// Handle example prompt click
const handleExampleClick = (prompt) => {
  if (loading.value) return
  inputMessage.value = prompt
  handleSend()
}

// Tool helpers
const getToolIcon = (toolName) => {
  const icons = {
    webSearch: 'Search',
    calculator: 'Operation',
    weather: 'Sunny'
  }
  return icons[toolName] || 'Tools'
}

const getToolDisplayName = (toolName) => {
  const names = {
    webSearch: 'Web Search',
    calculator: 'Calculator',
    weather: 'Weather Query'
  }
  return names[toolName] || toolName
}

const getToolStatusType = (status) => {
  const types = {
    loading: 'info',
    success: 'success',
    error: 'danger'
  }
  return types[status] || ''
}

const formatToolResult = (result) => {
  if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return result.length > 300 ? result.substring(0, 300) + '...' : result
    }
  }
  return JSON.stringify(result, null, 2)
}

// Auto-scroll to bottom
watch(
  [messages, currentMessage],
  () => {
    nextTick(() => {
      if (chatMainRef.value) {
        chatMainRef.value.scrollTo({
          top: chatMainRef.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  },
  { deep: true }
)
</script>

<style scoped>
/* ==================== Nexocube Theme Variables ==================== */
:root {
  --primary-green: #a0dc5b;
  --primary-green-dark: #8ac74a;
  --primary-green-light: #b8e580;
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f1f3f5;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --border-color: #dee2e6;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

/* ==================== Layout ==================== */
.chat-container {
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ==================== Header ==================== */
.chat-header {
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 24px;
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(160, 220, 91, 0.3);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.brand-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.clear-btn {
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-tertiary);
}

/* ==================== Main Content ==================== */
.chat-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-primary);
}

.chat-main::-webkit-scrollbar {
  width: 8px;
}

.chat-main::-webkit-scrollbar-track {
  background: transparent;
}

.chat-main::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.chat-main::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* ==================== Welcome Screen ==================== */
.welcome-screen {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
  text-align: center;
}

.welcome-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 12px 40px rgba(160, 220, 91, 0.35);
}

.welcome-title {
  margin: 0 0 16px;
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.welcome-desc {
  margin: 0 0 48px;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.feature-card {
  padding: 32px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-green-light);
}

.feature-icon {
  color: var(--primary-green);
  margin-bottom: 16px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.prompt-button {
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.prompt-button:hover {
  border-color: var(--primary-green);
  background: linear-gradient(135deg, rgba(160, 220, 91, 0.05) 0%, rgba(160, 220, 91, 0.1) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.prompt-icon {
  font-size: 20px;
  color: var(--primary-green);
}

/* ==================== Message List ==================== */
.message-list {
  max-width: 1000px;
  margin: 0 auto;
}

.message-wrapper {
  margin-bottom: 24px;
}

.message {
  display: flex;
  gap: 12px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  order: 2;
}

.assistant-avatar {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: white;
}

/* User Message */
.user-message {
  justify-content: flex-end;
}

.user-message .message-bubble {
  max-width: 70%;
  padding: 14px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius-md);
  border-bottom-right-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.user-message .message-bubble p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

/* Assistant Message */
.assistant-message {
  justify-content: flex-start;
}

.message-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thinking-section,
.tools-section,
.answer-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.thinking-section :deep(.el-collapse) {
  border: none;
}

.thinking-section :deep(.el-collapse-item__header) {
  padding: 0;
  background: transparent;
  border: none;
  font-size: 14px;
  height: auto;
}

.thinking-section :deep(.el-collapse-item__wrap) {
  border: none;
  background: transparent;
}

.thinking-section :deep(.el-collapse-item__content) {
  padding: 12px 0 0 0;
}

.thinking-header,
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 18px;
  color: var(--primary-green);
}

.section-title {
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.thinking-content,
.tool-result {
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.thinking-content pre,
.tool-result pre {
  margin: 0;
  font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.tool-item:hover {
  background: #e9ecef;
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.tool-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.tool-icon {
  color: var(--primary-green);
}

.answer-section {
  line-height: 1.75;
}

.answer-section :deep(p) {
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.answer-section :deep(p:last-child) {
  margin-bottom: 0;
}

.answer-section :deep(code) {
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--primary-green-dark);
}

.answer-section :deep(pre) {
  padding: 16px;
  background: var(--text-primary);
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

.answer-section :deep(pre code) {
  background: transparent;
  color: #e5e7eb;
}

/* Loading Indicator */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.dot-flashing {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--primary-green);
  animation: dot-flashing 1s infinite linear alternate;
}

.dot-flashing::before,
.dot-flashing::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
}

.dot-flashing::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--primary-green);
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 0s;
}

.dot-flashing::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: var(--primary-green);
  animation: dot-flashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dot-flashing {
  0% {
    background-color: var(--primary-green);
  }
  50%,
  100% {
    background-color: rgba(160, 220, 91, 0.2);
  }
}

/* ==================== Footer ==================== */
.chat-footer {
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 20px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.input-wrapper {
  max-width: 1000px;
  margin: 0 auto 8px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  padding: 14px 16px;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  transition: all 0.2s;
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 3px rgba(160, 220, 91, 0.1);
}

.send-button {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-button.active {
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(160, 220, 91, 0.3);
}

.send-button.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(160, 220, 91, 0.4);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.input-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
}

.input-hint kbd {
  padding: 3px 6px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
}

/* ==================== Animations ==================== */
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

.generating {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.96;
  }
}

.message-enter-active {
  animation: fadeInUp 0.5s ease-out;
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

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .chat-header,
  .chat-footer {
    padding: 12px 16px;
  }

  .chat-main {
    padding: 16px;
  }

  .brand-title {
    font-size: 18px;
  }

  .brand-subtitle {
    display: none;
  }

  .welcome-title {
    font-size: 28px;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }

  .example-prompts {
    grid-template-columns: 1fr;
  }

  .user-message .message-bubble {
    max-width: 85%;
  }
}
</style>
