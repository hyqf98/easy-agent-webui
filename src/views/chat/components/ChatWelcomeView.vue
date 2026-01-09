<template>
  <div class="chat-content-area welcome-layout">
    <Transition name="welcome-fade">
      <div class="welcome-container">
        <!-- 上部分：标题和艺术字 -->
        <div class="welcome-content-top">
          <div class="welcome-ink-art">
            <div class="ink-circle-large"></div>
            <div class="ink-text-large">灵犀</div>
          </div>
          <p class="welcome-title">灵犀问答</p>
        </div>

        <!-- 输入区域 -->
        <div class="input-area centered">
          <ChatInputArea
            mode="normal"
            v-bind="$attrs"
          />
        </div>

        <!-- 下部分：副标题和提示 -->
        <div class="welcome-content-bottom">
          <p class="welcome-subtitle">笔墨之间，智慧流淌</p>
          <p class="welcome-hint">新建对话或输入消息开始交流</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import ChatInputArea from './ChatInputArea.vue'
</script>

<style src="../AiChatView.css"></style>
