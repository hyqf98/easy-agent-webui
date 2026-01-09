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
 * SSE 聊天服务类
 * 仅负责发送请求，不处理响应
 */
export class SseChatService {
  constructor() {
    this.abortController = null
    this.reader = null
  }

  /**
   * 发送聊天请求
   * @param {Object} request 聊天请求
   * @param {string} request.userQuery 用户消息（必填）
   * @param {string} [request.sessionId] 会话ID
   * @param {string} [request.mode] 聊天模式
   * @param {string[]} [request.additionalFeatures] 附加功能
   * @param {string} [request.userPrompt] 自定义提示词
   * @returns {Object} { abortController, reader }
   */
  connect(request) {
    // 取消现有连接
    this.disconnect()

    const url = `${API_CONFIG.baseURL}/api/chat/stream`
    this.abortController = new AbortController()

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(request),
      signal: this.abortController.signal
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      this.reader = response.body.getReader()
    })
    .catch(error => {
      throw error
    })

    return {
      abortController: this.abortController,
      reader: this.reader
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
