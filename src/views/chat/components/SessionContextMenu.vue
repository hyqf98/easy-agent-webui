<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="session-context-menu"
      :style="{ left: x + 'px', top: y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="handleRename">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 4.5H11.5M2.5 7.5H8.5M2.5 10.5H6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9.5 9.5L11.5 11.5M11.5 11.5L13.5 9.5M11.5 11.5V3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>重命名</span>
      </div>

      <div class="menu-item danger" @click="handleClear">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 3.5H11.5M4.5 3.5V2.5C4.5 2.22386 4.72386 2 5 2H9C9.27614 2 9.5 2.22386 9.5 2.5V3.5M5.5 6V10.5M8.5 6V10.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
        </svg>
        <span>清空消息</span>
      </div>

      <div class="menu-divider"></div>

      <div class="menu-item danger" @click="handleDelete">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3.5 4.5H10.5M4.5 4.5V9.5C4.5 10.0523 4.94772 10.5 5.5 10.5H8.5C9.05228 10.5 9.5 10.0523 9.5 9.5V4.5M6 4.5V3.5C6 3.22386 6.22386 3 6.5 3H7.5C7.77614 3 8 3.22386 8 3.5V4.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
        </svg>
        <span>删除会话</span>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'

const props = defineProps({
  visible: Boolean,
  x: Number,
  y: Number,
  sessionId: [Number, String]
})

const emit = defineEmits(['close', 'rename', 'clear', 'delete'])

// 防止刚打开时立即关闭的标志
const justOpened = ref(false)
let closeTimer = null

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 菜单打开时，设置标志，防止立即关闭
    justOpened.value = true
    // 200ms 后才允许关闭
    clearTimeout(closeTimer)
    closeTimer = setTimeout(() => {
      justOpened.value = false
    }, 200)
  } else {
    // 菜单关闭时清理定时器
    clearTimeout(closeTimer)
    justOpened.value = false
  }
})

// 点击外部关闭菜单
const closeMenu = () => {
  if (justOpened.value) {
    return
  }
  emit('close')
}

// 重命名
const handleRename = () => {
  emit('rename', props.sessionId)
  closeMenu()
}

// 清空消息
const handleClear = () => {
  emit('clear', props.sessionId)
  closeMenu()
}

// 删除会话
const handleDelete = () => {
  emit('delete', props.sessionId)
  closeMenu()
}

// 监听全局点击事件关闭菜单
onMounted(() => {
  document.addEventListener('click', closeMenu)
  document.addEventListener('contextmenu', closeMenu)
})

onUnmounted(() => {
  clearTimeout(closeTimer)
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('contextmenu', closeMenu)
})
</script>

<style scoped>
.session-context-menu {
  position: fixed;
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e8e4dc;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  min-width: 9rem;
  animation: menuFadeIn 0.15s ease;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: #2d2a26;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background 0.15s ease;
}

.menu-item:hover {
  background: #f7f4ef;
}

.menu-item.danger {
  color: #c4786a;
}

.menu-item.danger:hover {
  background: rgba(196, 120, 106, 0.1);
}

.menu-item svg {
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background: #e8e4dc;
  margin: 0.25rem 0;
}
</style>
