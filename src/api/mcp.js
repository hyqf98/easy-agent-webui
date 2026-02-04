/**
 * MCP 配置 API
 */
import request from '@/utils/request'

/**
 * MCP 配置 API
 */
export const mcpApi = {
  /**
   * 分页查询MCP配置
   * @param {Object} query 查询条件
   * @returns {Promise<IPage>}
   */
  async page(query) {
    return request.post('/mcp/page', query)
  },

  /**
   * 根据ID查询MCP配置
   * @param {number} id 主键ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    return request.get(`/mcp/${id}`)
  },

  /**
   * 新增MCP配置
   * @param {Object} form 表单数据
   * @returns {Promise<void>}
   */
  async create(form) {
    return request.post('/mcp', form)
  },

  /**
   * 修改MCP配置
   * @param {Object} form 表单数据
   * @returns {Promise<void>}
   */
  async update(form) {
    return request.put('/mcp', form)
  },

  /**
   * 批量删除MCP配置
   * @param {Array<number>} ids ID列表
   * @returns {Promise<void>}
   */
  async remove(ids) {
    return request.delete('/mcp/remove', { data: ids })
  },

  /**
   * 测试MCP服务器连接
   * @param {number} id 主键ID
   * @returns {Promise<void>}
   */
  async testConnection(id) {
    return request.post(`/mcp/${id}/test`)
  },

  /**
   * 查询MCP服务器的工具列表
   * @param {number} id 主键ID
   * @returns {Promise<Array>}
   */
  async listTools(id) {
    return request.get(`/mcp/${id}/tools`)
  },

  /**
   * 查询MCP服务器的资源列表
   * @param {number} id 主键ID
   * @returns {Promise<Array>}
   */
  async listResources(id) {
    return request.get(`/mcp/${id}/resources`)
  },

  /**
   * 查询MCP服务器的提示词列表
   * @param {number} id 主键ID
   * @returns {Promise<Array>}
   */
  async listPrompts(id) {
    return request.get(`/mcp/${id}/prompts`)
  }
}
