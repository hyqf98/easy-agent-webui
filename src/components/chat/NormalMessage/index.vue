<template>
  <div class="normal-message">
    <div class="message-bubble" :class="{ 'streaming': isStreaming }">
      <div class="bubble-decoration"></div>
      <div class="markdown-content" v-html="renderedContent"></div>

      <!-- 流式输入时的光标效果 -->
      <span v-if="showCursor" class="streaming-cursor"></span>

      <!-- 墨滴装饰 -->
      <div class="ink-drip-decoration">
        <div class="drip-point"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNormalMessage } from './NormalMessage.js'

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

const { renderedContent, showCursor } = useNormalMessage(props)
</script>

<style src="./NormalMessage.css"></style>
