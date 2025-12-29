<template>
  <div class="markdown-body" v-html="renderedContent"></div>
</template>

<script setup>
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

const renderedContent = computed(() => {
  return marked.parse(props.content || '')
})
</script>

<style scoped>
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.markdown-body pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.markdown-body table th,
.markdown-body table td {
  border: 1px solid #dfe2e5;
  padding: 8px 13px;
}

.markdown-body table th {
  background-color: #f6f8fa;
  font-weight: 600;
}
</style>
