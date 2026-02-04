/**
 * 模型 API
 */
import request from '@/utils/request'

/**
 * 模型 API
 */
export const modelApi = {
  /**
   * 分页查询模型配置
   * @param {Object} query 查询条件
   * @returns {Promise<IPage>}
   */
  async page(query) {
    return request.post('/model/page', query)
  },

  /**
   * 获取启用的模型列表
   * @returns {Promise<Array>} 模型列表
   */
  async getEnabledModels() {
    return request.post('/model/list', {
      enabled: true
    })
  },

  /**
   * 根据模型编码获取模型信息
   * @param {string} modelCode 模型编码
   * @returns {Promise<Object>} 模型信息
   */
  async getByModelCode(modelCode) {
    return request.get(`/model/code/${modelCode}`)
  },

  /**
   * 根据ID查询模型配置
   * @param {number} id 主键ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    return request.get(`/model/${id}`)
  },

  /**
   * 新增模型配置
   * @param {Object} form 表单数据
   * @returns {Promise<void>}
   */
  async create(form) {
    return request.post('/model', form)
  },

  /**
   * 修改模型配置
   * @param {Object} form 表单数据
   * @returns {Promise<void>}
   */
  async update(form) {
    return request.put('/model', form)
  },

  /**
   * 批量删除模型配置
   * @param {Array<number>} ids ID列表
   * @returns {Promise<void>}
   */
  async remove(ids) {
    return request.delete('/model/remove', { data: ids })
  }
}
