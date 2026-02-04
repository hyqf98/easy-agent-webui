/**
 * 会话管理 API
 */
import request from '@/utils/request'

export const sessionApi = {
  /**
   * 查询会话列表
   */
  async list() {
    return request.post('/session/list', {})
  },

  /**
   * 根据ID查询会话
   */
  async getById(id) {
    return request.get(`/session/${id}`)
  },

  /**
   * 新增会话
   * @param {number} modelId - 模型ID
   */
  async create(modelId) {
    return request.post('/session', { modelId })
  },

  /**
   * 修改会话（重命名）
   * @param {number} id - 会话ID
   * @param {string} title - 新标题
   */
  async update(id, title) {
    return request.put('/session', { id, title })
  },

  /**
   * 批量删除会话
   * @param {number[]} ids - 会话ID列表
   */
  async remove(ids) {
    return request.delete('/session/remove', { data: ids })
  },

  /**
   * 清空会话消息
   * @param {number} id - 会话ID
   */
  async clearMessages(id) {
    return request.delete(`/session/clear/${id}`)
  }
}
