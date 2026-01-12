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
              <div class="server-transport">
                <span class="transport-badge" :class="getTransportModeClass(server.transportMode)">
                  {{ getTransportModeLabel(server.transportMode) }}
                </span>
              </div>
              <el-switch
                v-model="server.enabled"
                :active-color="'#a86b4a'"
                @change="updateServer(server.id, { enabled: server.enabled })"
              />
            </div>
            <div class="server-url">{{ server.url }}</div>
          </div>
          <div class="server-actions">
            <button
              class="action-btn test-btn"
              :class="{ 'testing': testingServerId === server.id }"
              :disabled="!server.enabled"
              @click="testServer(server)"
              title="测试连接"
            >
              <svg v-if="testingServerId !== server.id" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
              </svg>
            </button>
            <button class="action-btn" @click="editServer(server)" title="编辑">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn danger" @click="deleteServer(server.id)" title="删除">
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
              <div class="form-group">
                <label class="form-label">传输模式</label>
                <select v-model="serverForm.transportMode" class="form-input">
                  <option value="sse">SSE (Server-Sent Events)</option>
                  <option value="http_stream">HTTP Stream</option>
                </select>
                <p class="form-hint">选择 MCP 服务器的传输模式</p>
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

    <!-- MCP 服务器信息弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showInfoDialog" class="modal-overlay" @click="showInfoDialog = false">
          <div class="info-dialog" @click.stop>
            <div class="dialog-header">
              <div class="dialog-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <h3 class="dialog-title">{{ serverInfo?.name || 'MCP 服务器信息' }}</h3>
              <button class="close-btn" @click="showInfoDialog = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="dialog-body">
              <!-- 服务器基本信息 -->
              <div v-if="serverInfo" class="info-section">
                <div class="info-section-title">服务器信息</div>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">版本</span>
                    <span class="info-value">{{ serverInfo.version || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">协议版本</span>
                    <span class="info-value">{{ serverInfo.protocolVersion || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- 能力信息 -->
              <div v-if="serverInfo?.capabilities" class="info-section">
                <div class="info-section-title">支持的能力</div>
                <div class="capabilities">
                  <span v-if="serverInfo.capabilities.tools" class="capability-tag">工具</span>
                  <span v-if="serverInfo.capabilities.resources" class="capability-tag">资源</span>
                  <span v-if="serverInfo.capabilities.prompts" class="capability-tag">提示词</span>
                  <span v-if="!serverInfo.capabilities.tools && !serverInfo.capabilities.resources && !serverInfo.capabilities.prompts" class="capability-tag empty">无</span>
                </div>
              </div>

              <!-- 工具列表 -->
              <div v-if="serverInfo?.tools?.length" class="info-section">
                <div class="info-section-title">可用工具 ({{ serverInfo.tools.length }})</div>
                <div class="tools-list">
                  <div v-for="tool in serverInfo.tools" :key="tool.name" class="tool-item">
                    <div class="tool-name">{{ tool.name }}</div>
                    <div v-if="tool.description" class="tool-description">{{ tool.description }}</div>
                  </div>
                </div>
              </div>

              <!-- 资源列表 -->
              <div v-if="serverInfo?.resources?.length" class="info-section">
                <div class="info-section-title">可用资源 ({{ serverInfo.resources.length }})</div>
                <div class="resources-list">
                  <div v-for="resource in serverInfo.resources" :key="resource.uri" class="resource-item">
                    <div class="resource-uri">{{ resource.uri }}</div>
                    <div v-if="resource.name" class="resource-name">{{ resource.name }}</div>
                  </div>
                </div>
              </div>

              <!-- 提示词列表 -->
              <div v-if="serverInfo?.prompts?.length" class="info-section">
                <div class="info-section-title">可用提示词 ({{ serverInfo.prompts.length }})</div>
                <div class="prompts-list">
                  <div v-for="prompt in serverInfo.prompts" :key="prompt.name" class="prompt-item">
                    <div class="prompt-name">{{ prompt.name }}</div>
                    <div v-if="prompt.description" class="prompt-description">{{ prompt.description }}</div>
                  </div>
                </div>
              </div>

              <!-- 加载状态 -->
              <div v-if="loadingServerInfo" class="loading-state">
                <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
                </svg>
                <p>正在加载服务器信息...</p>
              </div>

              <!-- 错误状态 -->
              <div v-if="serverInfoError" class="error-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{{ serverInfoError }}</p>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-primary" @click="showInfoDialog = false">
                关闭
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { useSettings } from '@/composables/useSettings'
import { testMcpServer } from '@/api/settings'

const {
  mcpServers,
  addMCPServer,
  updateMCPServer,
  deleteMCPServer
} = useSettings()

const showAddDialog = ref(false)
const showInfoDialog = ref(false)
const editingServer = ref(null)
const testingServerId = ref(null)
const serverInfo = ref(null)
const loadingServerInfo = ref(false)
const serverInfoError = ref(null)

const serverForm = reactive({
  name: '',
  url: '',
  transportMode: 'sse'
})

const resetForm = () => {
  serverForm.name = ''
  serverForm.url = ''
  serverForm.transportMode = 'sse'
  editingServer.value = null
}

const editServer = (server) => {
  editingServer.value = server
  serverForm.name = server.name
  serverForm.url = server.url
  serverForm.transportMode = server.transportMode || 'sse'
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
      url: serverForm.url,
      transportMode: serverForm.transportMode
    })
    ElMessage.success('更新成功')
  } else {
    addMCPServer({
      name: serverForm.name,
      url: serverForm.url,
      transportMode: serverForm.transportMode
    })
    ElMessage.success('添加成功')
  }

  showAddDialog.value = false
  resetForm()
}

const getTransportModeLabel = (mode) => {
  const labels = {
    'sse': 'SSE',
    'http_stream': 'HTTP Stream'
  }
  return labels[mode] || 'SSE'
}

const getTransportModeClass = (mode) => {
  return mode === 'http_stream' ? 'transport-http' : 'transport-sse'
}

const testServer = async (server) => {
  if (!server.enabled) {
    ElMessage.warning('请先启用该服务器')
    return
  }

  testingServerId.value = server.id
  try {
    const result = await testMcpServer({
      url: server.url,
      transportMode: server.transportMode || 'sse'
    })

    if (result.success) {
      ElMessage.success(`连接成功！延迟: ${result.latency}ms`)

      // 如果返回了服务器信息，显示信息弹窗
      if (result.serverInfo) {
        serverInfo.value = result.serverInfo
        serverInfoError.value = null
        showInfoDialog.value = true
      }
    } else {
      ElMessage.error(`连接失败: ${result.message}`)
    }
  } catch (error) {
    console.error('测试 MCP 服务器失败:', error)
    ElMessage.error('连接失败，请检查服务器地址和配置')
  } finally {
    testingServerId.value = null
  }
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

.server-transport {
  display: flex;
  align-items: center;
}

.transport-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  font-family: 'Noto Sans SC', sans-serif;
}

.transport-sse {
  background: #e8f4fd;
  color: #1976d2;
  border: 1px solid #90caf9;
}

.transport-http {
  background: #fef3e8;
  color: #e65100;
  border: 1px solid #ffcc80;
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

/* 测试按钮样式 */
.test-btn {
  color: #1976d2;
}

.test-btn:hover:not(:disabled) {
  background: #e8f4fd;
  border-color: #1976d2;
}

.test-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.test-btn.testing {
  color: #a86b4a;
}

/* 旋转动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
    stroke-dashoffset: 32;
  }
  to {
    transform: rotate(360deg);
    stroke-dashoffset: 0;
  }
}

/* 表单提示 */
.form-hint {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #888;
  font-family: 'Noto Sans SC', sans-serif;
}

/* MCP 信息弹窗样式 */
.info-dialog {
  position: relative;
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s ease;
  border: 1px solid #e8e4dc;
  display: flex;
  flex-direction: column;
}

.info-dialog .dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;
}

.info-dialog .dialog-body::-webkit-scrollbar {
  width: 6px;
}

.info-dialog .dialog-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

/* 信息区块 */
.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Serif SC', serif;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e4dc;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #888;
  font-family: 'Noto Sans SC', sans-serif;
}

.info-value {
  font-size: 14px;
  color: #2c2c2c;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
}

/* 能力标签 */
.capabilities {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.capability-tag {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  background: linear-gradient(135deg, #a86b4a 0%, #8b5a3c 100%);
  color: #faf8f3;
  font-family: 'Noto Sans SC', sans-serif;
}

.capability-tag.empty {
  background: #f5f3ef;
  color: #888;
  border: 1px solid #e8e4dc;
}

/* 工具列表 */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-item {
  padding: 12px;
  background: #faf8f3;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tool-item:hover {
  border-color: #a86b4a;
  background: #f5f3ef;
}

.tool-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Sans SC', sans-serif;
  margin-bottom: 4px;
}

.tool-description {
  font-size: 13px;
  color: #666;
  font-family: 'Noto Sans SC', sans-serif;
  line-height: 1.5;
}

/* 资源列表 */
.resources-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-item {
  padding: 10px 12px;
  background: #faf8f3;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.resource-item:hover {
  border-color: #1976d2;
  background: #e8f4fd;
}

.resource-uri {
  font-size: 13px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  color: #1976d2;
  margin-bottom: 4px;
}

.resource-name {
  font-size: 13px;
  color: #666;
  font-family: 'Noto Sans SC', sans-serif;
}

/* 提示词列表 */
.prompts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prompt-item {
  padding: 10px 12px;
  background: #faf8f3;
  border: 1px solid #e8e4dc;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.prompt-item:hover {
  border-color: #a86b4a;
  background: #f5f3ef;
}

.prompt-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Noto Sans SC', sans-serif;
  margin-bottom: 4px;
}

.prompt-description {
  font-size: 13px;
  color: #666;
  font-family: 'Noto Sans SC', sans-serif;
  line-height: 1.5;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
}

.loading-state svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
}

.loading-state p {
  font-size: 14px;
  margin: 0;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #c83232;
}

.error-state svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
}

.error-state p {
  font-size: 14px;
  margin: 0;
  text-align: center;
}
</style>
