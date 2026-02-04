<template>
  <aside class="session-list" :class="{ collapsed }">
    <div class="session-list-header">
      <div class="header-content">
        <h2 class="session-list-title">对话</h2>
        <div class="header-actions">
          <button class="icon-btn" title="系统配置" @click="handleOpenConfig">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.5C5 2.5 2.5 5 2.5 8C2.5 11 5 13.5 8 13.5C11 13.5 13.5 11 13.5 8C13.5 5 11 2.5 8 2.5Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M8 5.5V8L10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="session-count">{{ sessions.length }}</span>
        </div>
      </div>
    </div>

    <div class="session-list-items">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === currentSessionId }"
        @click="selectSession(session.id)"
        @contextmenu.prevent="handleContextMenu($event, session.id)"
      >
        <div class="session-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M5.5 8L7.5 10L10.5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="session-info">
          <div class="session-title">{{ session.title }}</div>
          <div class="session-time">{{ formatTime(session.createdAt) }}</div>
        </div>
      </div>
    </div>

    <div class="session-list-footer">
      <button class="new-session-btn" @click="createNewSession">
        <span class="btn-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 4.5V13.5M4.5 9H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>新建对话</span>
      </button>
    </div>

    <!-- 右键菜单 -->
    <SessionContextMenu
      :visible="menuVisible"
      :x="menuX"
      :y="menuY"
      :sessionId="menuSessionId"
      @close="menuVisible = false"
      @rename="handleRename"
      @clear="handleClear"
      @delete="handleDelete"
    />

    <!-- 系统配置对话框 -->
    <SystemConfigDialog
      v-model:visible="configDialogVisible"
      @refresh="handleConfigRefresh"
    />
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import SessionContextMenu from './SessionContextMenu.vue'
import SystemConfigDialog from './SystemConfigDialog.vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const chatStore = useChatStore()

const sessions = computed(() => chatStore.sessions)
const currentSessionId = computed(() => chatStore.currentSessionId)

// 右键菜单状态
const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const menuSessionId = ref(null)

// 配置对话框状态
const configDialogVisible = ref(false)

const selectSession = (id) => {
  chatStore.setCurrentSession(id)
}

// 打开配置对话框
const handleOpenConfig = () => {
  configDialogVisible.value = true
}

// 配置刷新回调
const handleConfigRefresh = () => {
  // 可以在这里触发模型列表刷新等操作
}

const createNewSession = () => {
  chatStore.createSession()
}

// 右键菜单处理
const handleContextMenu = (event, sessionId) => {
  menuX.value = event.clientX
  menuY.value = event.clientY
  menuSessionId.value = sessionId
  menuVisible.value = true
}

// 重命名会话
const handleRename = async (sessionId) => {
  const session = sessions.value.find(s => s.id === sessionId)
  if (!session) return

  ElMessageBox.prompt('请输入会话标题', '重命名会话', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: session.title,
    inputPattern: /^.{1,30}$/,
    inputErrorMessage: '标题长度为1-30个字符'
  }).then(({ value }) => {
    chatStore.renameSession(sessionId, value)
    ElMessage.success('重命名成功')
  }).catch(() => {
    // 用户取消
  })
}

// 清空消息
const handleClear = async (sessionId) => {
  ElMessageBox.confirm('确定要清空该会话的所有消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    chatStore.clearSessionMessages(sessionId)
  }).catch(() => {
    // 用户取消
  })
}

// 删除会话
const handleDelete = async (sessionId) => {
  ElMessageBox.confirm('确定要删除该会话吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    chatStore.deleteSession(sessionId)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消
  })
}

const formatTime = (timestamp) => {
  // 处理无效时间戳
  if (!timestamp) return '刚刚'

  const date = new Date(timestamp)
  // 检查是否为有效日期
  if (isNaN(date.getTime())) return '刚刚'

  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 172800000) return '昨天'
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.session-list {
  width: 18%;
  min-width: 14rem;
  max-width: 22rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  transition: transform 0.3s ease, width 0.3s ease;
}

.session-list.collapsed {
  width: 0;
  min-width: 0;
  transform: translateX(-100%);
  border: none;
  overflow: hidden;
}

/* 会话列表头部 */
.session-list-header {
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: var(--transition-base);
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
}

.session-list-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.session-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-hover);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-full);
}

.session-list-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  position: relative;
}

.session-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.1875rem;
  height: 0;
  background: var(--accent-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: height 0.2s ease;
}

.session-item:hover {
  background: var(--bg-hover);
}

.session-item.active {
  background: var(--bg-active);
  box-shadow: var(--shadow-sm);
}

.session-item.active::before {
  height: 1.5rem;
}

.session-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}

.session-item:hover .session-icon {
  color: var(--accent-primary);
  background: var(--accent-light);
}

.session-item.active .session-icon {
  color: var(--accent-primary);
  background: var(--accent-light);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.125rem;
}

.session-time {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.session-list-footer {
  padding: 0.875rem;
  border-top: 1px solid var(--border-subtle);
}

.new-session-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.new-session-btn:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.new-session-btn:active {
  transform: translateY(0);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style>
/* Element Plus MessageBox 主题定制 */
.el-message-box {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

.el-message-box__header {
  padding: 1.25rem 1.5rem 0.75rem;
}

.el-message-box__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.el-message-box__content {
  padding: 0.75rem 1.5rem;
  color: var(--text-secondary);
}

.el-message-box__message {
  font-size: 0.875rem;
  line-height: 1.5;
}

.el-message-box__input {
  padding-top: 0.75rem;
}

.el-message-box__input .el-input__wrapper {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--border-default) inset;
  padding: 0.5rem 0.75rem;
}

.el-message-box__input .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--border-strong) inset;
}

.el-message-box__input .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--accent-primary) inset;
}

.el-message-box__btns {
  padding: 0.75rem 1.5rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.el-message-box__btns .el-button {
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.el-message-box__btns .el-button--primary {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--text-inverse);
}

.el-message-box__btns .el-button--primary:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.el-message-box__btns .el-button--default {
  background-color: var(--bg-elevated);
  border-color: var(--border-default);
  color: var(--text-primary);
}

.el-message-box__btns .el-button--default:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-strong);
}

.el-message-box__errormsg {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.375rem;
}
</style>
