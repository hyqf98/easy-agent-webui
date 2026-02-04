/**
 * 消息管理 API
 */
import request from '@/utils/request'

export const messageApi = {
  /**
   * 获取会话的所有消息
   * @param {number} sessionId - 会话ID
   */
  async listBySessionId(sessionId) {
    return request.get(`/message/list/${sessionId}`)
  },

  /**
   * 新增消息
   * @param {Object} form - 消息表单
   * @param {number} form.sessionId - 会话ID
   * @param {string} form.role - 角色 (assistant/user/tool)
   * @param {string} form.type - 消息类型
   * @param {string} form.content - 消息内容
   * @param {string} form.status - 状态
   */
  async create(form) {
    return request.post('/message', form)
  }
}
