<template>
  <el-drawer
    v-model="drawerVisible"
    title="MCP服务器详情"
    :size="37.5rem"
    class="mcp-detail-drawer"
  >
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="工具列表" name="tools">
        <div v-loading="loading.tools" class="tab-content">
          <el-table :data="tools" stripe>
            <el-table-column prop="name" label="工具名称" min-width="12rem" />
            <el-table-column prop="description" label="描述" min-width="18rem" />
            <el-table-column label="操作" width="6rem">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="copyToClipboard(row.name)"
                >
                  复制名称
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
            <el-table-column prop="uri" label="资源URI" min-width="18rem" />
            <el-table-column prop="name" label="名称" min-width="12rem" />
            <el-table-column label="操作" width="6rem">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="copyToClipboard(row.uri)"
                >
                  复制URI
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
            <el-table-column prop="name" label="提示词名称" min-width="12rem" />
            <el-table-column prop="description" label="描述" min-width="18rem" />
            <el-table-column label="操作" width="6rem">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  @click="copyToClipboard(row.name)"
                >
                  复制名称
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { mcpApi } from '@/api/mcp.js'

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

const tools = ref([])
const resources = ref([])
const prompts = ref([])

const loading = ref({
  tools: false,
  resources: false,
  prompts: false
})

// 加载数据
const loadTools = async () => {
  if (!props.mcpId) return

  loading.value.tools = true
  try {
    const data = await mcpApi.listTools(props.mcpId)
    tools.value = data || []
  } catch (error) {
    ElMessage.error('加载工具列表失败: ' + error.message)
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
  } catch (error) {
    ElMessage.error('加载资源列表失败: ' + error.message)
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
  } catch (error) {
    ElMessage.error('加载提示词列表失败: ' + error.message)
  } finally {
    loading.value.prompts = false
  }
}

// 监听 mcpId 变化
watch(() => props.mcpId, (newId) => {
  if (newId && drawerVisible.value) {
    loadTools()
    loadResources()
    loadPrompts()
  }
}, { immediate: true })

// 监听对话框打开
watch(() => props.visible, (visible) => {
  if (visible && props.mcpId) {
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
.mcp-detail-drawer {
  /* 抽屉样式由全局主题控制 */
}

.detail-tabs {
  height: 100%;
}

.tab-content {
  min-height: 20rem;
}

:deep(.el-table) {
  border-radius: var(--radius-md);
}

:deep(.el-empty) {
  padding: 3rem 0;
}
</style>
