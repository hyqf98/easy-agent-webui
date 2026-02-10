/**
 * 聊天 API 接口
 */

// 配置常量
const MAX_SSE_MESSAGES = 1000  // SSE 消息最大收集数量
const DEFAULT_TIMEOUT = 60000  // 默认请求超时时间（毫秒）

// 获取 API 基础地址
// 开发环境：留空走 Vite 代理，生产环境：使用完整地址
const getBaseURL = () => {
  const envBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()
  // 如果环境变量为空或无效，使用相对路径走代理
  return (envBaseURL && envBaseURL !== '""' && envBaseURL !== 'undefined') ? envBaseURL : '/api'
}

/**
 * SSE 流式聊天
 * @param {Object} data - 请求数据
 * @param {Function} onMessage - 消息回调
 * @param {Function} onError - 错误回调
 * @param {AbortSignal} signal - 中止信号
 * @param {number} timeout - 超时时间（毫秒），默认 60000
 * @returns {Promise<void>}
 */
export async function streamChat(data, onMessage, onError, signal, timeout = DEFAULT_TIMEOUT) {
  const baseURL = getBaseURL()
  const url = `${baseURL}/chat/stream`

  // 收集完整的 SSE 消息（限制数量防止内存泄漏）
  const sseMessages = []

  // 创建超时控制器
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout)

  // 组合中止信号
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: combinedSignal,
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
            // 限制消息数量，防止内存泄漏
            if (sseMessages.length >= MAX_SSE_MESSAGES) {
              sseMessages.shift()  // 移除最旧的消息
            }
            sseMessages.push(parsed)
            onMessage(parsed)
          } catch (e) {
            console.error('[chat.js] 解析 SSE 数据失败:', eventData, e)
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // 判断是超时还是用户取消
      if (timeoutController.signal.aborted) {
        console.error('[chat.js] 请求超时')
        onError(new Error('请求超时，请稍后重试'))
      }
      // 用户取消请求，不打印日志
    } else {
      console.error('[chat.js] 请求错误:', error)
      onError(error)
    }
  } finally {
    clearTimeout(timeoutId)
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

/**
 * 上传文件
 * @param {File} file - 要上传的文件
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} 文件信息（包含相对路径）
 */
export async function uploadFile(file, sessionId) {
  const baseURL = getBaseURL()
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sessionId', sessionId)

  const response = await fetch(`${baseURL}/file/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  // 后端返回 Result 包装对象，需要从 data 字段获取实际数据
  return result.data
}

/**
 * 删除文件
 * @param {string} path - 文件相对路径
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  const baseURL = getBaseURL()
  const response = await fetch(`${baseURL}/file/delete?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

export const chatApi = {
  streamChat,
  getModels,
  getTools,
  uploadFile,
  deleteFile,
}
