<template>
  <div class="model-provider-config">
    <!-- 提供商列表 -->
    <div class="provider-list">
      <!-- 空状态 -->
      <div v-if="!modelProviders || modelProviders.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <p class="empty-text">暂无模型配置</p>
      </div>

      <TransitionGroup name="provider-item" tag="div" class="providers">
        <div
            v-for="provider in modelProviders"
            :key="provider.id"
            class="provider-card"
        >
          <div class="provider-header">
            <div class="provider-info">
              <div class="provider-icon" v-html="getProviderIcon(provider.id)"></div>
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
                <div class="form-group">
                  <label class="form-label">Base URL</label>
                  <input
                      v-model="provider.config.baseUrl"
                      class="form-input"
                      :placeholder="getDefaultBaseUrl(provider.id)"
                      @change="updateProvider(provider.id, { config: provider.config })"
                  />
                  <p class="form-hint">{{ getDefaultBaseUrl(provider.id) || '无需修改请留空' }}</p>
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
              <!-- 第一步：选择提供商 -->
              <div v-if="!selectedProviderId" class="provider-step">
                <p class="step-title">选择提供商类型</p>
                <div class="provider-grid">
                  <div
                      v-for="provider in displayProviders"
                      :key="provider.id"
                      class="provider-option"
                      @click="handleSelectProviderToAdd(provider.id)"
                  >
                    <div class="provider-option-icon" v-html="getProviderIcon(provider.id)"></div>
                    <div class="provider-option-name">{{ provider.name }}</div>
                  </div>
                </div>
                <div v-if="hasMoreProviders && !showAllProviders" class="show-more-btn" @click="showAllProviders = true">
                  <span>查看更多 ({{ computedProviders.length - 6 }})</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </div>
                <div v-if="showAllProviders" class="show-more-btn" @click="showAllProviders = false">
                  <span>收起</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg)">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </div>
              </div>

              <!-- 第二步：配置提供商 -->
              <div v-else class="provider-config-step">
                <div class="selected-provider-header">
                  <button class="back-btn" @click="selectedProviderId = null">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="15,18 9,12 15,6"/>
                      <polyline points="4,12 20,12"/>
                    </svg>
                    返回
                  </button>
                  <span class="selected-provider-name">{{ getSelectedProviderName() }}</span>
                </div>
                <div class="config-form">
                  <div class="form-group">
                    <label class="form-label">API Key</label>
                    <input
                        v-model="providerForm.apiKey"
                        type="password"
                        class="form-input"
                        placeholder="请输入API Key"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Base URL</label>
                    <input
                        v-model="providerForm.baseUrl"
                        class="form-input"
                        :placeholder="getDefaultBaseUrl(selectedProviderId)"
                    />
                    <p class="form-hint">{{ getDefaultBaseUrl(selectedProviderId) }}</p>
                  </div>
                  <div class="form-group">
                    <label class="form-label">描述</label>
                    <input
                        v-model="providerForm.description"
                        class="form-input"
                        placeholder="可选，添加描述信息"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="showAddProviderDialog = false">
                取消
              </button>
              <button
                  v-if="!selectedProviderId"
                  class="dialog-btn dialog-btn-primary"
                  disabled
              >
                下一步
              </button>
              <button
                  v-else
                  class="dialog-btn dialog-btn-primary"
                  @click="handleAddProvider"
              >
                确认添加
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
import {computed, onMounted, reactive, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useSettings} from '@/composables/useSettings'

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

// 默认的提供商列表（当availableProviders为空时使用）
const defaultProviders = [

  {
    id: 'openai',
    name: 'OpenAI',
    requiresBaseUrl: true,
    icon: 'openai'
  },
  {
    id: 'zhipu',
    name: 'ZhiPu AI',
    requiresBaseUrl: true,
    icon: 'zhipu'
  },
  {
    id: 'ollama',
    name: 'Ollama',
    requiresBaseUrl: true,
    icon: 'ollama'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    requiresBaseUrl: false,
    icon: 'anthropic'
  },
  {
    id: 'azure_openai',
    name: 'Azure OpenAI',
    requiresBaseUrl: true,
    icon: 'azure'
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    requiresBaseUrl: true,
    icon: 'huggingface'
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    requiresBaseUrl: true,
    icon: 'minimax'
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    requiresBaseUrl: true,
    icon: 'moonshot'
  }
]

// 计算可用的提供商列表（优先使用从后端获取的，否则使用默认列表）
const computedProviders = computed(() => {
  return availableProviders.value && availableProviders.value.length > 0
      ? availableProviders.value
      : defaultProviders
})

const expandedProviderId = ref(null)
const showAddProviderDialog = ref(false)
const showAddModelDialogFlag = ref(false)
const selectedProviderId = ref(null)
const currentProviderId = ref(null)
const deletingModelKey = ref(null) // 用于防止重复点击删除
const showAllProviders = ref(false) // 是否显示所有提供商

const modelForm = reactive({
  name: '',
  id: ''
})

// 提供商配置表单
const providerForm = reactive({
  apiKey: '',
  baseUrl: '',
  description: ''
})

// 提供商默认Base URL映射
const providerDefaultUrls = {
  'ollama': 'http://localhost:11434',
  'openai': 'https://api.openai.com/v1',
  'zhipu': 'https://open.bigmodel.cn/api/paas/v4',
  'anthropic': 'https://api.anthropic.com',
  'azure_openai': 'https://{resource-name}.openai.azure.com/',
  'huggingface': 'https://api-inference.huggingface.co/v1',
  'minimax': 'https://api.minimax.chat/v1',
  'moonshot': 'https://api.moonshot.cn/v1'
}

const getDefaultBaseUrl = (providerId) => {
  return providerDefaultUrls[providerId] || ''
}

const getSelectedProviderName = () => {
  const provider = computedProviders.value.find(p => p.id === selectedProviderId.value)
  return provider?.name || ''
}

// 显示的提供商列表（控制折叠/展开）
const displayProviders = computed(() => {
  const providers = computedProviders.value
  if (providers.length <= 6 || showAllProviders.value) {
    return providers
  }
  return providers.slice(0, 6)
})

const hasMoreProviders = computed(() => {
  return computedProviders.value.length > 6
})

const handleSelectProviderToAdd = (providerId) => {
  selectedProviderId.value = providerId
  // 重置表单
  providerForm.apiKey = ''
  providerForm.baseUrl = providerDefaultUrls[providerId] || ''
  providerForm.description = ''
}

onMounted(() => {
  // 不在挂载时立即加载，由父组件 SettingsDialog 统一管理加载
  // loadProviders()
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
  const deleteKey = `${providerId}-${modelId}`
  // 防止重复点击
  if (deletingModelKey.value === deleteKey) {
    return
  }

  deletingModelKey.value = deleteKey

  ElMessageBox.confirm('确定要删除此模型吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    zIndex: 99999,
    closeOnClickModal: false,
    closeOnPressEscape: false
  }).then(() => {
    deleteModelFromProvider(providerId, modelId)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  }).finally(() => {
    deletingModelKey.value = null
  })
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
  const provider = computedProviders.value.find(p => p.id === selectedProviderId.value)
  if (provider) {
    addModelProvider({
      id: provider.id,
      name: provider.name,
      config: {
        apiKey: providerForm.apiKey || '',
        baseUrl: providerForm.baseUrl || getDefaultBaseUrl(provider.id),
        description: providerForm.description || ''
      }
    })
    ElMessage.success('添加成功')
    showAddProviderDialog.value = false
    selectedProviderId.value = null
    // 重置表单
    providerForm.apiKey = ''
    providerForm.baseUrl = ''
    providerForm.description = ''
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

// 获取提供商图标 SVG
const getProviderIcon = (providerId) => {
  const icons = {
    'anthropic': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.304 3.541a5.232 5.232 0 0 0-4.236 1.143l-.044.04a.437.437 0 0 0-.127.35l.064.402a.457.457 0 0 0 .748.267l.072-.066a4.034 4.034 0 0 1 3.267-.882 4.13 4.13 0 0 1 3.34 3.956v5.77c0 .248.203.45.45.45h.386a.45.45 0 0 0 .45-.45v-5.77a5.03 5.03 0 0 0-4.077-4.928l-.876-.143h-.882z"/>
      <path d="M16.587 8.523a.45.45 0 0 0-.596-.218l-.063.031a5.046 5.046 0 0 0-2.655 3.257l-.07.297a.45.45 0 0 0 .328.537l.396.095a.45.45 0 0 0 .537-.328l.07-.297a4.15 4.15 0 0 1 2.18-2.678l.063-.031a.45.45 0 0 0 .218-.596z"/>
      <path d="M6.697 3.541a5.232 5.232 0 0 1 4.236 1.143l.044.04a.437.437 0 0 1 .127.35l-.064.402a.457.457 0 0 1-.748.267l-.072-.066a4.034 4.034 0 0 0-3.267-.882 4.13 4.13 0 0 0-3.34 3.956v5.77c0 .248-.203.45-.45.45h-.386a.45.45 0 0 1-.45-.45v-5.77a5.03 5.03 0 0 1 4.077-4.928l.876-.143h.882z"/>
      <path d="M7.413 8.523a.45.45 0 0 1 .596-.218l.063.031a5.046 5.046 0 0 1 2.655 3.257l.07.297a.45.45 0 0 1-.328.537l-.396.095a.45.45 0 0 1-.537-.328l-.07-.297a4.15 4.15 0 0 0-2.18-2.678l-.063-.031a.45.45 0 0 1-.218-.596z"/>
    </svg>`,
    'azure': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 12.0007C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12.0007C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12.0007ZM10.9926 18.1407L14.6009 12.0007L10.9926 5.85878H13.9394L17.5481 12.0007L13.9394 18.1407H10.9926ZM6.45222 18.1407L10.0605 12.0007L6.45222 5.85878H9.39892L13.0072 12.0007L9.39892 18.1407H6.45222Z"/>
    </svg>`,
    'huggingface': `<svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="9" r="2"/>
      <circle cx="15" cy="9" r="2"/>
      <path d="M12 18c2.21 0 4-1.79 4-4H8c0 2.21 1.79 4 4 4z"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    </svg>`,
    'minimax': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 6v6M8 12h6"/>
    </svg>`,
    'moonshot': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`,
    'ollama': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>`,
    'openai': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
    </svg>`,
    'zhipu': `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>`,
    'default': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>`
  }
  return icons[providerId] || icons['default']
}
</script>

<style scoped src="./SettingsDialog.css"/>
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

.api-config .form-group {
  margin-bottom: 16px;
}

.api-config .form-group:last-child {
  margin-bottom: 0;
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

.provider-step {
  padding: 10px 0;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
  margin: 0 0 16px 0;
}

.provider-config-step {
  padding: 10px 0;
}

.selected-provider-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e8e4dc;
  margin-bottom: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
  color: #444;
  font-size: 12px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn svg {
  width: 14px;
  height: 14px;
}

.back-btn:hover {
  background: #f5f3ef;
  border-color: #a86b4a;
  color: #a86b4a;
}

.selected-provider-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  font-family: 'Noto Sans SC', sans-serif;
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

/* 删除确认弹窗样式 */
:global(.el-message-box) {
  z-index: 99999 !important;
}

:global(.el-overlay.el-message-box__wrapper) {
  z-index: 99999 !important;
}

/* 显示更多按钮 */
.show-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  padding: 10px 16px;
  background: #f5f3ef;
  border: 1px dashed #d4cfc5;
  border-radius: 8px;
  color: #444;
  font-size: 13px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.show-more-btn:hover {
  background: #e8e4dc;
  border-color: #a86b4a;
  color: #a86b4a;
}

.show-more-btn svg {
  width: 14px;
  height: 14px;
}

/* 提供商图标容器 */
.provider-icon :deep(svg),
.provider-option-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
