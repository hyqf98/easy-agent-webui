<template>
  <div class="ppt-message">
    <div class="ppt-content-wrapper">
      <div class="ppt-slide" :class="{ 'streaming': isStreaming }">
        <div class="ppt-inner">
          <div class="ppt-decoration-top"></div>
          <div class="ppt-content" v-html="renderedContent"></div>
          <div class="ppt-decoration-bottom"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

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

// 渲染 Markdown 内容为 PPT 风格
const renderedContent = computed(() => {
  if (!props.content) return ''

  let html = marked(props.content)

  // 添加 PPT 风格样式类
  html = html
    .replace(/<h1>/g, '<h1 class="ppt-h1">')
    .replace(/<h2>/g, '<h2 class="ppt-h2">')
    .replace(/<h3>/g, '<h3 class="ppt-h3">')
    .replace(/<p>/g, '<p class="ppt-p">')
    .replace(/<ul>/g, '<ul class="ppt-ul">')
    .replace(/<ol>/g, '<ol class="ppt-ol">')
    .replace(/<li>/g, '<li class="ppt-li">')
    .replace(/<strong>/g, '<strong class="ppt-strong">')
    .replace(/<em>/g, '<em class="ppt-em">')

  return html
})
</script>

<style src="./PptMessage.css"></style>
