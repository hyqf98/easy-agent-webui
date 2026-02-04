/**
 * 聊天 API 接口
 */

// 获取 API 基础地址
// 开发环境：留空走 Vite 代理，生产环境：使用完整地址
const getBaseURL = () => {
  const envBaseURL = import.meta.env.VITE_API_BASE_URL

  // 如果环境变量为空或未定义，使用相对路径走代理
  if (!envBaseURL || envBaseURL === '""' || envBaseURL === 'undefined') {
    return '/api'
  }
  return envBaseURL
}

/**
 * SSE 流式聊天
 * @param {Object} data - 请求数据
 * @param {Function} onMessage - 消息回调
 * @param {Function} onError - 错误回调
 * @param {AbortSignal} signal - 中止信号
 * @returns {Promise<void>}
 */
export async function streamChat(data, onMessage, onError, signal) {
  const baseURL = getBaseURL()
  const url = `${baseURL}/chat/stream`

  // 收集完整的 SSE 消息
  const sseMessages = []

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        // 打印完整的 SSE 消息
        console.log('=== SSE 完整消息 ===', {
          sessionId: data.sessionId,
          requestId: data.requestId,
          messageCount: sseMessages.length,
          messages: sseMessages,
          fullContent: sseMessages.map(m => m.content?.text || '').join('')
        })
        break
      }

      // 解码并追加到缓冲区
      buffer += decoder.decode(value, { stream: true })

      // 处理 SSE 数据
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留不完整的行

      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.startsWith(':')) continue // SSE 注释

        // 解析 data: 行
        if (line.startsWith('data:')) {
          const eventData = line.slice(5).trim()
          try {
            const parsed = JSON.parse(eventData)
            sseMessages.push(parsed)
            onMessage(parsed)
          } catch (e) {
            console.error('[chat.js] 解析 SSE 数据失败:', eventData, e)
          }
        }
      }
    }
  } catch (error) {
    console.error('[chat.js] 请求错误:', error)
    if (error.name === 'AbortError') {
      // 用户取消请求，不打印日志
    } else {
      onError(error)
    }
  }
}

/**
 * 获取模型列表
 * @returns {Promise<Array>}
 */
export async function getModels() {
  const baseURL = getBaseURL()
  const response = await fetch(`${baseURL}/models`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

/**
 * 获取工具列表
 * @returns {Promise<Array>}
 */
export async function getTools() {
  const baseURL = getBaseURL()
  const response = await fetch(`${baseURL}/tools`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const chatApi = {
  streamChat,
  getModels,
  getTools,
}
