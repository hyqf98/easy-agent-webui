/**
 * 聊天状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { chatApi } from '@/api/chat'
import { modelApi } from '@/api/model'
import { sessionApi } from '@/api/session'
import { messageApi } from '@/api/message'
import { mcpApi } from '@/api/mcp'
import { ElMessage } from 'element-plus'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const sessions = ref([])
  const currentSessionId = ref(null)
  const messages = ref([])
  const isLoading = ref(false)
  const selectedModelId = ref(null)
  const models = ref([])
  const abortController = ref(null)
  const sidebarCollapsed = ref(false)

  // MCP 工具选择器相关状态
  const mcpConfigs = ref([])           // MCP 配置列表
  const selectedToolIds = ref([])      // 用户选中的 MCP 配置 ID 列表
  const mcpLoading = ref(false)        // MCP 列表加载状态
  const mcpError = ref(null)           // MCP 加载错误信息

  // 聊天模式相关状态
  const chatMode = ref('chat')         // 当前选中的聊天模式，默认智能问答

  // 聊天模式选项
  const chatModeOptions = [
    { value: 'chat', label: '智能问答', icon: '💬' },
    { value: 'brainstorming', label: '头脑风暴', icon: '🧠' },
    { value: 'ppt', label: 'PPT', icon: '📊' },
    { value: 'html', label: '网页', icon: '🌐' }
  ]

  // 计算属性
  const currentSession = computed(() => {
    return sessions.value.find(s => s.id === currentSessionId.value)
  })

  const sessionMessages = computed(() => {
    return messages.value.filter(m => m.sessionId === currentSessionId.value)
  })

  // MCP 工具选择器相关计算属性
  const selectedToolsCount = computed(() => selectedToolIds.value.length)

  // 判断是否可以修改聊天模式（当前会话没有消息时可以修改）
  const canChangeChatMode = computed(() => {
    const currentMsgs = sessionMessages.value
    // 只要有消息就固定模式，新会话可以修改
    return currentMsgs.length === 0
  })

  // 初始化
  async function init() {
    // 加载会话列表
    await loadSessions()
  }

  // 加载会话列表
  async function loadSessions() {
    try {
      const list = await sessionApi.list()
      // 转换 createTime 为时间戳（毫秒数）
      sessions.value = (list || []).map(session => ({
        ...session,
        createdAt: session.createTime ? new Date(session.createTime).getTime() : Date.now()
      }))

      // 如果没有会话，创建一个默认会话
      if (sessions.value.length === 0) {
        await createSession()
      } else if (!currentSessionId.value) {
        setCurrentSession(sessions.value[0].id)
      }
    } catch (error) {
      console.error('Load sessions error:', error)
    }
  }

  // 加载会话消息
  async function loadSessionMessages(sessionId) {
    try {
      const list = await messageApi.listBySessionId(sessionId)
      // 转换为前端消息格式
      messages.value = list.map(msg => ({
        id: msg.id.toString(),
        sessionId: msg.sessionId,
        type: msg.type,
        content: msg.content,
        status: msg.status,
        timestamp: new Date(msg.createTime).getTime()
      }))
    } catch (error) {
      console.error('Load messages error:', error)
    }
  }

  // 创建新会话（本地临时会话，不保存到后端）
  function createSession(id = null) {
    if (id) {
      // 如果有 ID，设置已有会话
      setCurrentSession(id)
      return sessions.value.find(s => s.id === id)
    }

    // 创建临时会话（未保存到后端）
    const tempSession = {
      id: uuidv4(),
      title: '新对话',
      modelId: selectedModelId.value,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      _unsaved: true // 标记为未保存
    }

    // 添加到会话列表开头
    sessions.value.unshift(tempSession)
    currentSessionId.value = tempSession.id
    messages.value = []

    return tempSession
  }

  // 设置当前会话
  async function setCurrentSession(id) {
    currentSessionId.value = id
    // 加载会话消息
    await loadSessionMessages(id)
  }

  // 添加消息
  function addMessage(message) {
    const msg = {
      ...message,
      sessionId: currentSessionId.value,
    }
    messages.value.push(msg)

    // 更新会话标题（使用第一条用户消息）
    if (message.type === 'user') {
      updateSessionTitle(message.content)
    }

    return msg
  }

  // 更新会话标题
  function updateSessionTitle(content) {
    const session = currentSession.value
    if (session && session.title === '新对话') {
      session.title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
      session.updatedAt = Date.now()
    }
  }

  // 处理 SSE 消息
  function handleSseMessage(data) {
    const { type, content, messageId, requestId } = data

    switch (type) {
      case 'content_chunk':
        // 内容块 - 流式追加（后端返回的格式）
        // content 格式: { modelName: "", text: "xxx" }
        const chunkText = content?.text || ''
        const msgId = `${messageId || requestId || uuidv4()}-${type}`

        // 检测是否为完成标记
        if (chunkText === '<DONE>') {
          const existingMsg = messages.value.find(m => m.id === msgId)
          if (existingMsg) {
            existingMsg.status = 'completed'
          }
          break
        }

        const existingChunkMsg = messages.value.find(m => m.id === msgId)
        if (existingChunkMsg) {
          // 追加内容
          existingChunkMsg.content += chunkText
          existingChunkMsg.status = 'streaming'
        } else {
          // 新建消息，保留 content_chunk 类型
          addMessage({
            id: msgId,
            type: 'content_chunk',
            content: chunkText,
            status: 'streaming',
          })
        }
        break

      case 'thinking':
        // 深度思考 - 使用 messageId + type 作为唯一标识
        const thinkingText = content?.text || content || ''
        const thinkingMsgId = `${messageId}-${type}`

        // 检测是否为完成标记
        if (thinkingText === '<DONE>') {
          const existingMsg = messages.value.find(m => m.id === thinkingMsgId)
          if (existingMsg) {
            existingMsg.status = 'completed'
          }
          break
        }

        const existingThinking = messages.value.find(m => m.id === thinkingMsgId)
        if (existingThinking) {
          // 追加内容
          existingThinking.content += thinkingText
          existingThinking.status = 'streaming'
        } else {
          // 新建消息
          addMessage({
            id: thinkingMsgId,
            type: 'thinking',
            content: thinkingText,
            status: 'streaming',
          })
        }
        break

      case 'tool_through':
        // 工具思考 - 使用 messageId + type 作为唯一标识
        const toolThroughText = content?.text || content || ''
        const toolThroughMsgId = `${messageId}-${type}`

        // 检测是否为完成标记
        if (toolThroughText === '<DONE>') {
          const existingMsg = messages.value.find(m => m.id === toolThroughMsgId)
          if (existingMsg) {
            existingMsg.status = 'completed'
          }
          break
        }

        const existingToolThrough = messages.value.find(m => m.id === toolThroughMsgId)
        if (existingToolThrough) {
          // 追加内容
          existingToolThrough.content += toolThroughText
          existingToolThrough.status = 'streaming'
        } else {
          // 新建消息
          addMessage({
            id: toolThroughMsgId,
            type: 'tool_through',
            content: toolThroughText,
            status: 'streaming',
          })
        }
        break

      case 'final_answer':
        // 最终答案 - 使用 messageId + type 作为唯一标识
        const answerText = content?.text || content || ''
        const finalAnswerMsgId = `${messageId}-${type}`

        // 检测是否为完成标记
        if (answerText === '<DONE>') {
          const existingMsg = messages.value.find(m => m.id === finalAnswerMsgId)
          if (existingMsg) {
            existingMsg.status = 'completed'
          }
          break
        }

        const existingMsg = messages.value.find(m => m.id === finalAnswerMsgId)
        if (existingMsg) {
          // 追加内容
          existingMsg.content += answerText
          existingMsg.status = 'streaming'
        } else {
          // 新建消息
          addMessage({
            id: finalAnswerMsgId,
            type: 'final_answer',
            content: answerText,
            status: 'streaming',
          })
        }
        break

      case 'tool_call':
        // 工具调用
        // 使用 content.id 作为工具调用的唯一标识符，而不是 messageId
        const toolCallId = content?.id || `${messageId}-${type}`
        const existingToolCall = messages.value.find(m => m.id === toolCallId)
        if (existingToolCall) {
          // 更新工具调用状态
          existingToolCall.content = { ...existingToolCall.content, ...content }
          if (content.status === 'success' || content.status === 'failed') {
            existingToolCall.status = 'completed'
          }
        } else {
          // 新建工具调用
          addMessage({
            id: toolCallId,
            type: 'tool_call',
            content,
            status: content.status === 'calling' ? 'pending' : 'completed',
          })
        }
        break

      case 'completed':
        // 完成标记 - 将所有该 messageId 相关的消息标记为完成
        // 注意：completed 类型的消息不应该被渲染，只是状态标记
        const baseMsgId = messageId || requestId
        // 查找所有以该 baseMsgId 开头的消息并更新状态
        messages.value
          .filter(m => m.id && m.id.startsWith(baseMsgId))
          .forEach(m => {
            m.status = 'completed'
          })

        // 检查是否有 final_answer 消息，如果没有则创建一个空的
        const hasFinalAnswer = messages.value.some(m =>
          m.id && m.id.startsWith(baseMsgId) && m.type === 'final_answer'
        )
        if (!hasFinalAnswer) {
          addMessage({
            id: `${baseMsgId}-final_answer`,
            type: 'final_answer',
            content: '',
            status: 'completed',
          })
        }

        isLoading.value = false
        break

      case 'error':
        // 错误消息
        addMessage({
          id: `${messageId || uuidv4()}-${type}`,
          type: 'error',
          content: content.message || '发生错误',
          status: 'completed',
        })
        isLoading.value = false
        break
    }
  }

  // 添加错误消息
  function addError(errorMessage) {
    addMessage({
      id: uuidv4(),
      type: 'error',
      content: errorMessage,
      status: 'completed',
    })
  }

  // 加载模型列表
  async function loadModels() {
    try {
      const data = await modelApi.getEnabledModels()
      models.value = data || []

      // 如果没有选中模型且有默认模型，选中默认模型
      if (!selectedModelId.value && models.value.length > 0) {
        const defaultModel = models.value.find(m => m.isDefault) || models.value[0]
        selectedModelId.value = defaultModel.id
      }
    } catch (error) {
      console.error('Load models error:', error)
    }
  }

  // 设置选中的模型
  function setSelectedModel(modelId) {
    selectedModelId.value = modelId
  }

  // 获取当前选中的模型
  const selectedModel = computed(() => {
    return models.value.find(m => m.id === selectedModelId.value)
  })

  // 发送消息
  async function sendMessage({ modelId, message, toolIds, files }) {
    if (!message.trim() || isLoading.value) return

    const actualModelId = modelId || selectedModelId.value
    if (!actualModelId) {
      addError('请先选择模型')
      return
    }

    isLoading.value = true

    let sessionId = currentSessionId.value
    const currentSessionObj = currentSession.value

    // 如果当前会话是临时会话（未保存），先创建会话
    if (currentSessionObj && currentSessionObj._unsaved) {
      try {
        await sessionApi.create(actualModelId, chatMode.value)
        // 重新加载会话列表
        await loadSessions()
        // 获取新创建的会话（应该是第一个）
        sessionId = sessions.value[0].id
        currentSessionId.value = sessionId
      } catch (error) {
        console.error('Create session error:', error)
        addError('创建会话失败')
        isLoading.value = false
        return
      }
    }

    // 如果还是没有会话ID，生成新的
    if (!sessionId) {
      sessionId = uuidv4()
      currentSessionId.value = sessionId
    }

    const requestId = uuidv4()

    // 添加用户消息
    addMessage({
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: Date.now(),
    })

    try {
      abortController.value = new AbortController()

      await chatApi.streamChat(
        {
          modelId: actualModelId,
          message,
          sessionId,
          requestId,
          toolIds,
          files,
        },
        handleSseMessage,
        addError,
        abortController.value.signal
      )
    } catch (error) {
      console.error('[chat store] 发送消息出错:', error)
      addError(error.message)
    } finally {
      isLoading.value = false
      abortController.value = null
    }
  }

  // 取消发送
  function cancelSend() {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    isLoading.value = false
  }

  // 删除会话
  async function deleteSession(id) {
    try {
      await sessionApi.remove([id])

      const index = sessions.value.findIndex(s => s.id === id)
      if (index > -1) {
        sessions.value.splice(index, 1)
      }

      // 如果删除的是当前会话，切换到其他会话
      if (currentSessionId.value === id) {
        if (sessions.value.length > 0) {
          setCurrentSession(sessions.value[0].id)
        } else {
          createSession()
        }
      }
    } catch (error) {
      console.error('Delete session error:', error)
      throw error
    }
  }

  // 重命名会话
  async function renameSession(id, title) {
    try {
      await sessionApi.update(id, title)
      const session = sessions.value.find(s => s.id === id)
      if (session) {
        session.title = title
        session.updatedAt = Date.now()
      }
    } catch (error) {
      console.error('Rename session error:', error)
      throw error
    }
  }

  // 清空会话消息
  async function clearSessionMessages(sessionId) {
    try {
      await sessionApi.clearMessages(sessionId)

      // 如果是当前会话，清空本地消息
      if (currentSessionId.value === sessionId) {
        messages.value = []
      }

      ElMessage.success('消息已清空')
    } catch (error) {
      console.error('Clear messages error:', error)
      throw error
    }
  }

  // 切换侧边栏
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // ============ MCP 工具选择器相关方法 ============

  // 加载已启用的 MCP 配置列表
  async function loadMcpConfigs() {
    // 移除缓存检查，每次都尝试加载（调试用）
    // if (mcpLoading.value || mcpConfigs.value.length > 0) return

    mcpLoading.value = true
    try {
      const result = await mcpApi.page({ enabled: true, pageSize: 100, pageNum: 1 })
      console.log('[MCP] API result:', result)
      console.log('[MCP] records:', result?.records)
      mcpConfigs.value = result?.records || []
      console.log('[MCP] mcpConfigs.value:', mcpConfigs.value)
    } catch (error) {
      mcpError.value = error.message
      console.error('Load MCP configs error:', error)
    } finally {
      mcpLoading.value = false
    }
  }

  // 切换工具选择状态
  function toggleToolSelection(toolId) {
    const index = selectedToolIds.value.indexOf(toolId)
    if (index > -1) {
      selectedToolIds.value.splice(index, 1)
    } else {
      selectedToolIds.value.push(toolId)
    }
  }

  // 清空工具选择
  function clearToolSelection() {
    selectedToolIds.value = []
  }

  // 设置聊天模式
  function setChatMode(mode) {
    chatMode.value = mode
  }

  // isSending 别名（用于 InputArea 组件）
  const isSending = computed(() => {
    return isLoading.value
  })

  return {
    // 状态
    sessions,
    currentSessionId,
    messages,
    isLoading,
    isSending,
    selectedModelId,
    models,
    currentSession,
    sessionMessages,
    selectedModel,
    sidebarCollapsed,
    // MCP 工具选择器状态
    mcpConfigs,
    selectedToolIds,
    mcpLoading,
    mcpError,
    selectedToolsCount,
    // 聊天模式状态
    chatMode,
    chatModeOptions,
    canChangeChatMode,

    // 方法
    init,
    createSession,
    setCurrentSession,
    addMessage,
    handleSseMessage,
    addError,
    sendMessage,
    cancelSend,
    deleteSession,
    renameSession,
    clearSessionMessages,
    loadSessions,
    loadModels,
    setSelectedModel,
    toggleSidebar,
    // MCP 工具选择器方法
    loadMcpConfigs,
    toggleToolSelection,
    clearToolSelection,
    // 聊天模式方法
    setChatMode,
  }
})
