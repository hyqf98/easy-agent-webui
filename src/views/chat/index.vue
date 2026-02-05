<template>
  <div class="chat-container">
    <!-- 会话列表 -->
    <SessionList :collapsed="chatStore.sidebarCollapsed" />

    <!-- 对话区域 -->
    <div class="chat-main" :class="{ 'sidebar-collapsed': chatStore.sidebarCollapsed }">
      <!-- 顶部工具栏 -->
      <div class="chat-header">
        <!-- 左侧：切换按钮 + 模型选择器 -->
        <div class="header-left">
          <button class="sidebar-toggle" @click="chatStore.toggleSidebar()">
            <svg v-if="!chatStore.sidebarCollapsed" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H12M4 10H12M4 16H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H10M3 10H10M3 16H7M14 4V16M14 4H17M14 16H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <div class="model-selector-wrapper">
            <el-select
              v-model="selectedModelId"
              placeholder="选择 AI 模型"
              class="model-select"
              popper-class="model-select-dropdown"
              @change="handleModelChange"
            >
              <el-option
                v-for="model in models"
                :key="model.id"
                :label="model.modelName"
                :value="model.id"
              >
                <div class="model-option">
                  <span class="model-name">{{ model.modelName }}</span>
                  <span class="model-provider">{{ model.providerDesc }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>

        <!-- 中间：当前会话标题（居中） -->
        <div class="session-title-display">
          {{ currentSessionTitle }}
        </div>
      </div>

      <!-- 消息列表 -->
      <MessageList />

      <!-- 输入区域 -->
      <InputArea />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import SessionList from './components/SessionList.vue'
import MessageList from './components/MessageList.vue'
import InputArea from './components/InputArea.vue'

const chatStore = useChatStore()

const sessions = computed(() => chatStore.sessions)
const currentSessionId = computed(() => chatStore.currentSessionId)
const models = computed(() => chatStore.models)
const selectedModelId = computed({
  get: () => chatStore.selectedModelId,
  set: (val) => chatStore.setSelectedModel(val)
})

const currentSessionTitle = computed(() => {
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  return session?.title || '新对话'
})

const handleModelChange = (modelId) => {
  chatStore.setSelectedModel(modelId)
}

onMounted(() => {
  chatStore.init()
  chatStore.loadModels()
})
</script>

<style scoped src="./chat.css"></style>
