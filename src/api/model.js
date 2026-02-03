/**
 * 模型 API
 */
import axios from 'axios'

const BASE_URL = '/api'

/**
 * 模型 API
 */
export const modelApi = {
  /**
   * 获取启用的模型列表
   * @returns {Promise<Array>} 模型列表
   */
  async getEnabledModels() {
    const { data } = await axios.post(`${BASE_URL}/model/list`, {
      enabled: true
    })
    return data
  },

  /**
   * 根据模型编码获取模型信息
   * @param {string} modelCode 模型编码
   * @returns {Promise<Object>} 模型信息
   */
  async getByModelCode(modelCode) {
    const { data } = await axios.get(`${BASE_URL}/model/code/${modelCode}`)
    return data
  }
}
