import { computed, ref, watch, watchEffect } from 'vue'

export function useThinkingMessage(props, emit) {
  // 使用本地 ref 来存储内容，确保实时更新
  const localContent = ref(props.content || '')

  // 使用响应式计数器强制更新
  const updateCounter = ref(0)

  // 格式化思考内容
  const formattedContent = computed(() => {
    // 依赖 updateCounter 以强制重新计算
    updateCounter.value // eslint-disable-line no-unused-expressions

    if (!localContent.value) return '正在思考...'

    // 将内容按行分割并添加样式
    return localContent.value
      .split('\n')
      .map(line => {
        // 高亮关键词
        line = line
          .replace(/(分析|思考|推理|判断|结论|因为|所以|因此)/g, '<span class="keyword">$1</span>')
          .replace(/([「『]).*?([」』])/g, '<span class="quote">$&</span>')
        return `<p class="thinking-line">${line || '&nbsp;'}</p>`
      })
      .join('')
  })

  // 使用 watchEffect 来追踪 props 变化
  watchEffect(() => {
    // 访问两个 props 以建立依赖追踪
    const content = props.content
    const lastUpdate = props.lastUpdate

    console.log('[ThinkingMessage] watchEffect triggered:', {
      contentLength: content?.length,
      lastUpdate
    })

    // 更新本地内容
    if (content !== localContent.value) {
      localContent.value = content || ''
      // 增加计数器以强制 computed 重新计算
      updateCounter.value++
    }
  })

  const toggle = () => {
    emit('toggle')
  }

  return {
    formattedContent,
    toggle
  }
}
