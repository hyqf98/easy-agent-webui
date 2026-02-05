<template>
  <el-drawer
    v-model="drawerVisible"
    size="50rem"
    class="mcp-detail-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <span class="drawer-title">{{ mcpData?.serverName || 'MCP服务器详情' }}</span>
        <span v-if="mcpData" class="drawer-type" :class="`type-${mcpData.connectionType}`">
          {{ mcpData.connectionType }}
        </span>
      </div>
    </template>

    <!-- 配置信息区域 -->
    <div v-if="mcpData" class="config-info">
      <div class="info-section">
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">服务器名称</span>
            <span class="value">{{ mcpData.serverName }}</span>
          </div>
          <div class="info-item">
            <span class="label">描述</span>
            <span class="value">{{ mcpData.serverDesc || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">连接类型</span>
            <span class="value type-badge" :class="`type-${mcpData.connectionType}`">
              {{ mcpData.connectionType }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">状态</span>
            <span class="value status-badge" :class="mcpData.enabled ? 'enabled' : 'disabled'">
              {{ mcpData.enabled ? '已启用' : '已禁用' }}
            </span>
          </div>
        </div>
      </div>

      <!-- STDIO类型配置 -->
      <div v-if="mcpData.connectionType === 'STDIO'" class="info-section">
        <div class="section-title">STDIO配置</div>
        <div class="info-grid">
          <div class="info-item full-width">
            <span class="label">命令</span>
            <span class="value mono">{{ mcpData.command || '-' }}</span>
          </div>
          <div v-if="mcpData.commandArgs" class="info-item full-width">
            <span class="label">命令参数</span>
            <span class="value mono">{{ mcpData.commandArgs }}</span>
          </div>
          <div v-if="mcpData.envVars" class="info-item full-width">
            <span class="label">环境变量</span>
            <span class="value mono">{{ mcpData.envVars }}</span>
          </div>
        </div>
      </div>

      <!-- SSE类型配置 -->
      <div v-if="mcpData.connectionType === 'SSE'" class="info-section">
        <div class="section-title">SSE配置</div>
        <div class="info-grid">
          <div class="info-item full-width">
            <span class="label">服务器URL</span>
            <span class="value mono">{{ mcpData.serverUrl || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">端点路径</span>
            <span class="value">{{ mcpData.serverEndpoint || '/' }}</span>
          </div>
          <div class="info-item">
            <span class="label">请求超时</span>
            <span class="value">{{ mcpData.requestTimeout || 30 }}s</span>
          </div>
        </div>
      </div>

      <!-- HTTP_STREAM类型配置 -->
      <div v-if="mcpData.connectionType === 'HTTP_STREAM'" class="info-section">
        <div class="section-title">HTTP流式配置</div>
        <div class="info-grid">
          <div class="info-item full-width">
            <span class="label">服务器URL</span>
            <span class="value mono">{{ mcpData.serverUrl || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">请求超时</span>
            <span class="value">{{ mcpData.requestTimeout || 30 }}s</span>
          </div>
        </div>
      </div>

      <div v-if="mcpData.remarks" class="info-section">
        <div class="section-title">备注</div>
        <div class="remarks">{{ mcpData.remarks }}</div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="工具列表" name="tools">
        <div v-loading="loading.tools" class="tab-content">
          <el-table :data="tools" stripe>
            <el-table-column prop="name" label="工具名称" min-width="14rem" align="center" />
            <el-table-column prop="description" label="描述" min-width="20rem" align="center" show-overflow-tooltip />
            <el-table-column label="操作" width="6rem" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="copyToClipboard(row.name)"
                >
                  复制
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading.tools && tools.length === 0" description="暂无工具" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="资源列表" name="resources">
        <div v-loading="loading.resources" class="tab-content">
          <el-table :data="resources" stripe>
            <el-table-column prop="uri" label="资源URI" min-width="18rem" align="center" show-overflow-tooltip />
            <el-table-column prop="name" label="名称" min-width="12rem" align="center" />
            <el-table-column label="操作" width="6rem" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="copyToClipboard(row.uri)"
                >
                  复制
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading.resources && resources.length === 0" description="暂无资源" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="提示词列表" name="prompts">
        <div v-loading="loading.prompts" class="tab-content">
          <el-table :data="prompts" stripe>
            <el-table-column prop="name" label="提示词名称" min-width="14rem" align="center" />
            <el-table-column prop="description" label="描述" min-width="20rem" align="center" show-overflow-tooltip />
            <el-table-column label="操作" width="6rem" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="copyToClipboard(row.name)"
                >
                  复制
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading.prompts && prompts.length === 0" description="暂无提示词" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {mcpApi} from '@/api/mcp.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mcpId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const activeTab = ref('tools')

const mcpData = ref(null)
const tools = ref([])
const resources = ref([])
const prompts = ref([])

const loading = ref({
  mcp: false,
  tools: false,
  resources: false,
  prompts: false
})

// 加载MCP配置详情
const loadMcpData = async () => {
  if (!props.mcpId) return

  loading.value.mcp = true
  try {
    const data = await mcpApi.getById(props.mcpId)
    mcpData.value = data
  } finally {
    loading.value.mcp = false
  }
}

// 加载数据
const loadTools = async () => {
  if (!props.mcpId) return

  loading.value.tools = true
  try {
    const data = await mcpApi.listTools(props.mcpId)
    tools.value = data || []
  } finally {
    loading.value.tools = false
  }
}

const loadResources = async () => {
  if (!props.mcpId) return

  loading.value.resources = true
  try {
    const data = await mcpApi.listResources(props.mcpId)
    resources.value = data || []
  } finally {
    loading.value.resources = false
  }
}

const loadPrompts = async () => {
  if (!props.mcpId) return

  loading.value.prompts = true
  try {
    const data = await mcpApi.listPrompts(props.mcpId)
    prompts.value = data || []
  } finally {
    loading.value.prompts = false
  }
}

// 监听 mcpId 变化
watch(() => props.mcpId, (newId) => {
  if (newId && drawerVisible.value) {
    loadMcpData()
    loadTools()
    loadResources()
    loadPrompts()
  }
}, { immediate: true })

// 监听对话框打开
watch(() => props.visible, (visible) => {
  if (visible && props.mcpId) {
    loadMcpData()
    loadTools()
    loadResources()
    loadPrompts()
  }
})

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/* 抽屉头部 */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.drawer-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.drawer-type {
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.drawer-type.type-stdio {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.drawer-type.type-sse {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.drawer-type.type-http_stream {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

/* 配置信息区域 */
.config-info {
  margin-bottom: 1rem;
}

.info-section {
  margin-bottom: 1rem;
  padding: 0.875rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.info-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.625rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem 0.875rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.info-item .value {
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-weight: 500;
}

.info-item .value.mono {
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.75rem;
  background: var(--bg-tertiary);
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-sm);
  word-break: break-all;
}

.type-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.type-badge.type-stdio {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.type-badge.type-sse {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.type-badge.type-http_stream {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.status-badge.enabled {
  background: rgba(124, 154, 109, 0.15);
  color: var(--color-success);
}

.status-badge.disabled {
  background: var(--bg-hover);
  color: var(--text-tertiary);
}

.remarks {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 详情标签 */
.detail-tabs {
  height: 100%;
  overflow: hidden;
}

:deep(.el-tabs__content) {
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.tab-content {
  min-height: 16rem;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
}

:deep(.el-table) {
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  width: max-content;
  min-width: 100%;
}

:deep(.el-table .el-table__body-wrapper) {
  overflow-x: auto;
  overflow-y: auto;
}

:deep(.el-table th) {
  font-size: 0.8125rem;
  background: var(--bg-secondary);
  white-space: nowrap;
}

:deep(.el-table td) {
  font-size: 0.8125rem;
  white-space: nowrap;
}

:deep(.el-empty) {
  padding: 2rem 0;
}

:deep(.el-empty__description) {
  font-size: 0.875rem;
}
</style>
