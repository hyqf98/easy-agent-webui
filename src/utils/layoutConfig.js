/**
 * 布局配置
 *
 * 定义不同模式下的布局配置
 */

/**
 * 布局模式枚举
 */
export const LAYOUT_MODES = {
  SINGLE: 'single',  // 单列布局
  SPLIT: 'split'     // 分屏布局
}

/**
 * 聊天模式与布局模式的映射
 *
 * Chat 模式使用单列布局，其他模式使用分屏布局
 */
export const MODE_LAYOUT_MAP = {
  chat: LAYOUT_MODES.SINGLE,
  markdown: LAYOUT_MODES.SPLIT,
  html: LAYOUT_MODES.SPLIT,
  ppt: LAYOUT_MODES.SPLIT
}

/**
 * 面板尺寸配置
 */
export const PANEL_CONFIG = {
  /** 左侧面板配置（ProcessPanel） */
  LEFT: {
    defaultWidth: '380px',
    minWidth: '300px',
    maxWidth: '500px'
  },
  /** 右侧面板配置（ContentPanel） */
  RIGHT: {
    minWidth: '400px'
  }
}

/**
 * 消息展开配置
 *
 * 定义不同类型消息的默认展开状态和显示样式
 */
export const MESSAGE_EXPAND_CONFIG = {
  /** 思考过程消息 */
  thinking: {
    defaultExpanded: false,  // 默认折叠
    icon: 'brain',            // 图标名称
    color: '#6366f1',         // 主题色
    bgColor: '#f5f3ff',       // 背景色
    borderColor: '#ddd6fe'    // 边框色
  },
  /** 工具调用消息 */
  tool_call: {
    defaultExpanded: true,    // 默认展开
    icon: 'tool',             // 图标名称
    color: '#10b981',         // 主题色
    bgColor: '#d1fae5',       // 背景色
    borderColor: '#a7f3d0'    // 边框色
  },
  /** 规划结果消息 */
  plan_result: {
    defaultExpanded: true,    // 默认展开
    icon: 'list',             // 图标名称
    color: '#3b82f6',         // 主题色
    bgColor: '#dbeafe',       // 背景色
    borderColor: '#bfdbfe'    // 边框色
  }
}

/**
 * 获取指定聊天模式的布局模式
 *
 * @param {string} chatMode - 聊天模式 (chat/markdown/html/ppt)
 * @returns {string} 布局模式
 */
export function getLayoutMode(chatMode) {
  return MODE_LAYOUT_MAP[chatMode] || LAYOUT_MODES.SINGLE
}

/**
 * 获取消息展开配置
 *
 * @param {string} messageType - 消息类型
 * @returns {object} 展开配置
 */
export function getMessageExpandConfig(messageType) {
  return MESSAGE_EXPAND_CONFIG[messageType] || {
    defaultExpanded: true,
    icon: 'document',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    borderColor: '#e5e7eb'
  }
}
