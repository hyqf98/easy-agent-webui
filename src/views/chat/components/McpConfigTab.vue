<template>
  <div class="mcp-config-tab">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索服务器名称"
        :prefix-icon="Search"
        clearable
        class="search-input"
        @input="handleSearch"
      />

      <el-select
        v-model="filterConnectionType"
        placeholder="连接类型"
        clearable
        class="filter-select"
        @change="handleSearch"
      >
        <el-option label="STDIO" value="STDIO" />
        <el-option label="SSE" value="SSE" />
      </el-select>

      <el-select
        v-model="filterEnabled"
        placeholder="启用状态"
        clearable
        class="filter-select"
        @change="handleSearch"
      >
        <el-option label="已启用" :value="true" />
        <el-option label="已禁用" :value="false" />
      </el-select>

      <div class="toolbar-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      class="data-table"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="3rem" />

      <el-table-column prop="serverName" label="服务器名称" min-width="9rem" />

      <el-table-column prop="serverDesc" label="描述" min-width="12rem" />

      <el-table-column prop="connectionTypeDesc" label="连接类型" min-width="6rem" />

      <el-table-column label="状态" width="6.5rem">
        <template #default="{ row }">
          <div class="status-cell">
            <span
              class="status-dot"
              :class="{ active: row.enabled }"
            />
            <span>{{ row.enabled ? '已启用' : '已禁用' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="18.75rem" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            :loading="testing[row.id]"
            @click="handleTestConnection(row)"
          >
            <template v-if="testing[row.id]">
              <span class="testing-icon spinning">
                <svg width="0.875rem" height="0.875rem" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11 5L15 4.5L13.5 8L17 9.5L13.5 11L15 14.5L11 14L9 17L7 14L3 14.5L4.5 11L1 9.5L4.5 8L3 4.5L7 5L9 2Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </span>
              测试中
            </template>
            <template v-else>
              <span :class="connectionStatus[row.id]">
                {{ connectionStatus[row.id] === 'success' ? '连接成功' : '测试连接' }}
              </span>
            </template>
          </el-button>
          <el-button link type="primary" @click="handleViewDetails(row)">
            查看详情
          </el-button>
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { mcpApi } from '@/api/mcp.js'
import McpFormDialog from './McpFormDialog.vue'
import McpDetailDrawer from './McpDetailDrawer.vue'

const emit = defineEmits(['refresh'])

// 列表数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchKeyword = ref('')
const filterConnectionType = ref('')
const filterEnabled = ref(null)

// 选中项
const selectedIds = ref([])

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

// 选中变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
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

    // 2秒后重置状态
    setTimeout(() => {
      connectionStatus.value[row.id] = ''
    }, 2000)
  } catch (error) {
    connectionStatus.value[row.id] = 'error'
    ElMessage.error('连接失败: ' + error.message)

    setTimeout(() => {
      connectionStatus.value[row.id] = ''
    }, 2000)
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

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${selectedIds.value.length} 条配置吗？`,
      '警告',
      { type: 'warning' }
    )

    await mcpApi.remove(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
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

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-input {
  width: 16rem;
}

.filter-select {
  width: 9rem;
}

.toolbar-actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.data-table {
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.el-table__header) {
  background: var(--bg-secondary);
}

:deep(.el-table__body tr) {
  transition: background 0.2s;
}

:deep(.el-table__body tr:hover > td) {
  background: var(--bg-hover) !important;
}

:deep(.el-table__body tr.el-table__row--striped > td) {
  background: rgba(0, 0, 0, 0.02);
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.status-dot.active {
  background: var(--color-success);
}

.testing-icon {
  display: inline-flex;
  align-items: center;
}

.testing-icon.spinning svg {
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

.connection-status-success {
  color: var(--color-success);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 0;
}
</style>
