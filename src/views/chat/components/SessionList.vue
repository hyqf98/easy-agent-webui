<template>
  <aside class="session-list">
    <!-- 模型选择器 -->
    <div class="model-selector-wrapper">
      <el-select
        v-model="selectedModelCode"
        placeholder="选择模型"
        size="small"
        class="model-select"
        @change="handleModelChange"
      >
        <el-option
          v-for="model in models"
          :key="model.modelCode"
          :label="model.modelName"
          :value="model.modelCode"
        >
          <div class="model-option">
            <span class="model-name">{{ model.modelName }}</span>
            <span class="model-provider">{{ model.providerDesc }}</span>
          </div>
        </el-option>
      </el-select>
    </div>

    <div class="session-list-header">
      <div class="header-content">
        <h2 class="session-list-title">对话</h2>
        <span class="session-count">{{ sessions.length }}</span>
      </div>
    </div>

    <div class="session-list-items">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === currentSessionId }"
        @click="selectSession(session.id)"
      >
        <div class="session-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M5.5 8L7.5 10L10.5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="session-info">
          <div class="session-title">{{ session.title }}</div>
          <div class="session-time">{{ formatTime(session.createdAt) }}</div>
        </div>
        <div class="session-actions">
          <button class="action-btn" @click.stop="deleteSession(session.id)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 4.5H10.5M4.5 4.5V9.5C4.5 10.0523 4.94772 10.5 5.5 10.5H8.5C9.05228 10.5 9.5 10.0523 9.5 9.5V4.5M6 4.5V3.5C6 3.22386 6.22386 3 6.5 3H7.5C7.77614 3 8 3.22386 8 3.5V4.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="session-list-footer">
      <button class="new-session-btn" @click="createNewSession">
        <span class="btn-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4.5V13.5M4.5 9H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>新建对话</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const sessions = computed(() => chatStore.sessions)
const currentSessionId = computed(() => chatStore.currentSessionId)
const models = computed(() => chatStore.models)
const selectedModelCode = computed({
  get: () => chatStore.selectedModelCode,
  set: (val) => chatStore.setSelectedModel(val)
})

const selectSession = (id) => {
  chatStore.setCurrentSession(id)
}

const createNewSession = () => {
  chatStore.createSession()
}

const deleteSession = (id) => {
  chatStore.deleteSession(id)
}

const handleModelChange = (modelCode) => {
  chatStore.setSelectedModel(modelCode)
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  chatStore.loadModels()
})
</script>

<style scoped>
.session-list {
  width: 18%;
  min-width: 14rem;
  max-width: 22rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
}

/* 模型选择器 */
.model-selector-wrapper {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.model-select {
  width: 100%;
}

.model-select :deep(.el-input__wrapper) {
  background: var(--bg-elevated);
  border-color: var(--border-subtle);
  box-shadow: none;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.model-select :deep(.el-input__wrapper:hover) {
  border-color: var(--border-default);
}

.model-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(124, 154, 109, 0.1);
}

.model-select :deep(.el-input__inner) {
  font-size: 0.8125rem;
  color: var(--text-primary);
}

.model-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.model-name {
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-weight: 500;
}

.model-provider {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

/* 会话列表头部 */
.session-list-header {
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-list-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.session-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-hover);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-full);
}

.session-list-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  position: relative;
}

.session-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.1875rem;
  height: 0;
  background: var(--accent-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: height 0.2s ease;
}

.session-item:hover {
  background: var(--bg-hover);
}

.session-item.active {
  background: var(--bg-active);
  box-shadow: var(--shadow-sm);
}

.session-item.active::before {
  height: 1.5rem;
}

.session-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}

.session-item:hover .session-icon {
  color: var(--accent-primary);
  background: var(--accent-light);
}

.session-item.active .session-icon {
  color: var(--accent-primary);
  background: var(--accent-light);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.125rem;
}

.session-time {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.session-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: var(--transition-base);
}

.session-item:hover .session-actions {
  opacity: 1;
}

.action-btn {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-base);
}

.action-btn:hover {
  color: var(--color-error);
  background: rgba(196, 120, 106, 0.1);
}

.session-list-footer {
  padding: 0.875rem;
  border-top: 1px solid var(--border-subtle);
}

.new-session-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.new-session-btn:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.new-session-btn:active {
  transform: translateY(0);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
