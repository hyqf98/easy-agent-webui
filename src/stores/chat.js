/**
 * 聊天状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { chatApi } from '@/api/chat'
import { modelApi } from '@/api/model'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const sessions = ref([])
  const currentSessionId = ref(null)
  const messages = ref([])
  const isLoading = ref(false)
  const selectedModelCode = ref(null)
  const models = ref([])
  const abortController = ref(null)

  // 计算属性
  const currentSession = computed(() => {
    return sessions.value.find(s => s.id === currentSessionId.value)
  })

  const sessionMessages = computed(() => {
    return messages.value.filter(m => m.sessionId === currentSessionId.value)
  })

  // 初始化
  function init() {
    // 如果没有会话，创建一个默认会话
    if (sessions.value.length === 0) {
      createSession()
    }
  }

  // 创建新会话
  function createSession(id = null) {
    const sessionId = id || uuidv4()
    const newSession = {
      id: sessionId,
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    sessions.value.unshift(newSession)
    setCurrentSession(sessionId)
    messages.value = [] // 清空消息
    return newSession
  }

  // 设置当前会话
  function setCurrentSession(id) {
    currentSessionId.value = id
    // 加载会话消息（从内存中过滤）
    messages.value = messages.value.filter(m => m.sessionId === id || m.type === 'user')
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
    const { type, content, messageId } = data

    switch (type) {
      case 'thinking':
        // 深度思考
        addMessage({
          id: messageId || uuidv4(),
          type: 'thinking',
          content,
          status: 'completed',
        })
        break

      case 'tool_through':
        // 工具思考
        addMessage({
          id: messageId || uuidv4(),
          type: 'tool_through',
          content,
          status: 'completed',
        })
        break

      case 'final_answer':
        // 最终答案 - 流式追加
        const existingMsg = messages.value.find(m => m.id === messageId)
        if (existingMsg) {
          // 追加内容
          existingMsg.content += content
          existingMsg.status = 'streaming'
        } else {
          // 新建消息
          addMessage({
            id: messageId,
            type: 'final_answer',
            content,
            status: 'streaming',
          })
        }
        break

      case 'tool_call':
        // 工具调用
        const existingToolCall = messages.value.find(m => m.id === messageId)
        if (existingToolCall) {
          // 更新工具调用状态
          existingToolCall.content = { ...existingToolCall.content, ...content }
          if (content.status === 'success' || content.status === 'failed') {
            existingToolCall.status = 'completed'
          }
        } else {
          // 新建工具调用
          addMessage({
            id: messageId || uuidv4(),
            type: 'tool_call',
            content,
            status: content.status === 'calling' ? 'pending' : 'completed',
          })
        }
        break

      case 'completed':
        // 完成标记
        const finalMsg = messages.value.find(m => m.id === messageId)
        if (finalMsg) {
          finalMsg.status = 'completed'
        }
        isLoading.value = false
        break

      case 'error':
        // 错误消息
        addMessage({
          id: messageId || uuidv4(),
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
      if (!selectedModelCode.value && models.value.length > 0) {
        const defaultModel = models.value.find(m => m.isDefault) || models.value[0]
        selectedModelCode.value = defaultModel.modelCode
      }
    } catch (error) {
      console.error('Load models error:', error)
    }
  }

  // 设置选中的模型
  function setSelectedModel(modelCode) {
    selectedModelCode.value = modelCode
  }

  // 获取当前选中的模型
  const selectedModel = computed(() => {
    return models.value.find(m => m.modelCode === selectedModelCode.value)
  })

  // 发送消息
  async function sendMessage({ modelCode, message, toolIds }) {
    if (!message.trim() || isLoading.value) return

    const actualModelCode = modelCode || selectedModelCode.value
    if (!actualModelCode) {
      addError('请先选择模型')
      return
    }

    isLoading.value = true

    const sessionId = currentSessionId.value || uuidv4()
    const requestId = uuidv4()

    // 添加用户消息
    addMessage({
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: Date.now(),
    })

    // 如果没有当前会话，设置新会话
    if (!currentSessionId.value) {
      createSession(sessionId)
    }

    try {
      abortController.value = new AbortController()

      await chatApi.streamChat(
        {
          modelCode: actualModelCode,
          message,
          sessionId,
          requestId,
          toolIds,
        },
        handleSseMessage,
        addError,
        abortController.value.signal
      )
    } catch (error) {
      console.error('Send message error:', error)
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
  function deleteSession(id) {
    const index = sessions.value.findIndex(s => s.id === id)
    if (index > -1) {
      sessions.value.splice(index, 1)
      // 删除会话消息
      messages.value = messages.value.filter(m => m.sessionId !== id)
      // 如果删除的是当前会话，切换到其他会话
      if (currentSessionId.value === id) {
        if (sessions.value.length > 0) {
          setCurrentSession(sessions.value[0].id)
        } else {
          createSession()
        }
      }
    }
  }

  return {
    // 状态
    sessions,
    currentSessionId,
    messages,
    isLoading,
    selectedModelCode,
    models,
    currentSession,
    sessionMessages,
    selectedModel,

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
    loadModels,
    setSelectedModel,
  }
})
