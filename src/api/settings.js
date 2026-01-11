import request from './request'

/**
 * 获取所有配置
 * @returns {Promise<Object>} 配置数据
 */
export function getConfig() {
  return request({
    url: '/settings/config',
    method: 'get'
  })
}

/**
 * 保存配置
 * @param {Object} data - 配置数据
 * @param {Array} data.mcpServers - MCP 服务器列表
 * @param {Array} data.modelProviders - 模型提供商列表
 * @param {Object} data.selectedModel - 选中的模型
 * @returns {Promise<Object>}
 */
export function saveConfig(data) {
  return request({
    url: '/settings/config',
    method: 'post',
    data
  })
}

/**
 * 测试模型连接
 * @param {Object} data - 测试数据
 * @param {string} data.providerId - 提供商 ID
 * @param {string} data.modelId - 模型 ID
 * @param {Object} data.config - 模型配置
 * @returns {Promise<Object>} 测试结果
 */
export function testModel(data) {
  return request({
    url: '/settings/test-model',
    method: 'post',
    data
  })
}

/**
 * 获取支持的模型提供商列表
 * @returns {Promise<Array>} 提供商列表
 */
export function getProviders() {
  return request({
    url: '/settings/providers',
    method: 'get'
  })
}
