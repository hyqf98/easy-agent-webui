<template>
  <el-dialog
    v-model="dialogVisible"
    title="系统配置"
    width="56.25rem"
    :close-on-click-modal="false"
    class="system-config-dialog"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab" class="config-tabs">
      <el-tab-pane label="模型配置" name="model">
        <ModelConfigTab
          @refresh="handleRefresh"
        />
      </el-tab-pane>
      <el-tab-pane label="MCP配置" name="mcp">
        <McpConfigTab
          @refresh="handleRefresh"
        />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import ModelConfigTab from './ModelConfigTab.vue'
import McpConfigTab from './McpConfigTab.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'refresh'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const activeTab = ref('model')

const handleClose = () => {
  dialogVisible.value = false
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped>
.system-config-dialog {
  /* 对话框样式由全局主题控制 */
}

.config-tabs {
  min-height: 37.5rem;
}

:deep(.el-dialog__header) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

:deep(.el-dialog__body) {
  padding: 1.25rem;
}

:deep(.el-dialog__footer) {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-subtle);
}

:deep(.el-tabs__header) {
  margin-bottom: 1.25rem;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--border-subtle);
}

:deep(.el-tabs__item) {
  font-size: 0.9375rem;
  color: var(--text-tertiary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--accent-primary);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--accent-primary);
}
</style>
