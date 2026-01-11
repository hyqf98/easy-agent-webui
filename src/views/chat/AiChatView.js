import {ChatMode, sseChatService, SseMessageType, ToolStatus} from '@/services/sseService.js'
import {generateMessageId, generateSessionId, generateRequestId, generateToolId} from '@/utils/idGenerator.js'
import { useSettings } from '@/composables/useSettings.js'

// 获取设置相关的状态
const { selectedModel, currentModelInfo } = useSettings()

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
const leftMessagesAreaRef = ref(null)
const rightContentWrapperRef = ref(null) // 右侧内容区域引用

// 模式和功能状态
const fileInputRef = ref(null)

// 侧边栏状态
const sidebarVisible = ref(true)

// 滚动按钮状态
const showScrollButton = ref(false)
const scrollButtonTarget = ref('bottom')

// 左侧消息区域滚动按钮状态
const showLeftScrollButton = ref(false)
const leftScrollButtonTarget = ref('bottom')

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
    label: 'Markdown模式',
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
    label: 'PPT模式',
    description: 'AI会完成你的任务并以PPT方式输出结论',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    enabled: true,
    visible: true
  }
]

// 启用的功能（可复选）
const enabledFeatures = ref([])

// 当前选中的聊天模式（单选）
const currentChatMode = ref('chat')

// 获取可见的功能按钮
const visibleFeatureButtons = computed(() => {
  return featureButtons.filter(btn => btn.enabled && btn.visible)
})

// 获取可见的聊天模式
const visibleChatModes = computed(() => {
  if (messages.value.length > 0) {
    return chatModes.filter(mode => mode.id === currentChatMode.value && mode.enabled)
  }
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
// 创建唯一 ID - 使用新的 ID 生成器
const createId = () => generateMessageId()
const createConversationId = () => generateSessionId()

// 是否有活跃会话且有消息
const hasActiveChat = computed(() => !!activeConversationId.value && messages.value.length > 0)

// 是否应该将输入框显示在底部
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

// 创建新会话
const createConversation = () => {
  activeConversationId.value = null
  messages.value = []
  currentChatMode.value = 'chat'
  enabledFeatures.value = []

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
    if (conv.mode) {
      currentChatMode.value = conv.mode
    }
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

// 更新会话模式
const updateConversationMode = (id, mode) => {
  const conv = conversations.value.find(c => c.id === id)
  if (conv) {
    conv.mode = mode
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
  sseChatService.disconnect()
  isSending.value = false
  isThinking.value = false

  if (messages.value.length > 0) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
      lastMessage.isStreaming = false
    }
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
    // 分栏模式：滚动左侧消息区域
    if (isSplitLayoutMode.value && leftMessagesAreaRef.value) {
      leftMessagesAreaRef.value.scrollTop = leftMessagesAreaRef.value.scrollHeight
      setTimeout(() => {
        checkLeftScrollPosition()
      }, 100)
    }
    // 普通模式：滚动主消息容器
    else if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      setTimeout(() => {
        checkScrollPosition()
      }, 100)
    }
  })
}

// 滚动右侧面板到底部（Markdown/网页/PPT模式）
const scrollRightPanelToBottom = () => {
  nextTick(() => {
    if (rightContentWrapperRef.value) {
      rightContentWrapperRef.value.scrollTop = rightContentWrapperRef.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isSending.value) return

  if (!hasActiveChat.value) {
    const newConv = {
      id: createConversationId(),
      title: '新对话',
      preview: '',
      messages: [],
      mode: currentChatMode.value,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    conversations.value.unshift(newConv)
    activeConversationId.value = newConv.id
  }

  const userMessage = {
    id: createId(),
    role: 'user',
    content
  }
  messages.value.push(userMessage)
  inputMessage.value = ''

  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  isSending.value = true
  isThinking.value = true

  updateConversationPreview(content, content)
  scrollToBottom()

  const aiMessage = {
    id: createId(),
    role: 'assistant',
    content: '正在研墨思索...',
    thinking: null,
    tools: [],
    isStreaming: true
  }
  messages.value.push(aiMessage)

  try {
    await streamResponse(content, aiMessage)
  } catch (error) {
    aiMessage.content = '抱歉，墨迹未干，请稍后再试'
    aiMessage.isStreaming = false
  } finally {
    isSending.value = false
    isThinking.value = false
    scrollToBottom()
  }
}

// SSE 流式响应处理
const streamResponse = async (prompt, aiMessage) => {
  // 生成或获取 sessionId
  let sessionId = activeConversationId.value
  if (!sessionId) {
    sessionId = generateSessionId()
    // 更新当前会话ID
    const currentConv = conversations.value.find(c => c.id === activeConversationId.value)
    if (currentConv) {
      currentConv.id = sessionId
      activeConversationId.value = sessionId
    }
  }

  // 生成 requestId
  const requestId = generateRequestId()

  const request = {
    userQuery: prompt,
    sessionId: sessionId,
    requestId: requestId,
    mode: currentChatMode.value === 'chat' ? ChatMode.CHAT :
          currentChatMode.value === 'markdown' ? ChatMode.MARKDOWN :
          currentChatMode.value === 'web' ? ChatMode.HTML :
          currentChatMode.value === 'ppt' ? ChatMode.PPT : ChatMode.CHAT,
    additionalFeatures: enabledFeatures.value.map(f => {
      if (f === 'deepThink') return 'deep_thinking'
      if (f === 'search') return 'deep_search'
      return null
    }).filter(Boolean),
    // 模型配置
    modelProvider: selectedModel.value.providerId,
    modelId: selectedModel.value.modelId
  }

  // 初始化工具调用映射
  const toolCallMap = new Map()

  // 使用新的 SSE 处理器
  // 标记是否已接收过真实内容
  let hasReceivedContent = false

  await sseChatService.connect(request, {
    // 处理思考消息
    onThinking: (message) => {
      if (message.content) {
        aiMessage.thinking = message.content
        aiMessage._lastUpdate = Date.now()
      }
    },

    // 处理工具调用开始
    onToolCallStart: (message) => {
      const toolId = generateToolId()
      const toolCall = {
        id: toolId,
        name: message.toolName || 'Unknown',
        status: ToolStatus.CALLING,
        input: message.input || '',
        output: null
      }
      toolCallMap.set(message.toolName, toolId)
      aiMessage.tools.push(toolCall)
      aiMessage._lastUpdate = Date.now()
    },

    // 处理工具调用结果
    onToolCallResult: (message) => {
      const toolId = toolCallMap.get(message.toolName)
      if (toolId) {
        const tool = aiMessage.tools.find(t => t.id === toolId)
        if (tool) {
          tool.status = message.success ? ToolStatus.SUCCESS : ToolStatus.FAILED
          tool.output = message.result || ''
        }
      }
      aiMessage._lastUpdate = Date.now()
    },

    // 处理内容块
    onContentChunk: (message) => {
      if (message.content) {
        // 首次接收内容时，清空默认提示
        if (!hasReceivedContent) {
          aiMessage.content = ''
          hasReceivedContent = true
        }
        aiMessage.content += message.content
        aiMessage._lastUpdate = Date.now()
      }
    },

    // 处理完成
    onCompleted: (message) => {
      aiMessage.isStreaming = false
      isThinking.value = false
      aiMessage._lastUpdate = Date.now()

      // 更新会话预览
      if (aiMessage.content && hasReceivedContent) {
        updateConversationPreview(aiMessage.content)
      }
    },

    // 处理错误
    onError: (message) => {
      aiMessage.content = '抱歉，墨迹未干，请稍后再试'
      aiMessage.isStreaming = false
      isThinking.value = false
      aiMessage._lastUpdate = Date.now()
    }
  })
}

// 处理输入事件并动态调整高度
const handleInput = () => {
  adjustTextareaHeight()
}

// 自动调整输入框高度
const adjustTextareaHeight = () => {
  if (inputRef.value) {
    const textarea = inputRef.value

    requestAnimationFrame(() => {
      textarea.style.height = 'auto'
      textarea.scrollHeight

      const lineHeight = 28
      const maxHeight = lineHeight * 6
      const scrollHeight = textarea.scrollHeight
      let targetHeight = Math.max(lineHeight, Math.min(scrollHeight, maxHeight))

      textarea.style.height = targetHeight + 'px'
      adjustMessagesContainerHeight()
    })
  }
}

// 动态调整消息容器高度
const adjustMessagesContainerHeight = () => {
  if (!messagesContainer.value) return

  if (isSplitLayoutMode.value) {
    messagesContainer.value.style.maxHeight = ''
    messagesContainer.value.style.height = ''
    return
  }

  if (!inputRef.value) return

  const textarea = inputRef.value
  const textareaHeight = textarea.offsetHeight || textarea.scrollHeight
  const inputAreaHeight = 80
  const reservedSpace = textareaHeight + inputAreaHeight + 40

  messagesContainer.value.style.maxHeight = 'calc(100% - ' + reservedSpace + 'px)'

  nextTick(() => {
    checkScrollPosition()
  })
}

// 切换功能（可复选）
const toggleFeature = (featureId) => {
  const index = enabledFeatures.value.indexOf(featureId)
  if (index > -1) {
    enabledFeatures.value.splice(index, 1)
  } else {
    enabledFeatures.value.push(featureId)
  }
}

// 切换聊天模式（单选）
const switchChatMode = (modeId) => {
  currentChatMode.value = modeId
  if (activeConversationId.value) {
    updateConversationMode(activeConversationId.value, modeId)
  }
  // 切换模式后重新调整容器高度
  nextTick(() => {
    adjustMessagesContainerHeight()
  })
}

// 判断功能是否启用
const isFeatureEnabled = (featureId) => {
  return enabledFeatures.value.includes(featureId)
}

// 判断模式是否选中
const isModeActive = (modeId) => {
  return currentChatMode.value === modeId
}

// 判断是否使用分栏布局
const isSplitLayoutMode = computed(() => {
  return messages.value.length > 0 && ['markdown', 'web', 'ppt'].includes(currentChatMode.value)
})

// 获取最后一条 AI 消息的内容
const lastAiContent = computed(() => {
  const aiMessages = messages.value.filter(m => m.role === 'assistant' && m.content)
  return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].content : ''
})

// 获取最后一条 AI 消息对象
const lastAiMessage = computed(() => {
  const aiMessages = messages.value.filter(m => m.role === 'assistant' && m.content)
  return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null
})

// 处理附件上传
const handleAttachment = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,.pdf,.doc,.docx,.txt'
  input.multiple = true
  input.onchange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
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

// 处理左侧滚动按钮点击
const handleLeftScrollButtonClick = () => {
  if (!leftMessagesAreaRef.value) return

  if (leftScrollButtonTarget.value === 'bottom') {
    leftMessagesAreaRef.value.scrollTo({
      top: leftMessagesAreaRef.value.scrollHeight,
      behavior: 'smooth'
    })
  } else {
    leftMessagesAreaRef.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  setTimeout(() => checkLeftScrollPosition(), 400)
}

// 检测滚动位置并更新按钮状态
const checkScrollPosition = () => {
  if (!messagesContainer.value) return

  const container = messagesContainer.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  const distanceToTop = scrollTop
  const hasScrollableContent = scrollHeight > clientHeight + 10

  if (!hasScrollableContent) {
    showScrollButton.value = false
    return
  }

  showScrollButton.value = true

  if (distanceToTop < 50) {
    scrollButtonTarget.value = 'bottom'
  } else if (distanceToBottom < 50) {
    scrollButtonTarget.value = 'top'
  } else {
    scrollButtonTarget.value = distanceToTop > distanceToBottom ? 'bottom' : 'top'
  }
}

// 检测左侧消息区域滚动位置并更新按钮状态
const checkLeftScrollPosition = () => {
  if (!leftMessagesAreaRef.value) return

  const container = leftMessagesAreaRef.value
  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  const distanceToBottom = scrollHeight - scrollTop - clientHeight
  const distanceToTop = scrollTop
  const hasScrollableContent = scrollHeight > clientHeight + 1

  if (!hasScrollableContent) {
    showLeftScrollButton.value = false
    return
  }

  showLeftScrollButton.value = true

  if (distanceToTop < 50) {
    leftScrollButtonTarget.value = 'bottom'
  } else if (distanceToBottom < 50) {
    leftScrollButtonTarget.value = 'top'
  } else {
    leftScrollButtonTarget.value = distanceToTop > distanceToBottom ? 'bottom' : 'top'
  }
}

// 滚动事件处理
const handleScroll = () => {
  checkScrollPosition()
}

// 左侧消息区域滚动事件处理
const handleLeftScroll = () => {
  checkLeftScrollPosition()
}

// 监听右侧内容变化，自动滚动到底部（Markdown/网页/PPT模式）
watch(lastAiContent, () => {
  if (isSplitLayoutMode.value) {
    scrollRightPanelToBottom()
    // 左侧消息列表也滚动到底部
    nextTick(() => {
      if (leftMessagesAreaRef.value) {
        leftMessagesAreaRef.value.scrollTop = leftMessagesAreaRef.value.scrollHeight
        setTimeout(() => checkLeftScrollPosition(), 100)
      }
    })
  }
})

// 监听消息列表变化，左侧面板自动滚动到底部
watch(messages, () => {
  // 分栏模式：滚动左侧消息区域
  if (isSplitLayoutMode.value && leftMessagesAreaRef.value) {
    nextTick(() => {
      setTimeout(() => {
        leftMessagesAreaRef.value.scrollTop = leftMessagesAreaRef.value.scrollHeight
        checkLeftScrollPosition()
      }, 100)
    })
  }
  // 普通模式：滚动主消息容器
  else if (messagesContainer.value) {
    nextTick(() => {
      setTimeout(() => {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        checkScrollPosition()
      }, 100)
    })
  }
}, { deep: true })

// 监听模式切换，滚动右侧面板到底部
watch(isSplitLayoutMode, (isSplit) => {
  if (isSplit) {
    nextTick(() => {
      scrollRightPanelToBottom()
      // 左侧消息列表滚动到底部
      if (leftMessagesAreaRef.value) {
        setTimeout(() => {
          leftMessagesAreaRef.value.scrollTop = leftMessagesAreaRef.value.scrollHeight
        }, 100)
      }
    })
  }
})

onMounted(() => {
  inputRef.value?.focus()
  adjustTextareaHeight()

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.addEventListener('scroll', handleScroll)
      checkScrollPosition()
    }

    if (leftMessagesAreaRef.value && isSplitLayoutMode.value) {
      leftMessagesAreaRef.value.addEventListener('scroll', handleLeftScroll)
      leftMessagesAreaRef.value.dataset.hasScrollListener = 'true'
      setTimeout(() => checkLeftScrollPosition(), 100)
    }

    adjustMessagesContainerHeight()
  })
})

onUnmounted(() => {
  sseChatService.disconnect()

  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }

  if (leftMessagesAreaRef.value) {
    leftMessagesAreaRef.value.removeEventListener('scroll', handleLeftScroll)
    delete leftMessagesAreaRef.value.dataset.hasScrollListener
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
  checkScrollPosition,
  checkLeftScrollPosition,
  handleScroll,
  handleLeftScroll,
  showScrollButton,
  scrollButtonTarget,
  handleScrollButtonClick,
  leftMessagesAreaRef,
  showLeftScrollButton,
  leftScrollButtonTarget,
  handleLeftScrollButtonClick,
  rightContentWrapperRef,
  // 模型相关状态
  selectedModel,
  currentModelInfo
}
