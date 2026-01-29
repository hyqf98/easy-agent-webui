<template>
  <div class="tool-call-container">
    <div
      v-for="(tool, index) in tools"
      :key="index"
      class="tool-call-item"
      :class="[
        `tool-rotate-${index % 3}`,
        `tool-status-bg-${tool.status || 'success'}`
      ]"
    >
      <button
        class="tool-header"
        @click="toggleExpanded(index)"
        :aria-expanded="expandedIndices.includes(index)"
        :aria-label="`切换 ${tool.name} 调用详情`"
      >
        <div class="tool-icon">
          <el-icon :size="16"><Tools /></el-icon>
        </div>
        <span class="tool-name">{{ tool.name }}</span>
        <span class="tool-status" :class="`tool-status-${tool.status || 'success'}`">
          {{ getStatusText(tool.status) }}
        </span>
        <el-icon class="expand-icon" :size="14">
          <ArrowDown v-if="!expandedIndices.includes(index)" />
          <ArrowUp v-else />
        </el-icon>
      </button>

      <Transition name="tool-expand">
        <div v-if="expandedIndices.includes(index)" class="tool-content">
          <!-- Tool Parameters -->
          <div v-if="tool.parameters" class="tool-section">
            <div class="section-label">
              <span class="label-doodle">参数</span>
            </div>
            <pre class="code-block">{{ JSON.stringify(tool.parameters, null, 2) }}</pre>
          </div>

          <!-- Tool Result -->
          <div v-if="tool.result" class="tool-section">
            <div class="section-label">
              <span class="label-doodle">结果</span>
            </div>
            <div v-if="typeof tool.result === 'string'" class="result-text">{{ tool.result }}</div>
            <pre v-else class="code-block">{{ JSON.stringify(tool.result, null, 2) }}</pre>
          </div>

          <!-- Tool Error -->
          <div v-if="tool.error" class="tool-section tool-error">
            <div class="section-label error-label">
              <span class="label-doodle">错误</span>
            </div>
            <div class="error-message">{{ tool.error }}</div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tools, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  tools: {
    type: Array,
    required: true,
    default: () => []
  }
})

// 默认全部收起 - 空数组
const expandedIndices = ref([])

const toggleExpanded = (index) => {
  const pos = expandedIndices.value.indexOf(index)
  if (pos > -1) {
    expandedIndices.value.splice(pos, 1)
  } else {
    expandedIndices.value.push(index)
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'success':
      return '成功'
    case 'error':
      return '失败'
    case 'running':
      return '执行中'
    default:
      return '成功'
  }
}
</script>

<style scoped>
/* Hand-Drawn Sketch Style - Post-it Notes */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600;700&family=Caveat:wght@400;500;600;700&family=ZCOOL+XiaoWei&family=Patrick+Hand&display=swap');

:root {
  --paper-base: #FAF7F0;
  --paper-warm: #F5F0E6;
  --ink-dark: #2C2C2C;
  --ink-medium: #4A4A4A;
  --ink-light: #6B6B6B;
  --ink-faint: #999999;
  --pencil-orange: #C4875B;
  --pencil-green: #7A9B6E;
  --pencil-red: #B85C5C;
  --pencil-blue: #5B7A8C;
  --highlight-yellow: rgba(255, 230, 120, 0.5);
  --highlight-pink: rgba(255, 180, 180, 0.4);
  --highlight-green: rgba(180, 220, 150, 0.35);
  --border-thin: 1.5px;
  --border-sketch: 2px;
  --shadow-pencil: 2px 2px 0 rgba(0, 0, 0, 0.08);
  --shadow-pencil-md: 3px 3px 0 rgba(0, 0, 0, 0.1);
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --ease-sketch: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Typography */
  --font-primary: 'Noto Serif SC', 'Songti SC', serif;
  --font-display: 'ZCOOL XiaoWei', serif;
  --font-hand: 'Patrick Hand', cursive;
  --font-code: 'Caveat', 'Courier New', monospace;
  --text-xs: 11px;
  --text-sm: 12px;
  --text-md: 14px;
  --text-lg: 15px;
}

/* Post-it note shadow effect */
@keyframes postit-float {
  0%, 100% {
    transform: translateY(0) rotate(var(--rotation, 0deg));
  }
  50% {
    transform: translateY(-2px) rotate(calc(var(--rotation, 0deg) + 0.5deg));
  }
}

.tool-call-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  font-family: var(--font-primary);
}

.tool-call-item {
  border: var(--border-sketch) solid var(--ink-medium);
  border-radius: 6px;
  overflow: hidden;
  background: var(--highlight-yellow);
  transition: all var(--duration-normal) var(--ease-sketch);
  box-shadow: var(--shadow-pencil);
  position: relative;
  transform-origin: top center;
  /* 固定宽度，防止动态变化 */
  width: min(350px, 45vw);
  max-width: min(350px, 45vw);
  min-width: min(250px, 35vw);
  box-sizing: border-box;
}

/* Different rotations for variety */
.tool-call-item.tool-rotate-0 {
  transform: rotate(-1deg);
  --rotation: -1deg;
}

.tool-call-item.tool-rotate-1 {
  transform: rotate(0.8deg);
  --rotation: 0.8deg;
}

.tool-call-item.tool-rotate-2 {
  transform: rotate(-0.5deg);
  --rotation: -0.5deg;
}

/* Different background colors based on status */
.tool-call-item.tool-status-bg-success {
  background: var(--highlight-yellow);
}

.tool-call-item.tool-status-bg-error {
  background: var(--highlight-pink);
}

.tool-call-item.tool-status-bg-running {
  background: rgba(150, 200, 180, 0.25);
  border-color: #7A9B6E;
}

.tool-call-item:hover {
  border-color: var(--pencil-orange);
  box-shadow: var(--shadow-pencil-md);
  animation: postit-float 3s ease-in-out infinite;
}

/* Tape decoration */
.tool-call-item::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: var(--border-thin) solid var(--ink-faint);
  opacity: 0.6;
  z-index: 10;
}

.tool-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-sketch);
  font-family: var(--font-hand);
  position: relative;
  z-index: 1;
  /* 确保内容在一行内显示 */
  min-height: 44px;
}

.tool-header:hover {
  background: rgba(255, 255, 255, 0.4);
}

.tool-header:focus-visible {
  outline: var(--border-sketch) solid var(--pencil-orange);
  outline-offset: 2px;
  border-radius: 4px;
}

.tool-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper-base);
  color: var(--pencil-orange);
  border: var(--border-thin) solid var(--ink-medium);
  border-radius: 6px;
  flex-shrink: 0;
  transition: transform var(--duration-normal) var(--ease-sketch);
}

.tool-header:hover .tool-icon {
  transform: rotate(-15deg) scale(1.1);
}

.tool-name {
  flex: 1;
  font-size: var(--text-md);
  font-weight: 400;
  color: var(--ink-dark);
  text-align: left;
  font-family: var(--font-primary);
  /* 防止文字换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.tool-status {
  font-size: var(--text-xs);
  font-weight: 400;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: var(--font-primary);
  border: var(--border-thin) solid;
  /* 确保状态文字不换行 */
  flex-shrink: 0;
  white-space: nowrap;
}

.tool-status-success {
  background: var(--highlight-green);
  color: #5A8B54;
  border-color: #7A9B6E;
}

.tool-status-error {
  background: var(--highlight-pink);
  color: #A85C5C;
  border-color: #B85C5C;
}

.tool-status-running {
  background: rgba(150, 220, 180, 0.4);
  color: #5A8B54;
  border-color: #7A9B6E;
  position: relative;
  overflow: hidden;
}

/* Progress bar animation for running state */
.tool-status-running::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(150, 220, 180, 0.6),
    transparent
  );
  animation: progress-sweep 2s ease-in-out infinite;
}

@keyframes progress-sweep {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

/* Pulsing glow for running tool */
.tool-call-item:has(.tool-status-running) {
  position: relative;
}

.tool-call-item:has(.tool-status-running)::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(150, 220, 180, 0.1);
  border-radius: 6px;
  animation: pulse-glow 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* Spinning icon for running state */
.tool-call-item:has(.tool-status-running) .tool-icon {
  animation: icon-spin 3s linear infinite;
}

@keyframes icon-spin {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.expand-icon {
  color: var(--ink-medium);
  transition: transform var(--duration-fast) var(--ease-sketch);
}

.tool-content {
  padding: 0 var(--space-md) var(--space-md);
  border-top: var(--border-thin) dashed var(--ink-light);
  background: rgba(255, 255, 255, 0.4);
  position: relative;
  z-index: 1;
  /* 固定最大高度，内容超出滚动 */
  max-height: min(300px, 40vh);
  overflow: auto;
  overflow-x: hidden;
  /* 继承父容器宽度，保持展开和收起一致 */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  /* 防止宽度动态变化 */
  min-width: 0;
  font-size: var(--text-sm);
}

/* Running state content background */
.tool-call-item.tool-status-bg-running .tool-content {
  background: rgba(255, 255, 255, 0.5);
  border-top-color: #7A9B6E;
}

.tool-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tool-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.tool-content::-webkit-scrollbar-thumb {
  background: var(--ink-medium);
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background-clip: padding-box;
}

.tool-content::-webkit-scrollbar-thumb:hover {
  background: var(--ink-dark);
}

.tool-section {
  padding: var(--space-xs) 0;
}

.section-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-medium);
  margin-bottom: 2px;
  font-family: var(--font-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.label-doodle {
  position: relative;
  display: inline-block;
}

/* Underline doodle effect */
.label-doodle::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--pencil-orange);
  border-radius: 50%;
  transform: scaleX(0.8);
}

.code-block {
  margin: 0;
  padding: var(--space-xs) var(--space-sm);
  background: var(--paper-warm);
  color: var(--ink-dark);
  border: var(--border-sketch) solid var(--ink-medium);
  border-radius: 6px;
  font-size: var(--text-sm);
  line-height: 1.5;
  /* 保持 JSON 格式，支持水平滚动 */
  overflow-x: auto;
  overflow-y: hidden;
  font-family: 'Noto Sans Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  font-weight: 400;
  transform: rotate(-0.3deg);
  /* 响应式字体 */
  font-size: clamp(11px, 0.7rem + 0.2vw, 13px);
  /* 保持原始格式，不自动换行 */
  white-space: pre;
  /* 不强制断行 */
  word-break: normal;
  overflow-wrap: normal;
  /* 确保最小宽度以便长内容可以滚动 */
  min-width: 0;
  display: block;
}

.code-block::-webkit-scrollbar {
  height: 4px;
}

.code-block::-webkit-scrollbar-track {
  background: transparent;
}

.code-block::-webkit-scrollbar-thumb {
  background: var(--ink-faint);
  border-radius: 2px;
}

.result-text {
  padding: var(--space-xs) var(--space-sm);
  background: var(--paper-base);
  border: var(--border-sketch) solid var(--ink-medium);
  border-radius: 6px;
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--ink-dark);
  font-family: var(--font-primary);
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-word;
  transform: rotate(0.2deg);
}

.tool-error {
  background: var(--highlight-pink);
  padding: var(--space-sm);
  border-radius: 6px;
  margin-top: var(--space-sm);
  border: var(--border-sketch) solid var(--pencil-red);
  transform: rotate(0.3deg);
}

.error-label {
  color: var(--pencil-red);
}

.error-label .label-doodle::after {
  background: var(--pencil-red);
}

.error-message {
  font-size: var(--text-md);
  line-height: 1.7;
  color: #A85C5C;
  font-family: var(--font-primary);
  font-weight: 500;
}

/* Smooth Transition - 使用较小且合理的 max-height 值 */
.tool-expand-enter-active,
.tool-expand-leave-active {
  transition:
    max-height var(--duration-normal) var(--ease-sketch),
    opacity var(--duration-normal) var(--ease-sketch),
    transform var(--duration-normal) var(--ease-sketch);
  max-height: min(300px, 40vh);
  overflow: hidden;
}

.tool-expand-enter-from,
.tool-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.tool-expand-enter-to,
.tool-expand-leave-from {
  max-height: min(300px, 40vh);
  opacity: 1;
  transform: translateY(0);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .tool-expand-enter-active,
  .tool-expand-leave-active {
    transition: none;
  }

  .tool-call-item:hover {
    animation: none;
  }
}

/* Touch target size for mobile */
@media (pointer: coarse) {
  .tool-header {
    min-height: 44px;
  }
}
</style>
