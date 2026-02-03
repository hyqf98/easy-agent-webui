/**
 * 聊天 API 接口
 */

const BASE_URL = '/api'

/**
 * SSE 流式聊天
 * @param {Object} data - 请求数据
 * @param {Function} onMessage - 消息回调
 * @param {Function} onError - 错误回调
 * @param {AbortSignal} signal - 中止信号
 * @returns {Promise<void>}
 */
export async function streamChat(data, onMessage, onError, signal) {
  try {
    const response = await fetch(`${BASE_URL}/chat/stream`, {
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

      if (done) break

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
          const data = line.slice(5).trim()
          try {
            const parsed = JSON.parse(data)
            onMessage(parsed)
          } catch (e) {
            console.error('Failed to parse SSE data:', data, e)
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Stream aborted by user')
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
  const response = await fetch(`${BASE_URL}/models`)
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
  const response = await fetch(`${BASE_URL}/tools`)
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
