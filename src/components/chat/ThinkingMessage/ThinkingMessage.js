import { computed } from 'vue'

export function useThinkingMessage(props, emit) {
  // 格式化思考内容
  const formattedContent = computed(() => {
    if (!props.content) return '正在思考...'

    // 将内容按行分割并添加样式
    return props.content
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

  const toggle = () => {
    emit('toggle')
  }

  return {
    formattedContent,
    toggle
  }
}
