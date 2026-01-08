import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue'

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
const fileInputRef = ref(null) // 文件上传输入框引用

// 侧边栏状态
const sidebarVisible = ref(true)

// 滚动按钮状态
const showScrollButton = ref(false)
const scrollButtonTarget = ref('bottom') // 'top' | 'bottom'

// 切换侧边栏
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

// 可复选的功能配置
const featureButtons = [
  {
    id: 'deepThink',
    label: '深度思考',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="M1 12h6m6 0h6"/></svg>',
    enabled: true,
    visible: true
  },
  {
    id: 'search',
    label: '搜索',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    enabled: true,
    visible: true
  }
]

// 聊天模式配置（单选）
const chatModes = [
  {
    id: 'chat',
    label: '智能问答',
    description: '深度理解，智能对话',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    enabled: true,
    visible: true
  },
  {
    id: 'markdown',
    label: 'Markdown格式',
    description: 'AI会完成你的任务并以Markdown方式输出结论',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    enabled: true,
    visible: true
  },
  {
    id: 'web',
    label: '网页模式',
    description: 'AI会完成你的任务并以网页方式输出结论',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    enabled: true,
    visible: true
  },
  {
    id: 'ppt',
    label: 'PPT格式',
    description: 'AI会完成你的任务并以PPT方式输出结论',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    enabled: true,
    visible: true
  }
]

// 启用的功能（可复选）
const enabledFeatures = ref([])

// 当前选中的聊天模式（单选）
const currentChatMode = ref('chat') // 默认选中第一个：智能问答

// 获取可见的功能按钮
const visibleFeatureButtons = computed(() => {
  return featureButtons.filter(btn => btn.enabled && btn.visible)
})

// 获取可见的聊天模式
const visibleChatModes = computed(() => {
  // 如果会话已有消息，只显示当前选中的模式（不允许中途切换）
  if (messages.value.length > 0) {
    return chatModes.filter(mode => mode.id === currentChatMode.value && mode.enabled)
  }
  // 如果会话没有消息，显示所有可用模式让用户选择
  return chatModes.filter(mode => mode.enabled && mode.visible)
})

// 获取当前聊天模式的标签
const currentModeLabel = computed(() => {
  const mode = chatModes.find(m => m.id === currentChatMode.value)
  return mode ? mode.label : ''
})

// 获取当前聊天模式的说明
const getModeDescription = (modeId) => {
  const mode = chatModes.find(m => m.id === modeId)
  return mode ? mode.description : ''
}

let messageIdCounter = 0
let conversationIdCounter = 0
let eventSource = null

// 创建唯一 ID
const createId = () => `msg_${++messageIdCounter}`
const createConversationId = () => `conv_${++conversationIdCounter}`

// 是否有活跃会话且有消息（用于判断是否显示消息区域）
// 如果选中了会话但没有消息，仍然显示欢迎页面
const hasActiveChat = computed(() => !!activeConversationId.value && messages.value.length > 0)

// 是否应该将输入框显示在底部（与 hasActiveChat 一致）
const shouldShowInputAtBottom = computed(() => {
  return hasActiveChat.value
})

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

// 创建新会话（点击按钮时只返回欢迎页面，不创建会话记录）
const createConversation = () => {
  // 清除当前选中会话，返回欢迎页面
  activeConversationId.value = null
  messages.value = []

  // 重置模式为智能问答
  currentChatMode.value = 'chat'

  // 清空所有功能按钮的选中状态（深度思考、搜索等）
  enabledFeatures.value = []

  // 聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
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

// 清空当前会话
const clearCurrentConversation = () => {
  if (!activeConversationId.value) return
  messages.value = []
  const conv = conversations.value.find(c => c.id === activeConversationId.value)
  if (conv) {
    conv.messages = []
    conv.updatedAt = Date.now()
  }
}

// 停止生成
const stopGeneration = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  isSending.value = false
  isThinking.value = false
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
      // 滚动后检查按钮状态
      setTimeout(() => {
        checkScrollPosition()
      }, 100)
    }
  })
}

// 发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isSending.value) return

  // 如果没有活跃会话，先创建实际的会话对象
  if (!hasActiveChat.value) {
    const newConv = {
      id: createConversationId(),
      title: '新对话',
      preview: '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    conversations.value.unshift(newConv)
    activeConversationId.value = newConv.id
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
    // 测试消息：模拟流式响应展示各种消息类型
    await mockStreamResponse(content, aiMessage)
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

// 模拟流式响应用于测试展示
const mockStreamResponse = async (prompt, aiMessage) => {
  return new Promise((resolve) => {
    let step = 0

    const simulateSteps = async () => {
      // 步骤1: 添加思考内容
      if (step === 0) {
        aiMessage.thinking = `正在分析您的问题："${prompt}"...

我需要：
1. 理解问题的核心意图
2. 确定需要使用的工具
3. 制定合适的解决方案

让我思考一下最佳的处理方式...`
        scrollToBottom()
        step++
        setTimeout(simulateSteps, 800)
        return
      }

      // 步骤2: 添加工具调用
      if (step === 1) {
        aiMessage.tools.push({
          id: createId(),
          name: 'search',
          status: 'calling',
          input: { query: prompt },
          output: null
        })
        scrollToBottom()
        step++
        setTimeout(simulateSteps, 600)
        return
      }

      // 步骤3: 工具调用完成
      if (step === 2) {
        aiMessage.tools[0].status = 'completed'
        aiMessage.tools[0].output = `找到 ${Math.floor(Math.random() * 10 + 5)} 条相关结果`
        scrollToBottom()
        step++
        setTimeout(simulateSteps, 500)
        return
      }

      // 步骤4: 添加普通内容（流式）
      if (step === 3) {
        const responseText = `根据您的查询，我为您找到了以下信息：

## 主要结论

这是一个测试消息，用于展示 **思考过程**、**工具调用** 和 **普通内容** 的显示效果。

### 功能说明

1. **思考消息** - 可以展开/折叠查看 AI 的思考过程
2. **工具调用** - 显示工具的执行状态和结果
3. **普通内容** - 支持 Markdown 格式的回复内容

### 样式特点

- 采用水墨画风格设计
- 支持代码块、列表、标题等 Markdown 元素
- 平滑的动画过渡效果

希望这个演示能帮助您了解消息的各种显示样式！`

        // 模拟逐字输出
        let charIndex = 0
        const typeChar = () => {
          if (charIndex < responseText.length) {
            aiMessage.content += responseText[charIndex]
            charIndex++
            scrollToBottom()
            setTimeout(typeChar, 20) // 每20ms输出一个字符
          } else {
            aiMessage.isStreaming = false
            updateConversationPreview(null, responseText.substring(0, 50) + '...')
            resolve()
          }
        }
        typeChar()
        return
      }
    }

    simulateSteps()
  })
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

      // 调整消息容器高度
      adjustMessagesContainerHeight()
    })
  }
}

// 动态调整消息容器高度
const adjustMessagesContainerHeight = () => {
  if (!messagesContainer.value || !inputRef.value) return

  const textarea = inputRef.value
  const textareaHeight = textarea.offsetHeight || textarea.scrollHeight
  const inputAreaHeight = 80 // 输入框基础高度（发送按钮 + 工具栏 + 边距）

  // 计算消息容器需要预留的空间
  const reservedSpace = textareaHeight + inputAreaHeight + 40 // 额外空间

  // 更新消息容器的最大高度
  messagesContainer.value.style.maxHeight = 'calc(100% - ' + reservedSpace + 'px)'

  // 调整高度后重新检查滚动位置
  nextTick(() => {
    checkScrollPosition()
  })
}

// 切换功能（可复选）
const toggleFeature = (featureId) => {
  const index = enabledFeatures.value.indexOf(featureId)
  if (index > -1) {
    enabledFeatures.value.splice(index, 1) // 取消选中
  } else {
    enabledFeatures.value.push(featureId) // 添加选中
  }
}

// 切换聊天模式（单选）
const switchChatMode = (modeId) => {
  currentChatMode.value = modeId
}

// 判断功能是否启用
const isFeatureEnabled = (featureId) => {
  return enabledFeatures.value.includes(featureId)
}

// 判断模式是否选中
const isModeActive = (modeId) => {
  return currentChatMode.value === modeId
}

// 判断是否使用分栏布局（markdown、网页模式、PPT格式 + 已有消息）
const isSplitLayoutMode = computed(() => {
  // 只有在已有消息且模式为分栏模式时才使用分栏布局
  return messages.value.length > 0 && ['markdown', 'web', 'ppt'].includes(currentChatMode.value)
})

// 获取最后一条 AI 消息的内容（用于分栏布局右侧渲染）
const lastAiContent = computed(() => {
  const aiMessages = messages.value.filter(m => m.role === 'assistant' && m.content)
  return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].content : ''
})

// 获取最后一条 AI 消息对象（用于分栏布局右侧渲染）
const lastAiMessage = computed(() => {
  const aiMessages = messages.value.filter(m => m.role === 'assistant' && m.content)
  return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null
})

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
    // 滚动后检查按钮状态
    setTimeout(() => checkScrollPosition(), 400)
  }
}

// 滚动到底部
const scrollToBottomSmooth = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
    // 滚动后检查按钮状态
    setTimeout(() => checkScrollPosition(), 400)
  }
}

// 处理滚动按钮点击
const handleScrollButtonClick = () => {
  if (scrollButtonTarget.value === 'bottom') {
    scrollToBottomSmooth()
  } else {
    scrollToTop()
  }
}

// 检测滚动位置并更新按钮状态
const checkScrollPosition = () => {
  if (!messagesContainer.value) return

  const container = messagesContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  // 计算距离底部的距离
  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  const distanceToTop = scrollTop

  // 判断是否有可滚动内容（内容超出容器高度）
  const hasScrollableContent = scrollHeight > clientHeight + 10

  // 没有可滚动内容时隐藏按钮
  if (!hasScrollableContent) {
    showScrollButton.value = false
    return
  }

  // 只要有可滚动内容，就显示按钮
  showScrollButton.value = true

  // 根据当前位置决定箭头方向
  // 如果在顶部（距顶部小于50px），显示向下箭头（回到底部）
  // 如果在底部（距底部小于50px），显示向上箭头（回到顶部）
  // 否则根据位置判断
  if (distanceToTop < 50) {
    // 在顶部附近，显示向下箭头
    scrollButtonTarget.value = 'bottom'
  } else if (distanceToBottom < 50) {
    // 在底部附近，显示向上箭头
    scrollButtonTarget.value = 'top'
  } else {
    // 在中间位置，根据距离判断
    scrollButtonTarget.value = distanceToTop > distanceToBottom ? 'bottom' : 'top'
  }
}

// 滚动事件处理
const handleScroll = () => {
  checkScrollPosition()
}

onMounted(() => {
  // 初始化时聚焦输入框
  inputRef.value?.focus()
  // 初始化输入框高度
  adjustTextareaHeight()
  // 添加滚动监听器
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.addEventListener('scroll', handleScroll)
      checkScrollPosition()
    }
    // 初始化消息容器高度
    adjustMessagesContainerHeight()
  })
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
  // 移除滚动监听器
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
})

// 导出所有需要在模板中使用的变量和函数
export {
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
  isSplitLayoutMode,
  lastAiContent,
  lastAiMessage,
  shouldShowInputAtBottom,
  toggleFeature,
  switchChatMode,
  hasActiveChat,
  currentTitle,
  inputPlaceholder,
  createConversation,
  selectConversation,
  deleteConversation,
  renameConversation,
  clearCurrentConversation,
  stopGeneration,
  toggleThinking,
  sendMessage,
  handleInput,
  handleAttachment,
  showScrollButton,
  scrollButtonTarget,
  handleScrollButtonClick
}
