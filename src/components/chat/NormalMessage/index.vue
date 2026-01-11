<template>
  <div class="normal-message">
    <div class="message-bubble" :class="{ 'streaming': isStreaming }">
      <div class="bubble-decoration"></div>

      <!-- 内容区域 -->
      <div class="markdown-content-wrapper">
        <!-- 默认提示文本使用简单渲染 -->
        <div v-if="isDefaultHint" class="default-hint-text">
          {{ content }}
        </div>
        <!-- 流式传输时使用打字机效果 -->
        <Typewriter
          v-else-if="shouldShowTypewriter"
          :content="markdownContent"
          :interval="30"
          :step="2"
        />
        <!-- 非流式传输时使用 Markdown 组件 -->
        <XMarkdown
          v-else
          :content="markdownContent"
          class="ink-markdown-content"
        />
      </div>

      <!-- 墨滴装饰 -->
      <div class="ink-drip-decoration">
        <div class="drip-point"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkdown, Typewriter } from 'vue-element-plus-x'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

// 默认提示文本
const defaultHints = ['正在研墨思索...', '抱歉，墨迹未干，请稍后再试']

// 是否是默认提示
const isDefaultHint = computed(() => {
  return defaultHints.includes(props.content)
})

// 当内容正在流式传输时，显示打字机效果（排除默认提示）
const shouldShowTypewriter = computed(() => {
  return props.isStreaming && props.content && props.content.length > 0 && !isDefaultHint.value
})

// 流式传输完成或非流式状态，直接显示完整内容
const markdownContent = computed(() => {
  return props.content || ''
})
</script>

<style src="./NormalMessage.css"></style>
