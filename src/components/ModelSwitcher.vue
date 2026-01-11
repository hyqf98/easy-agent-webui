<template>
  <div class="model-switcher">
    <el-dropdown
      trigger="click"
      placement="bottom-start"
      @visible-change="handleDropdownVisible"
    >
      <div class="model-selector">
        <div class="current-model">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span class="model-text">{{ currentModelText }}</span>
        </div>
        <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="model-dropdown-menu">
          <div class="dropdown-header">
            <span class="dropdown-title">选择模型</span>
          </div>
          <div class="dropdown-search">
            <input
              v-model="searchQuery"
              class="search-input"
              placeholder="搜索模型..."
            />
          </div>
          <div class="model-list">
            <div
              v-for="model in filteredModels"
              :key="`${model.providerId}-${model.modelId}`"
              class="model-option"
              :class="{ 'selected': isModelSelected(model.providerId, model.modelId) }"
              @click="handleSelectModel(model)"
            >
              <div class="model-option-info">
                <div class="model-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div class="model-option-details">
                  <div class="model-option-name">{{ model.modelName }}</div>
                  <div class="model-option-provider">{{ model.providerName }}</div>
                </div>
              </div>
              <div v-if="isModelSelected(model.providerId, model.modelId)" class="model-option-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredModels.length === 0" class="empty-models">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>未找到匹配的模型</p>
            </div>
          </div>
          <div class="dropdown-footer">
            <button class="settings-link" @click="openSettings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="M1 12h6m6 0h6"/>
              </svg>
              模型设置
            </button>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettings } from '@/composables/useSettings'

const {
  currentModelInfo,
  availableModels,
  selectedModel,
  selectModel,
  openSettingsDialog
} = useSettings()

const searchQuery = ref('')

const currentModelText = computed(() => {
  if (currentModelInfo.value) {
    return currentModelInfo.value.model
  }
  return '选择模型'
})

const filteredModels = computed(() => {
  if (!searchQuery.value) {
    return availableModels.value
  }
  const query = searchQuery.value.toLowerCase()
  return availableModels.value.filter(model =>
    model.modelName.toLowerCase().includes(query) ||
    model.providerName.toLowerCase().includes(query)
  )
})

const isModelSelected = (providerId, modelId) => {
  return selectedModel.value.providerId === providerId &&
         selectedModel.value.modelId === modelId
}

const handleSelectModel = (model) => {
  selectModel(model.providerId, model.modelId)
  ElMessage.success(`已切换到 ${model.displayName}`)
}

const handleDropdownVisible = (visible) => {
  if (visible) {
    searchQuery.value = ''
  }
}

const openSettings = () => {
  openSettingsDialog()
}
</script>

<style scoped>
.model-switcher {
  position: absolute;
  left: 80px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(250, 248, 243, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-细, #e8e4dc);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.model-selector:hover {
  background: rgba(255, 255, 255, 0.98);
  border-color: var(--ink-清, #3d3d3d);
  box-shadow: var(--shadow-墨-浅, 0 2px 8px rgba(0, 0, 0, 0.08));
}

.current-model {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.current-model svg {
  width: 16px;
  height: 16px;
  color: var(--accent-赭石, #a86b4a);
  flex-shrink: 0;
}

.model-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-焦, #2c2c2c);
  font-family: var(--font-宋, 'Noto Serif SC', serif);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  color: var(--ink-淡, #888);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.model-selector:hover .dropdown-arrow {
  color: var(--ink-重, #444);
}

/* 下拉菜单样式 */
.model-dropdown-menu {
  width: 280px;
  background: #ffffff;
  border: 1px solid var(--border-细, #e8e4dc);
  border-radius: 8px;
  box-shadow: var(--shadow-墨-深, 0 8px 24px rgba(0, 0, 0, 0.15));
  padding: 0;
  overflow: hidden;
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-细, #e8e4dc);
  background: var(--paper-新, #faf8f3);
}

.dropdown-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-焦, #2c2c2c);
  font-family: var(--font-宋, 'Noto Serif SC', serif);
}

.dropdown-search {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-细, #e8e4dc);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--ink-晕染-浅, #f5f3ef);
  border: 1px solid var(--border-细, #e8e4dc);
  border-radius: 6px;
  font-size: 13px;
  font-family: var(--font-宋, 'Noto Serif SC', serif);
  color: var(--ink-焦, #2c2c2c);
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  background: #ffffff;
  border-color: var(--accent-赭石, #a86b4a);
  box-shadow: 0 0 0 3px rgba(168, 107, 74, 0.1);
}

.search-input::placeholder {
  color: var(--ink-淡, #888);
}

.model-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-淡, #888) transparent;
}

.model-list::-webkit-scrollbar {
  width: 4px;
}

.model-list::-webkit-scrollbar-thumb {
  background: var(--ink-淡, #888);
  border-radius: 2px;
}

.model-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.model-option:hover {
  background: var(--ink-晕染-浅, #f5f3ef);
}

.model-option.selected {
  background: rgba(168, 107, 74, 0.08);
}

.model-option.selected:hover {
  background: rgba(168, 107, 74, 0.12);
}

.model-option-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.model-option-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-晕染-浅, #f5f3ef);
  border-radius: 6px;
  color: var(--accent-赭石, #a86b4a);
  flex-shrink: 0;
}

.model-option-icon svg {
  width: 14px;
  height: 14px;
}

.model-option-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.model-option-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink-焦, #2c2c2c);
  font-family: var(--font-黑, 'Noto Sans SC', sans-serif);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-option-provider {
  font-size: 11px;
  color: var(--ink-淡, #888);
  font-family: var(--font-黑, 'Noto Sans SC', sans-serif);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-option-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-赭石, #a86b4a);
  flex-shrink: 0;
}

.model-option-check svg {
  width: 14px;
  height: 14px;
}

.empty-models {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  color: var(--ink-淡, #888);
}

.empty-models svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-models p {
  font-size: 13px;
  margin: 0;
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-细, #e8e4dc);
  background: var(--paper-新, #faf8f3);
}

.settings-link {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border-细, #e8e4dc);
  border-radius: 6px;
  color: var(--ink-重, #444);
  font-size: 13px;
  font-family: var(--font-楷, 'KaiTi', serif);
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-link svg {
  width: 14px;
  height: 14px;
}

.settings-link:hover {
  background: var(--ink-晕染-浅, #f5f3ef);
  border-color: var(--accent-赭石, #a86b4a);
  color: var(--accent-赭石, #a86b4a);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .model-switcher {
    left: 60px;
  }

  .model-selector {
    min-width: 140px;
    padding: 6px 12px;
  }

  .model-text {
    font-size: 13px;
  }

  .model-dropdown-menu {
    width: 260px;
    left: 0 !important;
  }
}
</style>
