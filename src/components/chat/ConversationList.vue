<template>
  <div class="conversation-list">
    <!-- 头部 -->
    <div class="list-header">
      <div class="header-title">
        <span class="title-text">对话记录</span>
        <div class="title-decoration"></div>
      </div>
      <button class="new-chat-btn" @click="$emit('createChat')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>新建</span>
      </button>
    </div>

    <!-- 会话列表 -->
    <div class="list-content">
      <TransitionGroup name="conversation-item" tag="div" class="conversations">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ 'active': conv.id === activeId }"
          @click="handleSelect(conv.id)"
          @contextmenu.prevent="showContextMenu($event, conv)"
        >
          <div class="conversation-icon">
            <span class="icon-text">{{ getIconText(conv.title) }}</span>
          </div>
          <div class="conversation-info">
            <div class="conversation-title" :title="conv.title">{{ conv.title }}</div>
            <div class="conversation-preview">{{ conv.preview }}</div>
            <div class="conversation-time">{{ formatTime(conv.updatedAt) }}</div>
          </div>
          <!-- 更多操作按钮 -->
          <button
            class="more-btn"
            :class="{ 'show': conv.id === hoveredId || contextMenuConv?.id === conv.id }"
            @click.stop="showContextMenu($event, conv)"
            @mouseenter="hoveredId = conv.id"
            @mouseleave="hoveredId = null"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-if="conversations.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p class="empty-text">暂无对话记录</p>
        <p class="empty-subtitle">点击"新建"开始对话</p>
      </div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <Transition name="context-menu-fade">
        <div
          v-if="contextMenuVisible"
          class="context-menu"
          :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
        >
          <div class="context-menu-inner">
            <div class="menu-header">
              <span class="menu-title">对话操作</span>
              <div class="menu-decoration"></div>
            </div>
            <div class="menu-items">
              <button class="menu-item" @click="handleRename">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>重命名</span>
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item menu-item-danger" @click="handleDelete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                </svg>
                <span>删除对话</span>
              </button>
            </div>
            <div class="menu-footer-decoration"></div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 重命名弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="renameDialogVisible" class="modal-overlay" @click="closeRenameDialog">
          <div class="rename-dialog" @click.stop>
            <div class="dialog-header">
              <div class="dialog-seal">名</div>
              <h3 class="dialog-title">重命名对话</h3>
            </div>
            <div class="dialog-body">
              <input
                ref="renameInputRef"
                v-model="newTitle"
                class="rename-input"
                placeholder="请输入对话名称..."
                @keydown.enter="confirmRename"
                @keydown.esc="closeRenameDialog"
              />
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="closeRenameDialog">
                取消
              </button>
              <button class="dialog-btn dialog-btn-primary" @click="confirmRename">
                确认
              </button>
            </div>
            <div class="dialog-decoration"></div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="deleteDialogVisible" class="modal-overlay" @click="closeDeleteDialog">
          <div class="delete-dialog" @click.stop>
            <div class="dialog-header">
              <div class="dialog-seal dialog-seal-danger">警</div>
              <h3 class="dialog-title">确认删除</h3>
            </div>
            <div class="dialog-body">
              <p class="delete-message">确定要删除对话「{{ contextMenuConv?.title }}」吗？</p>
              <p class="delete-hint">删除后将无法恢复</p>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="closeDeleteDialog">
                取消
              </button>
              <button class="dialog-btn dialog-btn-danger" @click="confirmDelete">
                确认删除
              </button>
            </div>
            <div class="dialog-decoration"></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['createChat', 'selectChat', 'deleteChat', 'renameChat'])

const hoveredId = ref(null)
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuConv = ref(null)
const renameDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const newTitle = ref('')
const renameInputRef = ref(null)

// 获取图标文字
const getIconText = (title) => {
  if (!title) return '对'
  return title.charAt(0)
}

// 选择会话
const handleSelect = (id) => {
  emit('selectChat', id)
}

// 显示右键菜单
const showContextMenu = (event, conv) => {
  contextMenuConv.value = conv
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false
}

// 处理重命名
const handleRename = () => {
  hideContextMenu()
  newTitle.value = contextMenuConv.value?.title || ''
  renameDialogVisible.value = true
  nextTick(() => {
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  })
}

// 确认重命名
const confirmRename = () => {
  const title = newTitle.value.trim()
  if (title && contextMenuConv.value) {
    emit('renameChat', contextMenuConv.value.id, title)
  }
  closeRenameDialog()
}

// 关闭重命名弹窗
const closeRenameDialog = () => {
  renameDialogVisible.value = false
  newTitle.value = ''
}

// 处理删除
const handleDelete = () => {
  hideContextMenu()
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  if (contextMenuConv.value) {
    emit('deleteChat', contextMenuConv.value.id)
  }
  closeDeleteDialog()
}

// 关闭删除弹窗
const closeDeleteDialog = () => {
  deleteDialogVisible.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event) => {
  if (contextMenuVisible.value) {
    hideContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // 更早
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.conversation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg,
    var(--paper-新) 0%,
    var(--paper-熟) 100%);
  border-right: var(--border-细);
  position: relative;
}

/* ========== 头部 ========== */
.list-header {
  padding: var(--spacing-宽) var(--spacing-中);
  border-bottom: var(--border-细);
  background: rgba(250, 248, 243, 0.9);
  backdrop-filter: blur(10px);
}

.header-title {
  position: relative;
  margin-bottom: var(--spacing-宽);
}

.title-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  letter-spacing: 8px;
  display: block;
  text-align: center;
}

.title-decoration {
  width: 40px;
  height: 2px;
  background: var(--ink-焦);
  margin: 6px auto 0;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-紧);
  padding: 12px var(--spacing-中);
  background: var(--ink-焦);
  border: none;
  color: var(--paper-新);
  font-size: 14px;
  font-family: var(--font-楷);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-墨-浅);
}

.new-chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-墨-中);
  background: var(--ink-浓);
}

.new-chat-btn svg {
  width: 18px;
  height: 18px;
}

/* ========== 会话列表 ========== */
.list-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-中) var(--spacing-紧);
  scrollbar-width: thin;
  scrollbar-color: var(--ink-淡) transparent;
}

.list-content::-webkit-scrollbar {
  width: 3px;
}

.list-content::-webkit-scrollbar-thumb {
  background: var(--ink-淡);
}

.conversations {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 会话项 */
.conversation-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px var(--spacing-中);
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
  user-select: none;
  border: 1px solid transparent;
}

.conversation-item:hover {
  background: var(--ink-晕染-浅);
}

.conversation-item.active {
  background: var(--ink-晕染-中);
  border-color: var(--ink-清);
}

.conversation-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: var(--ink-重);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-墨-浅);
}

.icon-text {
  color: var(--paper-新);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-楷);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-preview {
  font-size: 11px;
  color: var(--ink-淡);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.conversation-time {
  font-size: 10px;
  color: var(--ink-淡);
  font-weight: 500;
}

.conversation-item.active .conversation-title {
  color: var(--ink-焦);
}

/* 更多按钮 */
.more-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  padding: 0;
  background: var(--ink-晕染-浅);
  border: 1px solid var(--border-细);
  color: var(--ink-淡);
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.2s ease;
  cursor: pointer;
}

.more-btn.show,
.conversation-item:hover .more-btn {
  opacity: 1;
  transform: scale(1);
}

.more-btn:hover {
  background: var(--ink-晕染-中);
  color: var(--ink-重);
}

.more-btn svg {
  width: 14px;
  height: 14px;
}

/* 列表项动画 */
.conversation-item-enter-active,
.conversation-item-leave-active {
  transition: all 0.3s ease;
}

.conversation-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.conversation-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px var(--spacing-宽);
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  margin-bottom: var(--spacing-宽);
  color: var(--ink-清);
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 14px;
  color: var(--ink-重);
  margin-bottom: var(--spacing-紧);
  font-family: var(--font-宋);
}

.empty-subtitle {
  font-size: 12px;
  color: var(--ink-淡);
}

/* ========== 右键菜单 ========== */
.context-menu {
  position: fixed;
  z-index: 1000;
}

.context-menu-inner {
  background: rgba(250, 248, 243, 0.98);
  box-shadow: var(--shadow-墨-深);
  overflow: hidden;
  min-width: 160px;
  backdrop-filter: blur(10px);
  border: var(--border-细);
}

.menu-header {
  padding: 12px var(--spacing-宽) var(--spacing-紧);
  background: var(--ink-晕染-浅);
  border-bottom: var(--border-细);
}

.menu-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  letter-spacing: 3px;
}

.menu-decoration {
  width: 24px;
  height: 2px;
  background: var(--ink-焦);
  margin-top: 6px;
}

.menu-items {
  padding: var(--spacing-紧) 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px var(--spacing-宽);
  background: transparent;
  border: none;
  color: var(--ink-重);
  font-size: 14px;
  font-family: var(--font-宋);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-item:hover {
  background: var(--ink-晕染-中);
  color: var(--ink-焦);
}

.menu-item svg {
  width: 16px;
  height: 16px;
}

.menu-item-danger {
  color: var(--seal-朱砂);
}

.menu-item-danger:hover {
  background: rgba(200, 48, 48, 0.08);
}

.menu-divider {
  height: 1px;
  background: var(--border-细);
  margin: 4px 0;
}

.menu-footer-decoration {
  height: 2px;
  background: var(--ink-焦);
}

/* 菜单动画 */
.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
  transition: all 0.2s ease;
}

.context-menu-fade-enter-from,
.context-menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ========== 弹窗通用 ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 26, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-宽);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .rename-dialog,
.modal-fade-leave-to .rename-dialog,
.modal-fade-enter-from .delete-dialog,
.modal-fade-leave-to .delete-dialog {
  transform: scale(0.95) translateY(16px);
}

/* ========== 重命名弹窗 ========== */
.rename-dialog,
.delete-dialog {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: rgba(250, 248, 243, 0.98);
  box-shadow: var(--shadow-墨-深);
  overflow: hidden;
  transition: all 0.3s ease;
  border: var(--border-细);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-中);
  padding: var(--spacing-宽) var(--spacing-展) var(--spacing-中);
  border-bottom: var(--border-细);
}

.dialog-seal {
  width: 36px;
  height: 36px;
  background: var(--ink-焦);
  border: 2px solid var(--ink-浓);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--paper-新);
  font-size: 16px;
  font-weight: bold;
  font-family: var(--font-楷);
  box-shadow: var(--shadow-墨-浅);
}

.dialog-seal-danger {
  background: var(--seal-朱砂);
  border-color: var(--seal-印泥);
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  margin: 0;
  letter-spacing: 2px;
}

.dialog-body {
  padding: var(--spacing-宽) var(--spacing-展);
}

.rename-input {
  width: 100%;
  padding: 10px var(--spacing-中);
  background: rgba(255, 255, 255, 0.9);
  border: var(--border-细);
  font-size: 14px;
  font-family: var(--font-宋);
  color: var(--ink-焦);
  outline: none;
  transition: all 0.3s ease;
}

.rename-input:focus {
  border-color: var(--ink-清);
  box-shadow: 0 0 0 2px var(--ink-晕染-浅);
}

.rename-input::placeholder {
  color: var(--ink-淡);
}

.delete-message {
  font-size: 14px;
  color: var(--ink-焦);
  margin: 0 0 var(--spacing-紧);
  font-family: var(--font-宋);
}

.delete-hint {
  font-size: 13px;
  color: var(--seal-朱砂);
  margin: 0;
  font-family: var(--font-楷);
}

.dialog-footer {
  display: flex;
  gap: var(--spacing-中);
  padding: var(--spacing-中) var(--spacing-展) var(--spacing-宽);
  justify-content: flex-end;
}

.dialog-btn {
  padding: 10px var(--spacing-宽);
  border: none;
  font-size: 14px;
  font-family: var(--font-楷);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dialog-btn-secondary {
  background: var(--ink-晕染-浅);
  color: var(--ink-重);
  border: 1px solid var(--border-细);
}

.dialog-btn-secondary:hover {
  background: var(--ink-晕染-中);
}

.dialog-btn-primary {
  background: var(--ink-焦);
  color: var(--paper-新);
  box-shadow: var(--shadow-墨-浅);
}

.dialog-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-墨-中);
  background: var(--ink-浓);
}

.dialog-btn-danger {
  background: var(--seal-朱砂);
  color: white;
  box-shadow: var(--shadow-墨-浅);
}

.dialog-btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-墨-中);
  background: var(--seal-印泥);
}

.dialog-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--ink-焦);
}
</style>
