/**
 * 生成 UUID v4
 * @returns {string} UUID 字符串
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成会话ID
 * @returns {string} session-{uuid}
 */
export function generateSessionId() {
  return `session-${generateUUID()}`
}

/**
 * 生成请求ID
 * @returns {string} request-{uuid}
 */
export function generateRequestId() {
  return `request-${generateUUID()}`
}

/**
 * 生成消息ID
 * @returns {string} msg-{uuid}
 */
export function generateMessageId() {
  return `msg-${generateUUID()}`
}

/**
 * 生成工具调用ID
 * @returns {string} tool-{uuid}
 */
export function generateToolId() {
  return `tool-${generateUUID()}`
}
