<template>
  <div class="html-message">
    <div class="html-content-wrapper">
      <div class="html-frame">
        <iframe
          v-if="content"
          :srcdoc="content"
          class="html-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style src="./HtmlMessage.css"></style>
