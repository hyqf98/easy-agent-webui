<template>
  <div class="chat-content-area welcome-layout">
    <Transition name="welcome-fade">
      <div class="welcome-container">
        <!-- 上部分：艺术字 -->
        <div class="welcome-content-top">
          <div class="welcome-ink-art">
            <!-- 墨迹方框装饰 - 不完全包裹文字 -->
            <div class="ink-frame-decoration">
              <div class="ink-corner ink-corner-tl"></div>
              <div class="ink-corner ink-corner-tr"></div>
              <div class="ink-corner ink-corner-bl"></div>
              <div class="ink-corner ink-corner-br"></div>
              <div class="ink-stroke ink-stroke-top"></div>
              <div class="ink-stroke ink-stroke-bottom"></div>
            </div>
            <div class="ink-text-large">灵犀</div>
          </div>
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
