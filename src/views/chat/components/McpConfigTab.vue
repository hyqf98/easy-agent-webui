<template>
  <div class="mcp-config-tab">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索服务器名称..."
          clearable
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="search-icon">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </template>
        </el-input>

        <el-select
          v-model="filterConnectionType"
          placeholder="连接类型"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="STDIO" value="stdio" />
          <el-option label="SSE" value="sse" />
          <el-option label="HTTP" value="http_stream" />
        </el-select>

        <el-select
          v-model="filterEnabled"
          placeholder="状态"
          clearable
          class="status-select"
          @change="handleSearch"
        >
          <el-option label="已启用" :value="true" />
          <el-option label="已禁用" :value="false" />
        </el-select>
      </div>

      <div class="toolbar-actions">
        <el-button type="primary" class="add-btn" @click="handleAdd">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          新增服务
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">总计</span>
        <span class="stat-value">{{ total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已启用</span>
        <span class="stat-value enabled">{{ enabledCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">STDIO</span>
        <span class="stat-value stdio">{{ stdioCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">SSE</span>
        <span class="stat-value sse">{{ sseCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">HTTP</span>
        <span class="stat-value httpstream">{{ httpStreamCount }}</span>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div v-loading="loading" class="card-grid">
      <div
        v-for="item in tableData"
        :key="item.id"
        class="mcp-card"
        :class="{ disabled: !item.enabled }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="mcp-icon" :class="`type-${item.connectionType}`">
            <svg v-if="item.connectionType === 'stdio'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M18 18L22 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M2 12H4M20 12H22M12 2V4M12 20V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="header-info">
            <div class="server-name">{{ item.serverName }}</div>
            <div class="server-desc">{{ item.serverDesc || '无描述' }}</div>
          </div>
          <div class="card-badges">
            <span
              class="badge badge-type"
              :class="`type-${item.connectionType}`"
            >
              {{ item.connectionType }}
            </span>
            <span
              class="badge badge-status"
              :class="item.enabled ? 'enabled' : 'disabled'"
            >
              {{ item.enabled ? '启用' : '禁用' }}
            </span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-body">
          <!-- STDIO类型：显示命令和参数 -->
          <template v-if="item.connectionType === 'stdio'">
            <div class="info-row">
              <span class="info-label">命令</span>
              <span class="info-value mono">{{ item.command || '-' }}</span>
            </div>
            <div v-if="item.commandArgs" class="info-row">
              <span class="info-label">参数</span>
              <span class="info-value mono args">{{ item.commandArgs }}</span>
            </div>
          </template>

          <!-- SSE类型：显示URL和端点 -->
          <template v-else-if="item.connectionType === 'sse'">
            <div class="info-row">
              <span class="info-label">URL</span>
              <span class="info-value mono">{{ item.serverUrl || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">端点</span>
              <span class="info-value">{{ item.serverEndpoint || '/' }}</span>
            </div>
          </template>

          <!-- HTTP_STREAM类型：显示URL -->
          <template v-else-if="item.connectionType === 'http_stream'">
            <div class="info-row">
              <span class="info-label">URL</span>
              <span class="info-value mono">{{ item.serverUrl || '-' }}</span>
            </div>
          </template>

          <!-- 其他类型：显示URL -->
          <template v-else>
            <div class="info-row">
              <span class="info-label">URL</span>
              <span class="info-value mono">{{ item.serverUrl || '-' }}</span>
            </div>
          </template>
        </div>

        <!-- 卡片操作 -->
        <div class="card-actions">
          <button
            class="action-btn"
            :class="{ testing: testing[item.id], success: connectionStatus[item.id] === 'success' }"
            @click="handleTestConnection(item)"
          >
            <svg v-if="!testing[item.id] && connectionStatus[item.id] !== 'success'" width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L9 5H12.5L10 8L11 12L7 10L3 12L4 8L1.5 5H5L7 2Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="connectionStatus[item.id] === 'success'" width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 7L5.5 9.5L11 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 14 14" fill="none" class="spinning">
              <path d="M7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12C9.76142 12 12 9.76142 12 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ testing[item.id] ? '测试中' : connectionStatus[item.id] === 'success' ? '成功' : '测试' }}
          </button>
          <button class="action-btn" @click="handleViewDetails(item)">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 2H12V12H2V2Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M5 5H9M5 7H9M5 9H7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            详情
          </button>
          <button class="action-btn" @click="handleEdit(item)">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 11.5H12M2 11.5V7.5L9 0.5L12.5 4L5.5 11H2V11.5Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            编辑
          </button>
          <button class="action-btn danger" @click="handleDelete(item)">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 4H11M4 4V11C4 11.55 4.45 12 5 12H9C9.55 12 10 11.55 10 11V4M5 4V3C5 2.45 5.45 2 6 2H8C8.55 2 9 2.45 9 3V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            删除
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" stroke-width="2"/>
          <path d="M20 32H44M32 20V44" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>暂无MCP配置</p>
      </div>
    </div>

    <!-- 分页器 -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 表单对话框 -->
    <McpFormDialog
      v-model:visible="formDialogVisible"
      :form-data="formData"
      :mode="formMode"
      @submit="handleFormSubmit"
    />

    <!-- 详情抽屉 -->
    <McpDetailDrawer
      v-model:visible="detailDrawerVisible"
      :mcp-id="selectedMcpId"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mcpApi } from '@/api/mcp.js'
import McpFormDialog from './McpFormDialog.vue'
import McpDetailDrawer from './McpDetailDrawer.vue'

const emit = defineEmits(['refresh'])

// 列表数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(12)

// 搜索和筛选
const searchKeyword = ref('')
const filterConnectionType = ref('')
const filterEnabled = ref(null)

// 统计数据
const enabledCount = computed(() => tableData.value.filter(item => item.enabled).length)
const stdioCount = computed(() => tableData.value.filter(item => item.connectionType === 'stdio').length)
const sseCount = computed(() => tableData.value.filter(item => item.connectionType === 'sse').length)
const httpStreamCount = computed(() => tableData.value.filter(item => item.connectionType === 'http_stream').length)

// 表单对话框
const formDialogVisible = ref(false)
const formMode = ref('add')
const formData = ref(null)

// 详情抽屉
const detailDrawerVisible = ref(false)
const selectedMcpId = ref(null)

// 连接测试状态
const testing = ref({})
const connectionStatus = ref({})


// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const query = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }

    if (searchKeyword.value) {
      query.keyword = searchKeyword.value
    }
    if (filterConnectionType.value) {
      query.connectionType = filterConnectionType.value
    }
    if (filterEnabled.value !== null) {
      query.enabled = filterEnabled.value
    }

    const result = await mcpApi.page(query)
    tableData.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    ElMessage.error('加载数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

// 分页
const handlePageChange = () => {
  loadData()
}

const handleSizeChange = () => {
  pageNum.value = 1
  loadData()
}

// 新增
const handleAdd = () => {
  formMode.value = 'add'
  formData.value = null
  formDialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  formDialogVisible.value = true
}

// 表单提交
const handleFormSubmit = async () => {
  formDialogVisible.value = false
  loadData()
  emit('refresh')
}

// 测试连接
const handleTestConnection = async (row) => {
  testing.value[row.id] = true
  connectionStatus.value[row.id] = ''

  try {
    await mcpApi.testConnection(row.id)
    connectionStatus.value[row.id] = 'success'
    ElMessage.success('连接成功')

    // 3秒后重置状态
    setTimeout(() => {
      connectionStatus.value[row.id] = ''
    }, 3000)
  } catch (error) {
    connectionStatus.value[row.id] = 'error'
    // 直接显示后端返回的错误消息，不再添加前缀
    ElMessage.error(error.message || '连接失败')

    setTimeout(() => {
      connectionStatus.value[row.id] = ''
    }, 3000)
  } finally {
    testing.value[row.id] = false
  }
}

// 查看详情
const handleViewDetails = (row) => {
  selectedMcpId.value = row.id
  detailDrawerVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除MCP配置"${row.serverName}"吗？`,
      '警告',
      { type: 'warning' }
    )

    await mcpApi.remove([row.id])
    ElMessage.success('删除成功')
    loadData()
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.mcp-config-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
  margin-right: 0.5rem;
}

.search-input {
  width: 16rem;
  flex-shrink: 0;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: 0 0 0 1px var(--border-default) inset;
  padding: 0.5rem 0.75rem;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--border-strong) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--accent-primary) inset;
}

.search-icon {
  color: var(--text-tertiary);
}

.filter-select {
  width: 10rem;
  flex-shrink: 0;
}

:deep(.filter-select .el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: 0 0 0 1px var(--border-default) inset;
  padding: 0.5rem 0.75rem;
}

:deep(.filter-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--border-strong) inset;
}

:deep(.filter-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--accent-primary) inset;
}

.status-select {
  width: 5rem;
  flex-shrink: 0;
}

:deep(.status-select .el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: 0 0 0 1px var(--border-default) inset;
  padding: 0.5rem 0.75rem;
}

:deep(.status-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--border-strong) inset;
}

:deep(.status-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--accent-primary) inset;
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  padding: 0.625rem 1rem;
  font-weight: 500;
  background: #7c9a6d;
  border-color: #6a8549;
}

.add-btn:hover {
  background: #6a8549;
  border-color: #5d7440;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.875rem 1rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.enabled {
  color: var(--color-success);
}

.stat-value.stdio {
  color: #3b82f6;
}

.stat-value.sse {
  color: #8b5cf6;
}

.stat-value.httpstream {
  color: #f59e0b;
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.75rem;
  max-height: 22rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* 卡片网格滚动条美化 */
.card-grid::-webkit-scrollbar {
  width: 6px;
}

.card-grid::-webkit-scrollbar-track {
  background: var(--bg-hover);
  border-radius: var(--radius-full);
}

.card-grid::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--radius-full);
}

.card-grid::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

/* MCP卡片 */
.mcp-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
}

.mcp-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.mcp-card.disabled {
  opacity: 0.7;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-secondary) 100%);
}

.mcp-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: white;
}

.mcp-icon svg {
  width: 18px;
  height: 18px;
}

.mcp-icon.type-stdio {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.mcp-icon.type-sse {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.mcp-icon.type-http_stream {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.server-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.server-desc {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-badges {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.badge {
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  font-weight: 500;
}

.badge-type.type-stdio {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.badge-type.type-sse {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.badge-type.type-http_stream {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.badge-status.enabled {
  background: rgba(52, 211, 153, 0.15);
  color: var(--color-success);
}

.badge-status.disabled {
  background: var(--bg-hover);
  color: var(--text-tertiary);
}

.card-body {
  padding: 0.625rem 0.75rem;
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.info-label {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.info-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 10rem;
}

.info-value.mono {
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  font-size: 0.6875rem;
}

.info-value.mono.args {
  color: var(--accent-primary);
  font-size: 0.625rem;
}

.connection-status {
  margin-top: 0.375rem;
}

.test-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.test-btn svg {
  width: 12px;
  height: 12px;
}

.test-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.test-btn.testing {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
}

.test-btn.success {
  background: rgba(52, 211, 153, 0.1);
  border-color: var(--color-success);
  color: var(--color-success);
}

svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.card-actions {
  display: flex;
  padding: 0.5rem 0.75rem;
  gap: 0.375rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.action-btn svg {
  width: 12px;
  height: 12px;
}

.action-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-tertiary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-state p {
  font-size: 0.9375rem;
  margin-bottom: 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

:deep(.el-pagination) {
  gap: 0.25rem;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  border-radius: var(--radius-md);
  min-width: 2rem;
  height: 2rem;
  line-height: 2rem;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--accent-primary);
  color: var(--text-inverse);
}
</style>
