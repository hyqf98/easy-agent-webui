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
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-content">
            <h1>Easy Agent</h1>
            <p>我可以帮助你完成各种任务，包括：</p>
            <div class="capabilities">
              <div class="capability-item">
                <el-icon :size="24"><ChatDotRound /></el-icon>
                <span>自然语言对话</span>
              </div>
              <div class="capability-item">
                <el-icon :size="24"><Search /></el-icon>
                <span>联网搜索</span>
              </div>
              <div class="capability-item">
                <el-icon :size="24"><Tools /></el-icon>
                <span>工具调用</span>
              </div>
              <div class="capability-item">
                <el-icon :size="24"><View /></el-icon>
                <span>深度思考</span>
              </div>
            </div>
          </div>
        </div>

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

                <!-- Tool Call -->
                <ToolCall
                  v-if="message.toolCalls && message.toolCalls.length > 0"
                  :tools="message.toolCalls"
                />

                <!-- Regular Content -->
                <div v-if="message.content" class="text-content">
                  <XMarkdown
                    v-if="!message.streaming"
                    :content="message.content"
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

// Messages (Mock Data - 展示手绘风格的各种消息类型)
const messages = ref([
  {
    id: '1',
    role: 'user',
    content: '帮我查询一下北京今天的天气'
  },
  {
    id: '2',
    role: 'assistant',
    thinking: `用户想查询北京今天的天气情况。

我需要：
1. 调用天气查询工具获取实时数据
2. 返回温度、天气状况、风力等信息
3. 可能需要提供穿衣建议

让我使用 search 工具来获取最新的天气信息。`,
    toolCalls: [
      {
        name: 'web_search',
        status: 'success',
        parameters: {
          query: '北京今天天气预报',
          location: 'Beijing',
          date: '2026-01-28'
        },
        result: {
          city: '北京',
          temperature: '-5°C ~ 3°C',
          condition: '多云转晴',
          wind: '北风 3-4级',
          humidity: '45%',
          aqi: '85（良）'
        }
      }
    ],
    content: `# 北京今日天气 ☀️

**温度**: -5°C ~ 3°C
**天气**: 多云转晴
**风力**: 北风 3-4级
**湿度**: 45%
**空气质量**: AQI 85（良）

> 💡 **温馨提示**: 今天气温较低，建议穿着厚外套、毛衣等保暖衣物。外出请注意防寒保暖！`
  },
  {
    id: '3',
    role: 'user',
    content: '再帮我查一下上海的呢？'
  },
  {
    id: '4',
    role: 'assistant',
    thinking: `用户现在想查询上海的天气，我需要：
1. 调用天气查询工具
2. 获取上海的实时天气数据
3. 提供相应的建议`,
    toolCalls: [
      {
        name: 'web_search',
        status: 'success',
        parameters: {
          query: '上海今天天气预报',
          location: 'Shanghai',
          date: '2026-01-28'
        },
        result: {
          city: '上海',
          temperature: '8°C ~ 15°C',
          condition: '阴有小雨',
          wind: '东风 2-3级',
          humidity: '78%',
          aqi: '55（优）'
        }
      }
    ],
    content: `# 上海今日天气 🌧️

**温度**: 8°C ~ 15°C
**天气**: 阴有小雨
**风力**: 东风 2-3级
**湿度**: 78%
**空气质量**: AQI 55（优）

> 💡 **温馨提示**: 今天有雨，记得带伞！温度相对温和，穿着轻薄外套即可。`
  },
  {
    id: '5',
    role: 'user',
    content: '帮我生成一个快速排序的 Python 代码'
  },
  {
    id: '6',
    role: 'assistant',
    content: `# 快速排序算法实现

下面是快速排序的 Python 实现：

\`\`\`python
def quick_sort(arr):
    """快速排序算法"""
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)

# 使用示例
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)
print(f"排序结果: {sorted_numbers}")
\`\`\`

**时间复杂度**: O(n log n)
**空间复杂度**: O(log n)

这是一种**分治算法**，通过选择一个"基准"元素将数组分成两部分，递归地进行排序。`
  }
])

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
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 200) + 'px'
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

  // Simulate AI response
  isLoading.value = true

  setTimeout(() => {
    const assistantMessage = {
      id: String(messages.value.length + 1),
      role: 'assistant',
      content: `这是对"${content}"的响应。\n\n我可以帮助你解答问题、提供信息或协助完成各种任务。`,
      streaming: true
    }
    messages.value.push(assistantMessage)
    isLoading.value = false

    nextTick(() => {
      scrollToBottom()
    })
  }, 1000)
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

<style scoped src="./styles.css"></style>
<style src="./styles.css"></style>
