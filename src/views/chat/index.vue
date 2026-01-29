<template>
  <div class="chat-container">
    <!-- Sidebar: 会话列表 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <button
          v-if="!sidebarCollapsed"
          class="new-chat-btn"
          @click="handleNewChat"
          aria-label="新建对话"
        >
          <el-icon :size="20"><Plus /></el-icon>
          <span>新建对话</span>
        </button>
        <button
          v-else
          class="new-chat-btn icon-only"
          @click="handleNewChat"
          aria-label="新建对话"
        >
          <el-icon :size="18"><Plus /></el-icon>
        </button>
        <button
          class="collapse-btn"
          @click="toggleSidebar"
          :aria-label="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          <el-icon :size="18">
            <Fold v-if="!sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>

      <div class="conversations-list" v-if="!sidebarCollapsed">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{ 'conversation-active': conversation.id === currentConversationId }"
          @click="handleSelectConversation(conversation.id)"
          @mouseenter="hoveredConversationId = conversation.id"
          @mouseleave="hoveredConversationId = null"
          :aria-selected="conversation.id === currentConversationId"
          role="option"
          tabindex="0"
          @keydown.enter="handleSelectConversation(conversation.id)"
        >
          <div class="conversation-icon">
            {{ getConversationIcon(conversation.title) }}
          </div>
          <div class="conversation-info">
            <div class="conversation-title">{{ conversation.title || '新对话' }}</div>
            <div class="conversation-time">{{ formatTime(conversation.updatedAt) }}</div>
          </div>
          <button
            v-if="hoveredConversationId === conversation.id"
            class="delete-btn"
            @click.stop="handleDeleteConversation(conversation.id)"
            aria-label="删除对话"
          >
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </div>
      </div>

      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <button class="settings-btn" @click="settingsVisible = true" aria-label="设置">
          <el-icon :size="18"><Setting /></el-icon>
          <span>设置</span>
        </button>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="chat-main">
      <!-- Chat Header -->
      <header class="chat-header">
        <div class="model-selector">
          <el-dropdown @command="handleModelChange" trigger="click">
            <div class="model-trigger">
              <span class="model-name">{{ currentModel.name }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="model in availableModels"
                  :key="model.id"
                  :command="model.id"
                >
                  {{ model.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="header-title">Easy Agent</div>
        <div class="header-actions">
          <button
            class="icon-btn"
            @click="handleExport"
            aria-label="导出对话"
          >
            <el-icon :size="18"><Download /></el-icon>
          </button>
        </div>
      </header>

      <!-- Messages Container -->
      <div class="messages-container" ref="messagesContainer">

        <!-- Messages List -->
        <TransitionGroup name="message" tag="div" class="messages-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-wrapper"
            :class="`message-${message.role}`"
          >
            <!-- User Message -->
            <div v-if="message.role === 'user'" class="message user-message">
              <div class="message-content user-content">
                <p>{{ message.content }}</p>
              </div>
              <div class="message-avatar user-avatar">
                <el-icon :size="20"><User /></el-icon>
              </div>
            </div>

            <!-- Assistant Message -->
            <div v-else class="message assistant-message">
              <div class="message-avatar assistant-avatar">
                <el-icon :size="20"><ChatDotRound /></el-icon>
              </div>
              <div class="message-content assistant-content">
                <!-- Thinking Block -->
                <ThinkingBlock
                  v-if="message.thinking"
                  :content="message.thinking"
                  :default-expanded="false"
                />

                <!-- Regular Content -->
                <div v-if="message.content" class="text-content">
                  <XMarkdown
                    v-if="!message.streaming"
                    :markdown="message.content"
                    class="markdown-content"
                  />
                  <Typewriter
                    v-else
                    :content="message.content"
                    :interval="15"
                    :step="2"
                    class="typewriter-content"
                  />
                </div>

                <!-- Tool Call -->
                <ToolCall
                  v-if="message.toolCalls && message.toolCalls.length > 0"
                  :tools="message.toolCalls"
                />

                <!-- File Cards -->
                <FileCards
                  v-if="message.files && message.files.length > 0"
                  :files="message.files"
                />

                <!-- Message Actions -->
                <div class="message-actions">
                  <button
                    class="action-btn"
                    @click="handleCopy(message.content)"
                    aria-label="复制内容"
                  >
                    <el-icon :size="14"><DocumentCopy /></el-icon>
                  </button>
                  <button
                    class="action-btn"
                    @click="handleRegenerate(message.id)"
                    aria-label="重新生成"
                  >
                    <el-icon :size="14"><RefreshRight /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area" :class="{ 'input-centered': messages.length === 0 }">
        <div class="input-container">
          <div class="input-options">
            <div class="option-toggle">
              <el-tooltip content="深度思考" placement="top">
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-active': deepThinkingEnabled }"
                  @click="deepThinkingEnabled = !deepThinkingEnabled"
                  :aria-pressed="deepThinkingEnabled"
                  aria-label="启用深度思考"
                >
                  <el-icon :size="16"><View /></el-icon>
                  <span>深度思考</span>
                </button>
              </el-tooltip>
            </div>
            <div class="option-toggle">
              <el-tooltip content="联网搜索" placement="top">
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-active': webSearchEnabled }"
                  @click="webSearchEnabled = !webSearchEnabled"
                  :aria-pressed="webSearchEnabled"
                  aria-label="启用联网搜索"
                >
                  <el-icon :size="16"><Search /></el-icon>
                  <span>联网搜索</span>
                </button>
              </el-tooltip>
            </div>
          </div>

          <div class="input-wrapper">
            <textarea
              ref="inputRef"
              v-model="inputMessage"
              class="chat-input"
              placeholder="输入消息... (Shift + Enter 换行，Enter 发送)"
              rows="1"
              @keydown="handleKeyDown"
              @input="handleInputResize"
              :disabled="isLoading"
            />
            <button
              class="send-btn"
              @click="handleSend"
              :disabled="!inputMessage.trim() || isLoading"
              :aria-label="inputMessage.trim() ? '发送消息' : '输入内容后发送'"
            >
              <el-icon :size="20">
                <Promotion v-if="inputMessage.trim() && !isLoading" />
                <el-icon v-else><Promotion /></el-icon>
              </el-icon>
            </button>
          </div>

          <div class="input-footer">
            <span class="input-hint">AI 生成内容可能不准确</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Settings Dialog -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div v-if="settingsVisible" class="dialog-overlay" @click="settingsVisible = false">
          <div class="dialog-content" @click.stop>
            <div class="dialog-header">
              <h2>设置</h2>
              <button class="close-btn" @click="settingsVisible = false" aria-label="关闭">
                <el-icon :size="20"><Close /></el-icon>
              </button>
            </div>
            <div class="dialog-body">
              <p>设置面板内容待开发...</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { XMarkdown, Typewriter } from 'vue-element-plus-x'
import {
  Plus,
  Fold,
  Expand,
  Delete,
  Setting,
  ArrowDown,
  Download,
  User,
  ChatDotRound,
  Search,
  Tools,
  View,
  DocumentCopy,
  RefreshRight,
  Promotion,
  Close
} from '@element-plus/icons-vue'
import ThinkingBlock from './components/ThinkingBlock.vue'
import ToolCall from './components/ToolCall.vue'
import FileCards from './components/FileCards.vue'

// State
const sidebarCollapsed = ref(false)
const settingsVisible = ref(false)
const currentConversationId = ref('1')
const hoveredConversationId = ref(null)
const inputMessage = ref('')
const inputRef = ref(null)
const messagesContainer = ref(null)
const isLoading = ref(false)
const deepThinkingEnabled = ref(false)
const webSearchEnabled = ref(false)

// Available Models
const availableModels = ref([
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo' }
])
const currentModel = ref(availableModels.value[0])

// Conversations (Mock Data)
const conversations = ref([
  { id: '1', title: 'React 性能优化', updatedAt: Date.now() - 1000 * 60 * 5 },
  { id: '2', title: 'Python 数据分析', updatedAt: Date.now() - 1000 * 60 * 60 * 2 },
  { id: '3', title: 'Vue 3 新特性', updatedAt: Date.now() - 1000 * 60 * 60 * 24 },
  { id: '4', title: '数据库设计', updatedAt: Date.now() - 1000 * 60 * 60 * 48 }
])

// Messages (初始化为空数组，用户发送消息后才生成模拟数据)
const messages = ref([])

// 模拟响应数据生成器 - 根据用户输入触发不同类型的响应
const generateMockResponse = (userInput) => {
  const lowerInput = userInput.toLowerCase()

  // 1. 完整响应（思考 + 内容 + 工具调用 + 文件）
  if (lowerInput.includes('分析') || lowerInput.includes('对比') || lowerInput.includes('性能')) {
    return {
      thinking: `用户想了解关于"${userInput}"的分析。

我需要从以下几个维度进行分析：
1. 核心概念和原理
2. 技术实现细节
3. 实际应用场景
4. 最佳实践建议

让我先搜索一些最新的资料来确保信息的准确性。`,
      content: `# 关于"${userInput}"的分析

让我从几个核心方面来为你分析：

## 核心要点

### 1. 技术架构
- **架构特点**: 模块化设计，支持灵活扩展
- **性能优化**: 采用现代化技术栈，响应速度快
- **可维护性**: 代码结构清晰，易于维护

### 2. 实际应用
根据最新数据和实际案例：

| 指标 | 数值 | 说明 |
|------|------|------|
| 性能提升 | 35% | 相比传统方案 |
| 开发效率 | 50% | 开发时间缩短 |
| 用户满意度 | 92% | 基于用户反馈 |

### 3. 推荐实践
1. **初学者**: 从基础概念开始，循序渐进
2. **进阶开发**: 深入理解底层原理
3. **生产环境**: 注意性能监控和错误处理

我已经为你生成了一些相关文档和测试数据，可以参考附件中的文件。`,
      toolCalls: [
        {
          name: 'web_search',
          status: 'success',
          parameters: {
            query: userInput,
            source: 'tech_documentation',
            limit: 5
          },
          result: {
            source: '技术文档搜索',
            summary: '找到 5 篇相关技术文章',
            articles: [
              { title: '深入解析技术原理', relevance: 95 },
              { title: '最佳实践指南', relevance: 88 },
              { title: '性能优化技巧', relevance: 85 },
              { title: '常见问题解答', relevance: 80 },
              { title: '实战案例分析', relevance: 75 }
            ]
          }
        },
        {
          name: 'code_analysis',
          status: 'running',
          parameters: {
            target: userInput,
            analysis_type: 'deep'
          }
        },
        {
          name: 'database_query',
          status: 'error',
          parameters: {
            query: 'SELECT * FROM examples WHERE topic = ?'
          },
          error: '连接超时：数据库服务器响应时间过长（>30s），请稍后重试'
        }
      ],
      files: [
        { name: 'analysis_report.pdf', size: '1.8 MB', type: 'PDF' },
        { name: 'test_results.csv', size: '45 KB', type: 'CSV' },
        { name: 'code_samples.js', size: '23 KB', type: 'JS' },
        { name: 'config.json', size: '2 KB', type: 'JSON' }
      ],
      streaming: true
    }
  }

  // 2. 简单响应（仅内容）
  else if (lowerInput.includes('你好') || lowerInput.includes('hi') || lowerInput.includes('hello')) {
    return {
      content: `你好！👋

我是 Easy Agent，很高兴为你服务！

我可以帮助你：
- 💬 **自然语言对话** - 回答各种问题
- 🔍 **联网搜索** - 获取最新信息
- 🛠️ **工具调用** - 执行各种任务
- 🧠 **深度思考** - 提供详细分析

有什么可以帮助你的吗？`,
      streaming: true
    }
  }

  // 3. 工具调用为主（思考 + 多个工具调用）
  else if (lowerInput.includes('搜索') || lowerInput.includes('查找') || lowerInput.includes('查询')) {
    return {
      thinking: `用户想要搜索"${userInput}"。

我需要：
1. 先进行联网搜索获取相关信息
2. 分析搜索结果
3. 整理并呈现给用户

让我先执行搜索操作。`,
      content: `为你找到了关于"${userInput}"的相关信息：

根据搜索结果，我整理了以下关键信息：

### 主要发现
- 找到了 **12** 篇相关文章
- 其中 **8** 篇来自权威来源
- 信息新鲜度：最近 7 天内有更新

### 核心要点
1. **最新动态**: 该领域近期有重要进展
2. **社区讨论**: 活跃度较高，有 500+ 相关讨论
3. **专家观点**: 多位领域专家发表了看法

详细信息请查看下方的工具调用结果。`,
      toolCalls: [
        {
          name: 'web_search',
          status: 'success',
          parameters: {
            query: userInput,
            limit: 10,
            time_range: 'week'
          },
          result: {
            total_results: 12,
            top_results: [
              { title: '最新研究进展', url: 'https://example.com/1', date: '2天前' },
              { title: '专家解读报告', url: 'https://example.com/2', date: '5天前' },
              { title: '社区讨论汇总', url: 'https://example.com/3', date: '1周前' }
            ]
          }
        },
        {
          name: 'knowledge_base',
          status: 'success',
          parameters: {
            query: userInput,
            database: 'internal_docs'
          },
          result: {
            found: true,
            documents: 5,
            best_match: '内部文档库中找到高度相关内容'
          }
        }
      ],
      streaming: false
    }
  }

  // 4. 文件处理为主
  else if (lowerInput.includes('文件') || lowerInput.includes('下载') || lowerInput.includes('报告')) {
    return {
      thinking: `用户请求处理与文件相关的内容：${userInput}

我将：
1. 查找相关文件
2. 生成必要的新文件
3. 提供文件预览信息`,
      content: `已为你处理文件相关请求：${userInput}

### 生成的文件清单

| 文件名 | 大小 | 类型 | 说明 |
|--------|------|------|------|
| summary_report.pdf | 2.1 MB | PDF | 综合分析报告 |
| data_export.json | 156 KB | JSON | 导出的数据 |
 charts.png | 45 KB | 图片 | 数据可视化图表 |
| analysis.md | 12 KB | Markdown | 分析文档 |
 | script.py | 8 KB | Python | 自动化脚本 |

所有文件已准备就绪，你可以点击上方卡片查看详情或下载。`,
      files: [
        { name: 'summary_report.pdf', size: '2.1 MB', type: 'PDF' },
        { name: 'data_export.json', size: '156 KB', type: 'JSON' },
        { name: 'charts.png', size: '45 KB', type: 'PNG' },
        { name: 'analysis.md', size: '12 KB', type: 'MD' },
        { name: 'script.py', size: '8 KB', type: 'PY' },
        { name: 'results.csv', size: '23 KB', type: 'CSV' },
        { name: 'config.yaml', size: '2 KB', type: 'YAML' }
      ],
      streaming: false
    }
  }

  // 5. 默认响应（简单内容）
  else {
    return {
      content: `收到你的消息："${userInput}"

这是一个演示响应，展示了不同类型的消息效果。

**当前提示**：尝试发送包含以下关键词的消息来查看不同效果：
- "分析"、"对比"、"性能" → 完整响应（思考 + 内容 + 工具 + 文件）
- "你好"、"hi" → 简单问候响应
- "搜索"、"查找" → 工具调用为主的响应
- "文件"、"报告" → 文件处理为主的响应

我会根据你的输入内容智能选择最合适的响应方式！`,
      streaming: true
    }
  }
}

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const getConversationIcon = (title) => {
  if (!title) return '对'
  return title.charAt(0)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const handleNewChat = () => {
  const newId = String(conversations.value.length + 1)
  conversations.value.unshift({
    id: newId,
    title: '新对话',
    updatedAt: Date.now()
  })
  currentConversationId.value = newId
  messages.value = []
}

const handleSelectConversation = (id) => {
  currentConversationId.value = id
  // Load messages for this conversation
}

const handleDeleteConversation = (id) => {
  const index = conversations.value.findIndex(c => c.id === id)
  if (index > -1) {
    conversations.value.splice(index, 1)
    if (currentConversationId.value === id && conversations.value.length > 0) {
      currentConversationId.value = conversations.value[0].id
    }
  }
}

const handleModelChange = (modelId) => {
  const model = availableModels.value.find(m => m.id === modelId)
  if (model) {
    currentModel.value = model
  }
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleCopy = (content) => {
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制到剪贴板')
}

const handleRegenerate = (messageId) => {
  ElMessage.info('重新生成功能开发中...')
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleInputResize = () => {
  nextTick(() => {
    if (inputRef.value) {
      const textarea = inputRef.value

      // 重置高度以获取准确的 scrollHeight
      textarea.style.height = 'auto'

      // 获取内容的实际高度
      const scrollHeight = textarea.scrollHeight

      // 直接使用 scrollHeight 作为高度，浏览器已经计算好了
      // 但需要限制最大高度（6行）
      const maxHeight = 150 // 6行的大约高度
      const newHeight = Math.min(scrollHeight, maxHeight)

      textarea.style.height = `${newHeight}px`
    }
  })
}

const handleSend = async () => {
  const content = inputMessage.value.trim()
  if (!content || isLoading.value) return

  // Add user message
  const userMessage = {
    id: String(messages.value.length + 1),
    role: 'user',
    content
  }
  messages.value.push(userMessage)

  // Clear input
  inputMessage.value = ''
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  // Simulate AI response with different types based on input
  isLoading.value = true

  // Simulate thinking delay based on input complexity
  const delay = content.length > 20 ? 1500 : 800

  setTimeout(() => {
    // Generate mock response based on user input
    const responseData = generateMockResponse(content)

    const assistantMessage = {
      id: String(messages.value.length + 1),
      role: 'assistant',
      ...responseData
    }

    messages.value.push(assistantMessage)
    isLoading.value = false

    nextTick(() => {
      scrollToBottom()
    })
  }, delay)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Lifecycle
onMounted(() => {
  inputRef.value?.focus()
})

// Watch for new messages to scroll
watch(() => messages.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})
</script>

<style src="./styles.css"></style>
