/**
 * 聊天相关 API.
 * @author hijun
 */

import request from './request'

/**
 * 发起流式聊天请求.
 *
 * @param {Object} data - 聊天请求参数
 * @param {string} data.userQuery - 用户消息内容
 * @param {string} [data.userPrompt] - 自定义提示词
 * @param {string} [data.chatMode] - 聊天模式 (chat/markdown/html/ppt/report)
 * @param {string} [data.modelProvider] - 模型提供商ID
 * @param {string} [data.modelId] - 模型ID
 * @param {string} [data.sessionId] - 会话ID
 * @param {string} [data.requestId] - 请求ID
 * @param {Array} [data.additionalFeatures] - 附加功能列表
 * @param {Array} [data.userUploadFiles] - 用户上传文件列表
 * @returns {string} SSE 事件流 URL
 */
export function streamChat(data) {
  // 返回 SSE 端点 URL，由调用方使用 EventSource 或 fetch 处理
  return '/chat/stream'
}

/**
 * 聊天请求配置.
 * 用于构建 SSE 请求的完整配置
 *
 * @param {Object} params - 聊天参数
 * @returns {Object} 请求配置
 */
export function buildChatRequest(params) {
  return {
    url: '/chat/stream',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userQuery: params.userQuery,
      userPrompt: params.userPrompt,
      mode: params.chatMode || 'chat',
      modelProvider: params.modelProvider,
      modelId: params.modelId,
      sessionId: params.sessionId,
      requestId: params.requestId,
      additionalFeatures: params.additionalFeatures || [],
      userUploadFiles: params.userUploadFiles || []
    })
  }
}
