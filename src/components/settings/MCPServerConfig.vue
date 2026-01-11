<template>
  <div class="mcp-server-config">
    <!-- 服务器列表 -->
    <div class="server-list">
      <TransitionGroup name="server-item" tag="div" class="servers">
        <div
          v-for="server in mcpServers"
          :key="server.id"
          class="server-card"
          :class="{ 'disabled': !server.enabled }"
        >
          <div class="server-info">
            <div class="server-header">
              <div class="server-name">{{ server.name }}</div>
              <el-switch
                v-model="server.enabled"
                :active-color="'#a86b4a'"
                @change="updateServer(server.id, { enabled: server.enabled })"
              />
            </div>
            <div class="server-url">{{ server.url }}</div>
          </div>
          <div class="server-actions">
            <button class="action-btn" @click="editServer(server)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn danger" @click="deleteServer(server.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-if="mcpServers.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p class="empty-text">暂无 MCP 服务器配置</p>
      </div>
    </div>

    <!-- 添加按钮 -->
    <button class="add-btn" @click="showAddDialog = true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      添加 MCP 服务器
    </button>

    <!-- 添加/编辑弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showAddDialog" class="modal-overlay" @click="showAddDialog = false">
          <div class="server-form-dialog" @click.stop>
            <div class="dialog-header">
              <h3 class="dialog-title">
                {{ editingServer ? '编辑服务器' : '添加服务器' }}
              </h3>
            </div>
            <div class="dialog-body">
              <div class="form-group">
                <label class="form-label">服务器名称</label>
                <input
                  v-model="serverForm.name"
                  class="form-input"
                  placeholder="例如：本地 MCP 服务器"
                />
              </div>
              <div class="form-group">
                <label class="form-label">服务器地址</label>
                <input
                  v-model="serverForm.url"
                  class="form-input"
                  placeholder="http://localhost:3000"
                />
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="showAddDialog = false">
                取消
              </button>
              <button class="dialog-btn dialog-btn-primary" @click="handleSaveServer">
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
import { ref, reactive } from 'vue'
import { useSettings } from '@/composables/useSettings'

const {
  mcpServers,
  addMCPServer,
  updateMCPServer,
  deleteMCPServer
} = useSettings()

const showAddDialog = ref(false)
const editingServer = ref(null)

const serverForm = reactive({
  name: '',
  url: ''
})

const resetForm = () => {
  serverForm.name = ''
  serverForm.url = ''
  editingServer.value = null
}

const editServer = (server) => {
  editingServer.value = server
  serverForm.name = server.name
  serverForm.url = server.url
  showAddDialog.value = true
}

const updateServer = (id, updates) => {
  updateMCPServer(id, updates)
}

const deleteServer = (id) => {
  ElMessageBox.confirm('确定要删除此服务器配置吗？', '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteMCPServer(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveServer = () => {
  if (!serverForm.name.trim()) {
    ElMessage.warning('请输入服务器名称')
    return
  }
  if (!serverForm.url.trim()) {
    ElMessage.warning('请输入服务器地址')
    return
  }

  if (editingServer.value) {
    updateMCPServer(editingServer.value.id, {
      name: serverForm.name,
      url: serverForm.url
    })
    ElMessage.success('更新成功')
  } else {
    addMCPServer({
      name: serverForm.name,
      url: serverForm.url
    })
    ElMessage.success('添加成功')
  }

  showAddDialog.value = false
  resetForm()
}
</script>

<style scoped src="./SettingsDialog.css" />
<style scoped>
.mcp-server-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.server-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.servers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.server-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #faf8f3;
  border: 1px solid #e8e4dc;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.server-card:hover {
  border-color: #3d3d3d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.server-card.disabled {
  opacity: 0.6;
}

.server-info {
  flex: 1;
  min-width: 0;
}

.server-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.server-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
}

.server-url {
  font-size: 13px;
  color: #888;
  font-family: 'Noto Sans SC', sans-serif;
}

.server-actions {
  display: flex;
  gap: 8px;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f5f3ef;
  border: 1px dashed #d4cfc5;
  border-radius: 8px;
  color: #444;
  font-size: 14px;
  font-family: 'KaiTi', serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn svg {
  width: 16px;
  height: 16px;
}

.add-btn:hover {
  background: #e8e4dc;
  border-color: #a86b4a;
  color: #a86b4a;
}

.server-form-dialog {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e4dc;
}

.server-form-dialog .dialog-header {
  padding: 20px;
  border-bottom: 1px solid #e8e4dc;
}

.server-form-dialog .dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
  margin: 0;
}

.server-form-dialog .dialog-body {
  padding: 20px;
}

.server-form-dialog .dialog-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px 20px;
  justify-content: flex-end;
}

.server-item-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.server-item-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.server-item-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.server-item-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
