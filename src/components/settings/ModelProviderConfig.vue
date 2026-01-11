<template>
  <div class="model-provider-config">
    <!-- 提供商列表 -->
    <div class="provider-list">
      <TransitionGroup name="provider-item" tag="div" class="providers">
        <div
          v-for="provider in modelProviders"
          :key="provider.id"
          class="provider-card"
        >
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div class="provider-details">
                <div class="provider-name">{{ provider.name }}</div>
                <div class="provider-models-count">
                  {{ provider.models?.filter(m => m.enabled).length || 0 }} 个模型可用
                </div>
              </div>
            </div>
            <div class="provider-actions">
              <el-switch
                v-model="provider.enabled"
                :active-color="'#a86b4a'"
                @change="updateProvider(provider.id, { enabled: provider.enabled })"
              />
              <button class="action-btn" @click="expandProvider(provider.id)">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :style="{ transform: expandedProviderId === provider.id ? 'rotate(180deg)' : 'rotate(0deg)' }"
                >
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 展开的模型列表 -->
          <Transition name="expand">
            <div v-if="expandedProviderId === provider.id" class="provider-content">
              <!-- API 配置 -->
              <div class="api-config">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">API Key</label>
                    <input
                      v-model="provider.config.apiKey"
                      type="password"
                      class="form-input"
                      placeholder="sk-..."
                      @change="updateProvider(provider.id, { config: provider.config })"
                    />
                  </div>
                  <div v-if="providerRequiresBaseUrl(provider.id)" class="form-group">
                    <label class="form-label">Base URL</label>
                    <input
                      v-model="provider.config.baseUrl"
                      class="form-input"
                      placeholder="https://api.openai.com/v1"
                      @change="updateProvider(provider.id, { config: provider.config })"
                    />
                  </div>
                </div>
                <div class="test-btn-row">
                  <button
                    class="test-btn"
                    :disabled="isTesting"
                    @click="handleTestProvider(provider)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    {{ isTesting ? '测试中...' : '测试连接' }}
                  </button>
                </div>
              </div>

              <!-- 模型列表 -->
              <div class="models-section">
                <div class="models-header">
                  <h4 class="models-title">可用模型</h4>
                  <button class="add-model-btn" @click="showAddModelDialog(provider.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加模型
                  </button>
                </div>
                <div class="models-list">
                  <div
                    v-for="model in provider.models"
                    :key="model.id"
                    class="model-item"
                  >
                    <div class="model-info">
                      <el-switch
                        v-model="model.enabled"
                        :active-color="'#a86b4a'"
                        size="small"
                        @change="updateModel(provider.id, model.id, { enabled: model.enabled })"
                      />
                      <span class="model-name">{{ model.name }}</span>
                    </div>
                    <div class="model-actions">
                      <button
                        v-if="selectedModel.providerId === provider.id && selectedModel.modelId === model.id"
                        class="selected-badge"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        当前使用
                      </button>
                      <button
                        v-else
                        class="select-btn"
                        @click="handleSelectModel(provider.id, model.id)"
                      >
                        选择
                      </button>
                      <button
                        class="action-btn"
                        @click="deleteModel(provider.id, model.id)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- 空状态 -->
                  <div v-if="!provider.models || provider.models.length === 0" class="empty-models">
                    <p>暂无模型，请添加模型</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </TransitionGroup>

      <!-- 添加提供商按钮 -->
      <button class="add-provider-btn" @click="showAddProviderDialog = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加模型提供商
      </button>
    </div>

    <!-- 添加提供商弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showAddProviderDialog" class="modal-overlay" @click="showAddProviderDialog = false">
          <div class="provider-form-dialog" @click.stop>
            <div class="dialog-header">
              <h3 class="dialog-title">添加模型提供商</h3>
            </div>
            <div class="dialog-body">
              <div class="provider-grid">
                <div
                  v-for="provider in availableProviders"
                  :key="provider.id"
                  class="provider-option"
                  :class="{ 'selected': selectedProviderId === provider.id }"
                  @click="selectedProviderId = provider.id"
                >
                  <div class="provider-option-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div class="provider-option-name">{{ provider.name }}</div>
                </div>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="showAddProviderDialog = false">
                取消
              </button>
              <button
                class="dialog-btn dialog-btn-primary"
                :disabled="!selectedProviderId"
                @click="handleAddProvider"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 添加模型弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showAddModelDialogFlag" class="modal-overlay" @click="showAddModelDialogFlag = false">
          <div class="model-form-dialog" @click.stop>
            <div class="dialog-header">
              <h3 class="dialog-title">添加模型</h3>
            </div>
            <div class="dialog-body">
              <div class="form-group">
                <label class="form-label">模型名称</label>
                <input
                  v-model="modelForm.name"
                  class="form-input"
                  placeholder="例如：gpt-4"
                />
              </div>
              <div class="form-group">
                <label class="form-label">模型 ID</label>
                <input
                  v-model="modelForm.id"
                  class="form-input"
                  placeholder="例如：gpt-4"
                />
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="showAddModelDialogFlag = false">
                取消
              </button>
              <button class="dialog-btn dialog-btn-primary" @click="handleAddModel">
                确认
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettings } from '@/composables/useSettings'

const {
  modelProviders,
  availableProviders,
  selectedModel,
  isTesting,
  loadProviders,
  addModelProvider,
  updateModelProvider,
  deleteModelProvider,
  addModelToProvider,
  deleteModelFromProvider,
  selectModel,
  testModelConnection
} = useSettings()

const expandedProviderId = ref(null)
const showAddProviderDialog = ref(false)
const showAddModelDialogFlag = ref(false)
const selectedProviderId = ref(null)
const currentProviderId = ref(null)

const modelForm = reactive({
  name: '',
  id: ''
})

onMounted(() => {
  loadProviders()
})

const expandProvider = (id) => {
  if (expandedProviderId.value === id) {
    expandedProviderId.value = null
  } else {
    expandedProviderId.value = id
  }
}

const providerRequiresBaseUrl = (providerId) => {
  const provider = availableProviders.value.find(p => p.id === providerId)
  return provider?.requiresBaseUrl || false
}

const updateProvider = (id, updates) => {
  updateModelProvider(id, updates)
}

const updateModel = (providerId, modelId, updates) => {
  const provider = modelProviders.value.find(p => p.id === providerId)
  if (provider && provider.models) {
    const model = provider.models.find(m => m.id === modelId)
    if (model) {
      Object.assign(model, updates)
    }
  }
}

const deleteModel = (providerId, modelId) => {
  ElMessageBox.confirm('确定要删除此模型吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteModelFromProvider(providerId, modelId)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSelectModel = (providerId, modelId) => {
  selectModel(providerId, modelId)
  ElMessage.success('已切换模型')
}

const handleTestProvider = async (provider) => {
  const testModel = provider.models?.find(m => m.enabled)
  if (!testModel) {
    ElMessage.warning('请先添加并启用至少一个模型')
    return
  }

  await testModelConnection(provider.id, testModel.id, provider.config)
}

const handleAddProvider = () => {
  const provider = availableProviders.value.find(p => p.id === selectedProviderId.value)
  if (provider) {
    addModelProvider({
      id: provider.id,
      name: provider.name,
      config: {
        apiKey: '',
        baseUrl: provider.requiresBaseUrl ? '' : undefined
      }
    })
    ElMessage.success('添加成功')
    showAddProviderDialog.value = false
    selectedProviderId.value = null
  }
}

const showAddModelDialog = (providerId) => {
  currentProviderId.value = providerId
  modelForm.name = ''
  modelForm.id = ''
  showAddModelDialogFlag.value = true
}

const handleAddModel = () => {
  if (!modelForm.name.trim()) {
    ElMessage.warning('请输入模型名称')
    return
  }
  if (!modelForm.id.trim()) {
    ElMessage.warning('请输入模型 ID')
    return
  }

  addModelToProvider(currentProviderId.value, {
    name: modelForm.name,
    id: modelForm.id
  })

  ElMessage.success('添加成功')
  showAddModelDialogFlag.value = false
  currentProviderId.value = null
  modelForm.name = ''
  modelForm.id = ''
}
</script>

<style scoped src="./SettingsDialog.css" />
<style scoped>
.model-provider-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.provider-card {
  background: #faf8f3;
  border: 1px solid #e8e4dc;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.provider-card:hover {
  border-color: #3d3d3d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.provider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.provider-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a86b4a 0%, #8b5a3c 100%);
  border-radius: 8px;
  color: white;
}

.provider-icon svg {
  width: 20px;
  height: 20px;
}

.provider-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
}

.provider-models-count {
  font-size: 12px;
  color: #888;
}

.provider-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-content {
  border-top: 1px solid #e8e4dc;
  background: #f5f3ef;
}

.api-config {
  padding: 20px;
  border-bottom: 1px solid #e8e4dc;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.test-btn-row {
  display: flex;
  justify-content: flex-end;
}

.test-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f3ef;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
  color: #444;
  font-size: 13px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-btn svg {
  width: 14px;
  height: 14px;
}

.test-btn:hover:not(:disabled) {
  background: #e8e4dc;
  border-color: #a86b4a;
  color: #a86b4a;
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.models-section {
  padding: 20px;
}

.models-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.models-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
  margin: 0;
}

.add-model-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px dashed #d4cfc5;
  border-radius: 6px;
  color: #444;
  font-size: 12px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-model-btn svg {
  width: 12px;
  height: 12px;
}

.add-model-btn:hover {
  border-color: #a86b4a;
  color: #a86b4a;
}

.models-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-name {
  font-size: 14px;
  color: #2c2c2c;
  font-family: 'Noto Sans SC', sans-serif;
}

.model-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-btn {
  padding: 6px 12px;
  background: #f5f3ef;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
  color: #444;
  font-size: 12px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  background: #a86b4a;
  border-color: #a86b4a;
  color: white;
}

.selected-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #a86b4a 0%, #8b5a3c 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-family: 'KaiTi', serif;
}

.selected-badge svg {
  width: 12px;
  height: 12px;
}

.empty-models {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 13px;
}

.add-provider-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f5f3ef;
  border: 1px dashed #d4cfc5;
  border-radius: 8px;
  color: #444;
  font-size: 14px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-provider-btn svg {
  width: 16px;
  height: 16px;
}

.add-provider-btn:hover {
  background: #e8e4dc;
  border-color: #a86b4a;
  color: #a86b4a;
}

.provider-form-dialog,
.model-form-dialog {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e4dc;
}

.provider-form-dialog .dialog-header,
.model-form-dialog .dialog-header {
  padding: 20px;
  border-bottom: 1px solid #e8e4dc;
}

.provider-form-dialog .dialog-title,
.model-form-dialog .dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
  margin: 0;
}

.provider-form-dialog .dialog-body,
.model-form-dialog .dialog-body {
  padding: 20px;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.provider-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f5f3ef;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.provider-option:hover {
  background: #e8e4dc;
}

.provider-option.selected {
  border-color: #a86b4a;
  background: rgba(168, 107, 74, 0.05);
}

.provider-option-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #a86b4a;
}

.provider-option-icon svg {
  width: 20px;
  height: 20px;
}

.provider-option-name {
  font-size: 13px;
  font-weight: 500;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
  text-align: center;
}

.model-form-dialog .form-group {
  margin-bottom: 16px;
}

.model-form-dialog .form-group:last-child {
  margin-bottom: 0;
}

.provider-form-dialog .dialog-footer,
.model-form-dialog .dialog-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px 20px;
  justify-content: flex-end;
}

.provider-item-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.provider-item-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.provider-item-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.provider-item-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
