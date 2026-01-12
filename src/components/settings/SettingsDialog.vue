<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="settings-dialog" @click.stop>
          <!-- 头部 -->
          <div class="dialog-header">
            <div class="dialog-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="M1 12h6m6 0h6"/>
              </svg>
            </div>
            <h3 class="dialog-title">系统设置</h3>
            <button class="close-btn" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="dialog-body">
            <!-- 标签页 -->
            <el-tabs v-model="activeTab" class="settings-tabs">
              <!-- MCP 服务器配置 -->
              <el-tab-pane label="MCP 服务器" name="mcp">
                <MCPServerConfig />
              </el-tab-pane>

              <!-- 模型配置 -->
              <el-tab-pane label="模型配置" name="models">
                <ModelProviderConfig />
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 底部按钮 -->
          <div class="dialog-footer">
            <button class="dialog-btn dialog-btn-secondary" @click="handleClose">
              取消
            </button>
            <button
              class="dialog-btn dialog-btn-primary"
              :disabled="isSaving"
              @click="handleSave"
            >
              {{ isSaving ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useSettings } from '@/composables/useSettings'
import MCPServerConfig from './MCPServerConfig.vue'
import ModelProviderConfig from './ModelProviderConfig.vue'

const {
  settingsDialogVisible: visible,
  isSaving,
  saveCurrentConfig,
  closeSettingsDialog
} = useSettings()

const activeTab = ref('mcp')

console.log('SettingsDialog 初始化, visible:', visible.value)

const handleClose = () => {
  closeSettingsDialog()
}

const handleSave = async () => {
  const success = await saveCurrentConfig()
  if (success) {
    handleClose()
  }
}
</script>

<style scoped src="./SettingsDialog.css"></style>
