import { computed, ref } from 'vue'

export function useToolMessage(props) {
  const isExpanded = ref(false)

  // 切换展开/收起
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
  }

  // 状态文本
  const statusText = computed(() => {
    return props.tool.status === 'calling' ? '调用中...' : '已完成'
  })

  // 格式化输入参数
  const formattedInput = computed(() => {
    if (!props.tool.input) return ''
    try {
      const obj = typeof props.tool.input === 'string'
        ? JSON.parse(props.tool.input)
        : props.tool.input
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(props.tool.input)
    }
  })

  // 格式化输出结果
  const formattedOutput = computed(() => {
    if (!props.tool.output) return ''
    try {
      const obj = typeof props.tool.output === 'string'
        ? JSON.parse(props.tool.output)
        : props.tool.output
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(props.tool.output)
    }
  })

  return {
    isExpanded,
    toggleExpand,
    statusText,
    formattedInput,
    formattedOutput
  }
}
