/**
 * NormalMessage 组件逻辑
 * 使用 Element Plus X 的 XMarkdown 进行渲染
 */
export function useNormalMessage(props) {
  // 当内容正在流式传输时，显示打字机效果
  const shouldShowTypewriter = computed(() => {
    return props.isStreaming && props.content && props.content.length > 0
  })

  // 流式传输完成或非流式状态，直接显示完整内容
  const markdownContent = computed(() => {
    return props.content || ''
  })

  // 显示光标（用于自定义打字机效果）
  const showCursor = computed(() => {
    return props.isStreaming && props.content && props.content.length > 0
  })

  return {
    shouldShowTypewriter,
    markdownContent,
    showCursor
  }
}
