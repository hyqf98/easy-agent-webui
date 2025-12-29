/**
 * SSE连接Hook
 */
export function useSse() {
  const isConnected = ref(false)
  const messages = ref([])

  /**
   * 连接SSE
   * @param {Object} data - 请求数据
   * @param {Function} onMessage - 消息回调
   * @param {Function} onError - 错误回调
   */
  const connect = (data, onMessage, onError) => {
    return new Promise((resolve, reject) => {
      fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('请求失败')
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()

          isConnected.value = true
          resolve()

          // 读取流数据
          const readStream = () => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  isConnected.value = false
                  return
                }

                // 解析SSE数据
                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                lines.forEach((line) => {
                  if (line.startsWith('data:')) {
                    try {
                      const json = line.substring(5).trim()
                      if (json) {
                        const message = JSON.parse(json)
                        messages.value.push(message)
                        onMessage && onMessage(message)
                      }
                    } catch (e) {
                      console.error('解析SSE消息失败:', e)
                    }
                  }
                })

                readStream()
              })
              .catch((error) => {
                console.error('读取流失败:', error)
                isConnected.value = false
                onError && onError(error)
              })
          }

          readStream()
        })
        .catch((error) => {
          console.error('SSE连接失败:', error)
          isConnected.value = false
          onError && onError(error)
          reject(error)
        })
    })
  }

  /**
   * 断开连接
   */
  const disconnect = () => {
    isConnected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    messages,
    connect,
    disconnect,
  }
}
