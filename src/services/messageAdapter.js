/**
 * 消息适配器。
 * <p>将 SSE 消息适配为前端组件可用的格式。</p>
 * <p>注意：AGENT_SWITCH 和 REVIEW_RESULT 消息已移除，不再适配。</p>
 *
 * @author hijun
 * @since 1.0.0
 */

import { SseMessageType } from './sseService'

/**
 * 适配消息。
 *
 * <p>显示规则：</p>
 * <ul>
 *   <li>✅ thinking - 思考过程（默认折叠）</li>
 *   <li>✅ tool_call_start/result - 工具调用（默认展开）</li>
 *   <li>✅ plan_result - 规划结果</li>
 *   <li>❌ agent_switch - 已移除，不显示</li>
 *   <li>❌ file_created - 已移除，不显示</li>
 *   <li>❌ review_result - 已移除，不显示</li>
 * </ul>
 *
 * @param {Object} rawMessage - 原始消息
 * @returns {Object|null} 适配后的消息（不需要显示的消息返回 null）
 */
export function adaptMessage(rawMessage) {
  const type = rawMessage.type

  switch (type) {
    case SseMessageType.THINKING:
    case SseMessageType.TOOL_THROUGH:
      return adaptThinkingMessage(rawMessage)

    case SseMessageType.PLAN_RESULT:
      return adaptPlanResultMessage(rawMessage)

    // 不再适配这些消息类型
    case SseMessageType.AGENT_SWITCH:
    case SseMessageType.FILE_CREATED:
    case SseMessageType.REVIEW_RESULT:
      return null

    case SseMessageType.TOOL_CALL_START:
      return adaptToolCallStartMessage(rawMessage)

    case SseMessageType.TOOL_CALL_RESULT:
      return adaptToolCallResultMessage(rawMessage)

    case SseMessageType.CONTENT_CHUNK:
    case 'final_answer': // 兼容旧版本
      return adaptContentChunkMessage(rawMessage)

    case SseMessageType.COMPLETED:
      return adaptCompletedMessage(rawMessage)

    case SseMessageType.ERROR:
      return adaptErrorMessage(rawMessage)

    default:
      return adaptUnknownMessage(rawMessage)
  }
}

/**
 * 适配思考消息。
 */
function adaptThinkingMessage(message) {
  return {
    type: 'thinking',
    content: message.content || '思考中...',
    timestamp: Date.now()
  }
}

/**
 * 适配规划结果消息。
 */
function adaptPlanResultMessage(message) {
  return {
    type: 'plan_result',
    plan: message.plan || '',
    steps: message.steps || [],
    estimatedTime: message.estimatedTime,
    timestamp: Date.now()
  }
}

/**
 * 适配工具调用开始消息。
 */
function adaptToolCallStartMessage(message) {
  return {
    type: 'tool_call_start',
    toolName: message.name || message.toolName || '',
    arguments: message.arguments || message.result || '',
    timestamp: Date.now()
  }
}

/**
 * 适配工具调用结果消息。
 */
function adaptToolCallResultMessage(message) {
  return {
    type: 'tool_call_result',
    toolName: message.name || message.toolName || '',
    result: message.result || '',
    toolStatus: message.toolStatus,
    timestamp: Date.now()
  }
}

/**
 * 适配内容块消息。
 */
function adaptContentChunkMessage(message) {
  return {
    type: 'content_chunk',
    content: message.content || '',
    timestamp: Date.now()
  }
}

/**
 * 适配完成消息。
 */
function adaptCompletedMessage(message) {
  return {
    type: 'completed',
    message: message.content || message.message || '已完成',
    timestamp: Date.now()
  }
}

/**
 * 适配错误消息。
 */
function adaptErrorMessage(message) {
  return {
    type: 'error',
    message: message.content || message.message || '发生错误',
    timestamp: Date.now()
  }
}

/**
 * 适配未知消息。
 */
function adaptUnknownMessage(message) {
  return {
    type: 'unknown',
    raw: message,
    timestamp: Date.now()
  }
}
