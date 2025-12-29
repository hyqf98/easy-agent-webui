import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 聊天Hook - 适配Spring AI的SSE消息格式
 */
export function useChat() {
  const messages = ref([])
  const currentMessage = reactive({
    role: 'assistant',
    thinking: '',  // 思考内容（Thought）
    toolCalls: [],  // 工具调用列表
    content: ''  // 最终内容
  })
  const loading = ref(false)

  /**
   * 发送消息
   */
  const sendMessage = async (message, mode = 'chat') => {
    if (!message.trim()) return

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    })

    // 重置当前消息
    Object.assign(currentMessage, {
      role: 'assistant',
      thinking: '',
      toolCalls: [],
      content: ''
    })

    loading.value = true

    try {
      // 创建SSE连接
      const response = await fetch('http://localhost:9000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, mode })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEventName = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEventName = line.substring(6).trim()
          } else if (line.startsWith('data:')) {
            try {
              const dataStr = line.substring(5).trim()
              if (dataStr) {
                const data = JSON.parse(dataStr)
                handleSseMessage(data)
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e, line)
            }
          }
        }
      }

      loading.value = false
    } catch (error) {
      console.error('Fetch error:', error)
      loading.value = false
      ElMessage.error('请求失败: ' + error.message)
    }
  }

  /**
   * 处理SSE消息（新的SseMessage格式）
   */
  const handleSseMessage = (data) => {
    console.log('SSE Message:', data)

    const messageType = data.type?.code || data.type

    switch (messageType) {
      case 'thinking':
        // 思考内容
        if (data.content?.thinking) {
          currentMessage.thinking = data.content.thinking
        }
        break

      case 'tool_call_start':
        // 工具调用开始
        currentMessage.toolCalls.push({
          toolCallId: data.content.toolCallId,
          toolName: data.content.toolName,
          arguments: data.content.arguments,
          status: 'loading',
          result: null
        })
        break

      case 'tool_call_result':
        // 工具调用结果
        const toolCall = currentMessage.toolCalls.find(
          tc => tc.toolCallId === data.content.toolCallId
        )
        if (toolCall) {
          toolCall.status = 'success'
          toolCall.result = data.content.result
        }
        break

      case 'content_chunk':
        // 内容流式输出
        if (data.content?.chunk) {
          currentMessage.content += data.content.chunk
        }
        break

      case 'completed':
        // 完成 - 将当前消息添加到历史
        loading.value = false

        messages.value.push({
          role: 'assistant',
          thinking: currentMessage.thinking,
          toolCalls: [...currentMessage.toolCalls],
          content: currentMessage.content || currentMessage.thinking, // 使用content或thinking作为最终回复
          timestamp: Date.now()
        })

        // 重置当前消息
        Object.assign(currentMessage, {
          role: 'assistant',
          thinking: '',
          toolCalls: [],
          content: ''
        })
        break

      case 'error':
        loading.value = false
        ElMessage.error(data.content?.error || '发生错误')
        break

      default:
        console.warn('Unknown message type:', messageType, data)
    }
  }

  /**
   * 清空消息
   */
  const clearMessages = () => {
    messages.value = []
    Object.assign(currentMessage, {
      role: 'assistant',
      thinking: '',
      toolCalls: [],
      content: ''
    })
  }

  return {
    messages,
    currentMessage,
    loading,
    sendMessage,
    clearMessages
  }
}
