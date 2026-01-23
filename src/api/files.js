import request from './request'

/**
 * 文件下载 API
 *
 * @author easy-agent
 * @since 1.0.0
 */

/**
 * 下载会话文件
 *
 * @param {Object} params 下载参数
 * @param {string} params.sessionId 会话 ID
 * @param {string} [params.fileType] 文件类型 (plan/data/content)，默认 content
 * @param {string} [params.format] 下载格式 (md/html/docx)，默认 md
 * @returns {Promise<Blob>} 文件数据
 */
export function downloadFile({ sessionId, fileType = 'content', format = 'md' }) {
  return request({
    url: '/api/files/download',
    method: 'get',
    params: { sessionId, fileType, format },
    responseType: 'blob'
  })
}

/**
 * 触发浏览器下载
 *
 * @param {Blob} blob 文件数据
 * @param {string} filename 文件名
 */
export function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 下载并保存文件
 *
 * @param {Object} params 下载参数
 * @param {string} params.sessionId 会话 ID
 * @param {string} [params.fileType] 文件类型，默认 content
 * @param {string} [params.format] 下载格式，默认 md
 */
export async function downloadAndSave({ sessionId, fileType = 'content', format = 'md' }) {
  try {
    const blob = await downloadFile({ sessionId, fileType, format })
    const extension = format === 'docx' ? 'docx' : format === 'html' ? 'html' : 'md'
    const filename = `${fileType}.${extension}`
    triggerDownload(blob, filename)
    return true
  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}
