/**
 * SSE 消息类型常量
 * 对应后端 SseMessageType
 */
export const SseMessageType = {
  THINKING: 'thinking',
  TOOL_CALL_START: 'tool_call_start',
  TOOL_CALL_RESULT: 'tool_call_result',
  CONTENT_CHUNK: 'final_answer',
  COMPLETED: 'completed',
  ERROR: 'error'
}

/**
 * 工具状态常量
 * 对应后端 ToolStatus
 */
export const ToolStatus = {
  CALLING: 'calling',
  SUCCESS: 'success',
  FAILED: 'failed'
}

/**
 * 聊天模式常量
 * 对应后端 ChatMode
 */
export const ChatMode = {
  CHAT: 'chat',
  MARKDOWN: 'markdown',
  HTML: 'html',
  PPT: 'ppt',
  REPORT: 'report'
}

/**
 * 附加功能常量
 * 对应后端 AdditionalFeatures
 */
export const AdditionalFeatures = {
  DEEP_THINKING: 'deep_thinking',
  DEEP_SEARCH: 'deep_search'
}

/**
 * API 配置
 */
const API_CONFIG = {
  baseURL: (import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:20000')),
  timeout: 300000
}

/**
 * 解析 SSE 数据行
 * @param {string} line SSE 数据行
 * @returns {Object|null} 解析后的消息对象
 */
function parseSSELine(line) {
  if (!line || !line.startsWith('data:')) {
    return null
  }

  const data = line.slice(5).trim()
  if (data === '[DONE]') {
    return { type: 'done' }
  }

  try {
    const parsed = JSON.parse(data)
    return parsed
  } catch (e) {
    console.error('Failed to parse SSE data:', data, e)
    return null
  }
}

/**
 * 读取 SSE 流并处理消息
 * @param {ReadableStreamDefaultReader} reader 流读取器
 * @param {Function} onMessage 消息回调函数
 * @returns {Promise<void>}
 */
async function readSSEStream(reader, onMessage) {
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      // 解码数据块
      buffer += decoder.decode(value, { stream: true })

      // 按行分割处理
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留未完成的行

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        const message = parseSSELine(trimmedLine)
        if (message) {
          await onMessage(message)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * SSE 聊天服务类
 */
export class SseChatService {
  constructor() {
    this.abortController = null
    this.reader = null
  }

  /**
   * 发送聊天请求并处理响应
   * @param {Object} request 聊天请求
   * @param {string} request.userQuery 用户消息（必填）
   * @param {string} request.sessionId 会话ID
   * @param {string} request.requestId 请求ID
   * @param {string} [request.mode] 聊天模式
   * @param {string[]} [request.additionalFeatures] 附加功能
   * @param {string} [request.userPrompt] 自定义提示词
   * @param {Object} handlers 消息处理器
   * @param {Function} [handlers.onThinking] 思考消息处理
   * @param {Function} [handlers.onToolCallStart] 工具调用开始处理
   * @param {Function} [handlers.onToolCallResult] 工具调用结果处理
   * @param {Function} [handlers.onContentChunk] 内容块处理
   * @param {Function} [handlers.onCompleted] 完成处理
   * @param {Function} [handlers.onError] 错误处理
   * @returns {Promise<void>}
   */
  async connect(request, handlers = {}) {
    // 取消现有连接
    this.disconnect()

    const url = `${API_CONFIG.baseURL}/api/chat/stream`
    this.abortController = new AbortController()

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(request),
        signal: this.abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      this.reader = response.body.getReader()

      // 读取并处理 SSE 流
      await readSSEStream(this.reader, (message) => {
        switch (message.type) {
          case SseMessageType.THINKING:
            handlers.onThinking?.(message)
            break

          case SseMessageType.TOOL_CALL_START:
            handlers.onToolCallStart?.(message)
            break

          case SseMessageType.TOOL_CALL_RESULT:
            handlers.onToolCallResult?.(message)
            break

          case SseMessageType.CONTENT_CHUNK:
            handlers.onContentChunk?.(message)
            break

          case SseMessageType.COMPLETED:
            handlers.onCompleted?.(message)
            break

          case SseMessageType.ERROR:
            handlers.onError?.(message)
            break

          case 'done':
            // 流结束
            break

          default:
            console.warn('Unknown SSE message type:', message.type)
        }
      })

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('SSE request was aborted')
      } else {
        handlers.onError?.({ type: SseMessageType.ERROR, content: error.message })
        throw error
      }
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }

    if (this.reader) {
      try {
        this.reader.cancel()
      } catch (e) {
        // 忽略取消错误
      }
      this.reader = null
    }
  }

  /**
   * 获取连接状态
   */
  get readyState() {
    return this.abortController && !this.abortController.signal.aborted ? 1 : 0
  }

  /**
   * 是否已连接
   */
  get isConnected() {
    return this.abortController !== null && !this.abortController.signal.aborted
  }
}

/**
 * 导出单例实例
 */
export const sseChatService = new SseChatService()
