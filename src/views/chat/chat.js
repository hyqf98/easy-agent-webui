/**
 * 聊天页面业务逻辑
 */

import { ref, computed, nextTick } from 'vue'
import { chatApi } from '@/api/chat'
import { useChatStore } from '@/stores/chat'
import { v4 as uuidv4 } from 'uuid'

export function useChat() {
  const chatStore = useChatStore()
  const inputMessage = ref('')
  const isSending = ref(false)
  const abortController = ref(null)

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.value.trim() || isSending.value) return

    const message = inputMessage.value.trim()
    inputMessage.value = ''
    isSending.value = true

    // 生成会话ID和请求ID
    const sessionId = chatStore.currentSessionId || uuidv4()
    const requestId = uuidv4()

    // 添加用户消息
    chatStore.addMessage({
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: Date.now()
    })

    // 设置当前会话
    if (!chatStore.currentSessionId) {
      chatStore.setCurrentSession(sessionId)
    }

    try {
      // 创建 AbortController 用于取消请求
      abortController.value = new AbortController()

      await chatApi.streamChat(
        {
          modelId: chatStore.selectedModelId,
          message,
          sessionId,
          requestId
        },
        // onMessage callback
        (data) => {
          chatStore.handleSseMessage(data)
        },
        // onError callback
        (error) => {
          console.error('SSE error:', error)
          chatStore.addError(error.message)
        },
        abortController.value.signal
      )
    } catch (error) {
      console.error('Send message error:', error)
      chatStore.addError(error.message)
    } finally {
      isSending.value = false
      abortController.value = null
    }
  }

  // 取消发送
  const cancelSend = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isSending.value = false
    }
  }

  // 创建新会话
  const createSession = () => {
    const newSessionId = uuidv4()
    chatStore.createSession(newSessionId)
  }

  return {
    inputMessage,
    isSending,
    sendMessage,
    cancelSend,
    createSession
  }
}
