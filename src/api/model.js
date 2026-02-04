/**
 * 模型 API
 */
import request from '@/utils/request'

/**
 * 模型 API
 */
export const modelApi = {
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
  }
}
