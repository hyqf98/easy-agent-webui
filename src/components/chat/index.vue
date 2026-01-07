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

const emit = defineEmits(['createChat', 'selectChat', 'deleteChat', 'renameChat'])

const {
  hoveredId,
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
