<template>
  <div class="model-config-tab">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模型编码或名称..."
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
          v-model="filterProvider"
          placeholder="提供商"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="provider in providerOptions"
            :key="provider.value"
            :label="provider.label"
            :value="provider.value"
          />
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
          新增模型
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
        <span class="stat-label">默认模型</span>
        <span class="stat-value default">{{ defaultCount }}</span>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div v-loading="loading" class="card-grid">
      <div
        v-for="item in tableData"
        :key="item.id"
        class="model-card"
        :class="{ disabled: !item.enabled }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="model-icon" :class="`provider-${item.providerType}`">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="header-info">
            <div class="model-name">{{ item.modelName }}</div>
            <div class="model-code">{{ item.modelCode }}</div>
          </div>
          <div class="card-badges">
            <span v-if="item.isDefault" class="badge badge-default">默认</span>
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
          <div class="info-row">
            <span class="info-label">提供商</span>
            <span class="info-value">{{ item.providerDesc || item.providerType }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">温度</span>
            <span class="info-value">{{ item.temperature }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">最大Token</span>
            <span class="info-value">{{ item.maxTokens }}</span>
          </div>

          <!-- 能力标签 -->
          <div class="capabilities">
            <span v-if="item.supportTools" class="capability-tag">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2L7.5 4.5H10.5L8.5 6.5L9.5 9.5L6 7.5L2.5 9.5L3.5 6.5L1.5 4.5H4.5L6 2Z" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              工具调用
            </span>
            <span v-if="item.supportVision" class="capability-tag">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4C2 2.89543 2.89543 2 4 2H8C9.10457 2 10 2.89543 10 4V8C10 9.10457 9.10457 10 8 10H4C2.89543 10 2 9.10457 2 8V4Z" stroke="currentColor" stroke-width="1"/>
                <path d="M3.5 6L4.5 7L6.5 5" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              视觉识别
            </span>
          </div>
        </div>

        <!-- 卡片操作 -->
        <div class="card-actions">
          <button class="action-btn" @click="handleEdit(item)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 11.5H12M2 11.5V7.5L9 0.5L12.5 4L5.5 11H2V11.5Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            编辑
          </button>
          <button
            class="action-btn"
            :class="{ active: item.isDefault }"
            @click="handleToggleDefault(item)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L9 5H12.5L10 8L11 12L7 10L3 12L4 8L1.5 5H5L7 2Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ item.isDefault ? '默认' : '设默认' }}
          </button>
          <button class="action-btn danger" @click="handleDelete(item)">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
        <p>暂无模型配置</p>
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
    <ModelFormDialog
      v-model:visible="formDialogVisible"
      :form-data="formData"
      :mode="formMode"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { modelApi } from '@/api/model.js'
import ModelFormDialog from './ModelFormDialog.vue'

const emit = defineEmits(['refresh'])

// 提供商选项
const providerOptions = [
  { label: 'OpenAI', value: 'openai' },
  { label: '智谱AI', value: 'zhipuai' },
  { label: 'Anthropic', value: 'anthropic' }
]

// 列表数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(12)

// 搜索和筛选
const searchKeyword = ref('')
const filterProvider = ref('')
const filterEnabled = ref(null)

// 统计数据
const enabledCount = computed(() => tableData.value.filter(item => item.enabled).length)
const defaultCount = computed(() => tableData.value.filter(item => item.isDefault).length)

// 表单对话框
const formDialogVisible = ref(false)
const formMode = ref('add')
const formData = ref(null)


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
    if (filterProvider.value) {
      query.providerType = filterProvider.value
    }
    if (filterEnabled.value !== null) {
      query.enabled = filterEnabled.value
    }

    const result = await modelApi.page(query)
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

// 切换默认
const handleToggleDefault = async (row) => {
  try {
    const action = row.isDefault ? '取消默认' : '设为默认'
    await ElMessageBox.confirm(
      `确认要${action}该模型吗？`,
      '提示',
      { type: 'warning' }
    )

    const updateData = {
      id: row.id,
      isDefault: !row.isDefault,
      modelCode: row.modelCode,
      modelName: row.modelName,
      providerType: row.providerType,
      apiKey: row.apiKey,
      supportTools: row.supportTools,
      supportVision: row.supportVision,
      enabled: row.enabled,
      sortOrder: row.sortOrder || 0
    }

    await modelApi.update(updateData)
    ElMessage.success('操作成功')
    loadData()
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败: ' + error.message)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除模型"${row.modelName}"吗？`,
      '警告',
      { type: 'warning' }
    )

    await modelApi.remove([row.id])
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
.model-config-tab {
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

.stat-value.default {
  color: var(--accent-primary);
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

/* 模型卡片 */
.model-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
}

.model-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.model-card.disabled {
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

.model-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: white;
}

.model-icon svg {
  width: 18px;
  height: 18px;
}

.model-icon.provider-openai {
  background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%);
}

.model-icon.provider-zhipuai {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.model-icon.provider-anthropic {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.model-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-code {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
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

.badge-default {
  background: var(--accent-light);
  color: var(--accent-primary);
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
  margin-bottom: 0.375rem;
}

.info-label {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.info-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.capabilities {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.capability-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.375rem;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  color: var(--text-secondary);
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

.action-btn.active {
  background: var(--accent-light);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
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
