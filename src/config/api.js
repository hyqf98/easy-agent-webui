/**
 * API 配置
 *
 * @author haijun
 * @since 1.0.0
 */

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * API 端点配置
 */
export const apiEndpoints = {
  // 聊天相关
  CHAT_STREAM: `${API_BASE_URL}/chat/stream`,
  CHAT_HISTORY: `${API_BASE_URL}/chat/history`,

  // Mock 模式（在 URL 中添加 /mock/ 路径）
  CHAT_STREAM_MOCK: `${API_BASE_URL}/mock/chat/stream`
}

/**
 * 获取完整 API URL
 *
 * @param {string} endpoint - API 端点
 * @returns {string} 完整 URL
 */
export function getApiUrl(endpoint) {
  return endpoint
}
