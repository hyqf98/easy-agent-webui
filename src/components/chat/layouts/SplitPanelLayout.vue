<template>
  <div class="split-panel-layout">
    <div class="panel-left" :style="leftPanelStyle">
      <slot name="left">
        <ProcessPanel
          :messages="messages"
          :current-stage="currentStage"
        />
      </slot>
    </div>
    <div class="panel-divider" @mousedown="startResize" />
    <div class="panel-right">
      <slot name="right">
        <ContentPanel
          :content="content"
          :is-streaming="isStreaming"
          :current-stage="currentStage"
          :estimated-time="estimatedTime"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { PANEL_CONFIG } from '@/utils/layoutConfig'
import ProcessPanel from '../panels/ProcessPanel.vue'
import ContentPanel from '../panels/ContentPanel.vue'

/**
 * 分屏布局组件
 *
 * <p>用于 Markdown/HTML/PPT 模式，提供左右分屏布局。</p>
 *
 * <h3>布局结构</h3>
 * <pre>
 * ┌───────────────────────────────────────────────────────┐
 * │ 会话 │  左侧：执行过程        │  右侧：内容展示        │
 * │       ├─────────────────────┼─────────────────────────┤
 * │       │ 思考过程（折叠）    │ ┌─────────────────────┐ │
 * │       │ 工具调用（展开）    │ │  工具栏：下载/复制   │ │
 * │       │ 规划结果            │ ├─────────────────────┤ │
 * │       │                     │ │  状态指示器         │ │
 * │       │                     │ ├─────────────────────┤ │
 * │       │                     │ │  实时生成内容       │ │
 * │       │                     │ │  (Typewriter/XMarkdown)│
 * │       │                     │ └─────────────────────┘ │
 * └───────────────────────────────────────────────────────┘
 * </pre>
 *
 * @author easy-agent
 * @since 1.0.0
 */

const props = defineProps({
  /** 消息列表 */
  messages: {
    type: Array,
    default: () => []
  },
  /** 当前生成的内容 */
  content: {
    type: String,
    default: ''
  },
  /** 是否正在流式生成 */
  isStreaming: {
    type: Boolean,
    default: false
  },
  /** 当前阶段（用于状态指示器） */
  currentStage: {
    type: Number,
    default: 0
  },
  /** 预计剩余时间 */
  estimatedTime: {
    type: String,
    default: ''
  }
})

// 左侧面板宽度
const leftWidth = ref(PANEL_CONFIG.LEFT.defaultWidth)

// 是否正在调整大小
const isResizing = ref(false)

// 左侧面板样式
const leftPanelStyle = computed(() => ({
  width: leftWidth.value,
  minWidth: PANEL_CONFIG.LEFT.minWidth,
  maxWidth: PANEL_CONFIG.LEFT.maxWidth
}))

/**
 * 开始调整大小
 */
function startResize(e) {
  isResizing.value = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
}

/**
 * 调整大小中
 */
function onResize(e) {
  if (!isResizing.value) return
  const container = e.target.closest('.split-panel-layout')
  if (!container) return
  const rect = container.getBoundingClientRect()
  const newWidth = e.clientX - rect.left
  leftWidth.value = `${Math.min(
    Math.max(newWidth, parseInt(PANEL_CONFIG.LEFT.minWidth)),
    parseInt(PANEL_CONFIG.LEFT.maxWidth)
  )}px`
}

/**
 * 停止调整大小
 */
function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style scoped>
.split-panel-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.panel-left {
  flex-shrink: 0;
  overflow-y: auto;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-primary);
}

.panel-divider {
  width: 4px;
  background: var(--color-border-primary);
  cursor: col-resize;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.panel-divider:hover {
  background: var(--color-primary);
}

.panel-divider:active {
  background: var(--color-primary-dark);
}

.panel-right {
  flex: 1;
  min-width: PANEL_CONFIG.RIGHT.minWidth;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 滚动条样式 */
.panel-left::-webkit-scrollbar {
  width: 6px;
}

.panel-left::-webkit-scrollbar-track {
  background: transparent;
}

.panel-left::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: var(--radius-full);
}

.panel-left::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
</style>
