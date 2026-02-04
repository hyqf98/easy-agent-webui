/**
 * Axios 请求配置
 * <p>
 * 统一配置 axios 实例，处理请求/响应拦截
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等请求头
    // config.headers['Authorization'] = 'Bearer ' + token
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果响应是 SSE 流式数据，直接返回
    if (response.headers['content-type']?.includes('text/event-stream')) {
      return response
    }

    // 处理统一的 Result 格式
    // { code, message, data, timestamp, success }
    if (res && typeof res === 'object') {
      const { code, message, data, success } = res

      // 判断是否成功 (code === 200 或 success === true)
      const isSuccess = code === 200 || success === true

      if (isSuccess) {
        // 返回 data 字段
        return data
      } else {
        // 业务失败，显示错误消息
        const errorMsg = message || '操作失败'
        ElMessage.error(errorMsg)
        return Promise.reject(new Error(errorMsg))
      }
    }

    // 如果不是标准格式，直接返回
    return res
  },
  (error) => {
    console.error('Response error:', error)

    // 处理 HTTP 错误状态码
    if (error.response) {
      const { status, data } = error.response
      let message = '请求失败'

      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以跳转到登录页
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = data?.message || '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `连接错误 ${status}`
      }

      ElMessage.error(message)
      return Promise.reject(error)
    }

    // 网络错误
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络')
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

export default request
