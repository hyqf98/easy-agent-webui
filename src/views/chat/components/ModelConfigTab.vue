<template>
  <div class="model-config-tab">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索模型编码或名称"
        :prefix-icon="Search"
        clearable
        class="search-input"
        @input="handleSearch"
      />

      <el-select
        v-model="filterProvider"
        placeholder="提供商类型"
        clearable
        class="filter-select"
        @change="handleSearch"
      >
        <el-option label="OpenAI" value="openai" />
        <el-option label="智谱AI" value="zhipuai" />
        <el-option label="Anthropic" value="anthropic" />
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

      <el-table-column prop="modelCode" label="模型编码" min-width="9rem" />

      <el-table-column prop="modelName" label="模型名称" min-width="9rem" />

      <el-table-column prop="providerDesc" label="提供商" min-width="6rem" />

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

      <el-table-column label="默认" width="5rem">
        <template #default="{ row }">
          <el-tag v-if="row.isDefault" type="success" size="small">默认</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="能力" width="10rem">
        <template #default="{ row }">
          <el-tag v-if="row.supportTools" size="small" class="capability-tag">
            工具
          </el-tag>
          <el-tag v-if="row.supportVision" size="small" class="capability-tag">
            视觉
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="12.5rem" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="primary" @click="handleToggleDefault(row)">
            {{ row.isDefault ? '取消默认' : '设为默认' }}
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
    <ModelFormDialog
      v-model:visible="formDialogVisible"
      :form-data="formData"
      :mode="formMode"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { modelApi } from '@/api/model.js'
import ModelFormDialog from './ModelFormDialog.vue'

const emit = defineEmits(['refresh'])

// 列表数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchKeyword = ref('')
const filterProvider = ref('')
const filterEnabled = ref(null)

// 选中项
const selectedIds = ref([])

// 表单对话框
const formDialogVisible = ref(false)
const formMode = ref('add') // 'add' or 'edit'
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
      // 保持其他字段不变
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

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认要删除选中的 ${selectedIds.value.length} 条配置吗？`,
      '警告',
      { type: 'warning' }
    )

    await modelApi.remove(selectedIds.value)
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
.model-config-tab {
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

.capability-tag {
  margin-right: 0.375rem;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 0;
}
</style>
