import { ref, computed } from 'vue'
import { getConfig, saveConfig, testModel, getProviders } from '@/api/settings'

// ==================== 状态定义 ====================

// 设置弹窗显示状态
const settingsDialogVisible = ref(false)

// MCP 服务器列表
const mcpServers = ref([])

// 模型提供商列表
const modelProviders = ref([])

// 当前选中的模型
const selectedModel = ref({
  providerId: null,
  modelId: null
})

// 支持的提供商信息（从后端获取）
const availableProviders = ref([])

// 加载状态
const isLoading = ref(false)
const isSaving = ref(false)
const isTesting = ref(false)

// ==================== 计算属性 ====================

/**
 * 获取当前选中的模型信息
 */
const currentModelInfo = computed(() => {
  if (!selectedModel.value.providerId || !selectedModel.value.modelId) {
    return null
  }
  const provider = modelProviders.value.find(p => p.id === selectedModel.value.providerId)
  if (!provider) return null
  const model = provider.models?.find(m => m.id === selectedModel.value.modelId)
  if (!model) return null
  return {
    provider: provider.name,
    model: model.name,
    providerId: provider.id,
    modelId: model.id
  }
})

/**
 * 获取可用的模型列表（用于切换器）
 */
const availableModels = computed(() => {
  const models = []
  modelProviders.value.forEach(provider => {
    if (provider.enabled && provider.models) {
      provider.models.forEach(model => {
        if (model.enabled) {
          models.push({
            providerId: provider.id,
            providerName: provider.name,
            modelId: model.id,
            modelName: model.name,
            displayName: `${provider.name} - ${model.name}`,
            enabled: true
          })
        }
      })
    }
  })
  return models
})

// ==================== API 调用方法 ====================

/**
 * 加载配置
 */
async function loadConfig() {
  isLoading.value = true
  try {
    const data = await getConfig()
    mcpServers.value = data.mcpServers || []
    modelProviders.value = data.modelProviders || []
    selectedModel.value = data.selectedModel || { providerId: null, modelId: null }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  } finally {
    isLoading.value = false
  }
}

/**
 * 加载支持的提供商
 */
async function loadProviders() {
  try {
    const data = await getProviders()
    availableProviders.value = data || []
  } catch (error) {
    console.error('加载提供商列表失败:', error)
  }
}

/**
 * 保存配置
 */
async function saveCurrentConfig() {
  isSaving.value = true
  try {
    await saveConfig({
      mcpServers: mcpServers.value,
      modelProviders: modelProviders.value,
      selectedModel: selectedModel.value
    })
    ElMessage.success('配置保存成功')
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存配置失败')
    return false
  } finally {
    isSaving.value = false
  }
}

/**
 * 测试模型连接
 */
async function testModelConnection(providerId, modelId, config) {
  isTesting.value = true
  try {
    const result = await testModel({
      providerId,
      modelId,
      config
    })
    ElMessage.success(`连接成功！延迟: ${result.latency}ms`)
    return true
  } catch (error) {
    console.error('测试连接失败:', error)
    ElMessage.error('连接失败，请检查配置')
    return false
  } finally {
    isTesting.value = false
  }
}

// ==================== MCP 服务器操作 ====================

/**
 * 添加 MCP 服务器
 */
function addMCPServer(server) {
  mcpServers.value.push({
    id: `mcp-${Date.now()}`,
    ...server,
    enabled: true
  })
}

/**
 * 更新 MCP 服务器
 */
function updateMCPServer(id, updates) {
  const index = mcpServers.value.findIndex(s => s.id === id)
  if (index > -1) {
    mcpServers.value[index] = { ...mcpServers.value[index], ...updates }
  }
}

/**
 * 删除 MCP 服务器
 */
function deleteMCPServer(id) {
  const index = mcpServers.value.findIndex(s => s.id === id)
  if (index > -1) {
    mcpServers.value.splice(index, 1)
  }
}

// ==================== 模型提供商操作 ====================

/**
 * 添加模型提供商
 */
function addModelProvider(provider) {
  modelProviders.value.push({
    id: `provider-${Date.now()}`,
    ...provider,
    enabled: true,
    models: []
  })
}

/**
 * 更新模型提供商
 */
function updateModelProvider(id, updates) {
  const index = modelProviders.value.findIndex(p => p.id === id)
  if (index > -1) {
    modelProviders.value[index] = { ...modelProviders.value[index], ...updates }
  }
}

/**
 * 删除模型提供商
 */
function deleteModelProvider(id) {
  const index = modelProviders.value.findIndex(p => p.id === id)
  if (index > -1) {
    // 如果删除的是当前选中的提供商，清空选择
    if (selectedModel.value.providerId === id) {
      selectedModel.value = { providerId: null, modelId: null }
    }
    modelProviders.value.splice(index, 1)
  }
}

/**
 * 为提供商添加模型
 */
function addModelToProvider(providerId, model) {
  const provider = modelProviders.value.find(p => p.id === providerId)
  if (provider) {
    if (!provider.models) {
      provider.models = []
    }
    provider.models.push({
      id: `model-${Date.now()}`,
      ...model,
      enabled: true
    })
  }
}

/**
 * 从提供商删除模型
 */
function deleteModelFromProvider(providerId, modelId) {
  const provider = modelProviders.value.find(p => p.id === providerId)
  if (provider && provider.models) {
    const index = provider.models.findIndex(m => m.id === modelId)
    if (index > -1) {
      // 如果删除的是当前选中的模型，清空选择
      if (selectedModel.value.providerId === providerId &&
          selectedModel.value.modelId === modelId) {
        selectedModel.value = { providerId: null, modelId: null }
      }
      provider.models.splice(index, 1)
    }
  }
}

/**
 * 选择模型
 */
function selectModel(providerId, modelId) {
  selectedModel.value = { providerId, modelId }
}

// ==================== 弹窗控制 ====================

/**
 * 打开设置弹窗
 */
function openSettingsDialog() {
  settingsDialogVisible.value = true
  loadConfig()
  loadProviders()
}

/**
 * 关闭设置弹窗
 */
function closeSettingsDialog() {
  settingsDialogVisible.value = false
}

// ==================== 导出 ====================

export function useSettings() {
  return {
    // 状态
    settingsDialogVisible,
    mcpServers,
    modelProviders,
    selectedModel,
    availableProviders,
    isLoading,
    isSaving,
    isTesting,
    // 计算属性
    currentModelInfo,
    availableModels,
    // API 方法
    loadConfig,
    loadProviders,
    saveCurrentConfig,
    testModelConnection,
    // MCP 服务器操作
    addMCPServer,
    updateMCPServer,
    deleteMCPServer,
    // 模型提供商操作
    addModelProvider,
    updateModelProvider,
    deleteModelProvider,
    addModelToProvider,
    deleteModelFromProvider,
    selectModel,
    // 弹窗控制
    openSettingsDialog,
    closeSettingsDialog
  }
}
