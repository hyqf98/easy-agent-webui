<template>
  <div class="chat-container">
    <!-- 会话列表 -->
    <SessionList />

    <!-- 对话区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <MessageList />

      <!-- 输入区域 -->
      <InputArea />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import SessionList from './components/SessionList.vue'
import MessageList from './components/MessageList.vue'
import InputArea from './components/InputArea.vue'

const chatStore = useChatStore()

onMounted(() => {
  chatStore.init()
})
</script>

<style scoped src="./chat.css"></style>
