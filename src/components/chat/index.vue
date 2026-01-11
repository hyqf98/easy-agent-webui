<template>
  <div class="conversation-list">
    <!-- 头部 -->
    <div class="list-header">
      <div class="header-content">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="header-text">
          <h2 class="header-title">对话记录</h2>
          <span class="header-count">{{ conversations.length }} 个对话</span>
        </div>
      </div>
      <button class="new-chat-btn" @click="$emit('createChat')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <!-- 会话列表 -->
    <div class="list-content">
      <TransitionGroup name="conversation-item" tag="div" class="conversations">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-card"
          :class="{ 'active': conv.id === activeId }"
          @click="handleSelect(conv.id)"
          @contextmenu.prevent="showContextMenu($event, conv)"
        >
          <!-- 左侧图标 -->
          <div class="card-avatar">
            <div class="avatar-inner">
              <span class="avatar-text">{{ getIconText(conv.title) }}</span>
            </div>
            <div class="avatar-glow"></div>
          </div>

          <!-- 中间内容 -->
          <div class="card-content">
            <div class="card-header-row">
              <h3 class="card-title">{{ conv.title || '新对话' }}</h3>
              <span class="card-time">{{ formatTime(conv.updatedAt) }}</span>
            </div>
            <p class="card-preview">{{ conv.preview || '暂无消息' }}</p>
          </div>

          <!-- 右侧指示器 -->
          <div class="card-indicator">
            <div class="indicator-dot"></div>
          </div>

          <!-- 悬停操作按钮 -->
          <button
            class="card-action-btn"
            @click.stop="showContextMenu($event, conv)"
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
      <Transition name="empty-fade">
        <div v-if="conversations.length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="empty-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <h3 class="empty-title">暂无对话</h3>
          <p class="empty-desc">点击右上角新建按钮开始您的第一段对话</p>
        </div>
      </Transition>
    </div>

    <!-- 设置按钮 -->
    <div class="list-footer">
      <button class="settings-btn" @click="$emit('openSettings')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="M1 12h6m6 0h6"/>
        </svg>
        <span>设置</span>
      </button>
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
              <div class="dialog-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
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
              <div class="dialog-icon dialog-icon-danger">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 class="dialog-title">确认删除</h3>
            </div>
            <div class="dialog-body">
              <p class="delete-message">确定要删除对话「{{ contextMenuConv?.title }}」吗？</p>
              <p class="delete-hint">此操作无法撤销</p>
            </div>
            <div class="dialog-footer">
              <button class="dialog-btn dialog-btn-secondary" @click="closeDeleteDialog">
                取消
              </button>
              <button class="dialog-btn dialog-btn-danger" @click="confirmDelete">
                删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { useConversationList, getIconText, formatTime } from '@/components/chat/ConversationList.js'

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

const emit = defineEmits(['createChat', 'selectChat', 'deleteChat', 'renameChat', 'openSettings'])

const {
  contextMenuVisible,
  contextMenuPosition,
  contextMenuConv,
  renameDialogVisible,
  deleteDialogVisible,
  newTitle,
  renameInputRef,
  handleSelect,
  showContextMenu,
  handleRename,
  confirmRename,
  closeRenameDialog,
  handleDelete,
  confirmDelete,
  closeDeleteDialog
} = useConversationList(emit)
</script>

<style scoped src="@/components/chat/ConversationList.css"></style>
