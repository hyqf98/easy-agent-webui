<template>
  <div class="tool-message" :class="`tool-${tool.status}`">
    <div class="tool-container" @click="toggleExpand">
      <!-- 工具图标 -->
      <div class="tool-icon-wrapper">
        <div class="tool-icon" :class="{ 'rotating': tool.status === 'calling' }">
          <svg v-if="tool.status === 'calling'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4m0 6v4m0 6v4"/>
            <path d="M1 12h4m6 0h4m6 0h4"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <div v-if="tool.status === 'calling'" class="icon-ripple"></div>
      </div>

      <!-- 工具内容 -->
      <div class="tool-content">
        <div class="tool-header">
          <span class="tool-name">{{ tool.name }}</span>
          <span class="tool-status" :class="`status-${tool.status}`">
            {{ statusText }}
          </span>
          <div class="tool-expand-icon" :class="{ 'expanded': isExpanded }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
        </div>

        <!-- 工具输入参数 -->
        <Transition name="tool-expand">
          <div v-if="isExpanded && tool.input" class="tool-input">
            <div class="tool-section-label">调用参数</div>
            <pre class="tool-json">{{ formattedInput }}</pre>
          </div>
        </Transition>

        <!-- 工具输出结果 -->
        <Transition name="tool-expand">
          <div v-if="isExpanded && tool.output && tool.status === 'completed'" class="tool-output">
            <div class="tool-section-label">执行结果</div>
            <div class="tool-result-content">{{ formattedOutput }}</div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  tool: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.name && value.status && ['calling', 'completed'].includes(value.status)
    }
  }
})

const isExpanded = ref(false)

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 状态文本
const statusText = computed(() => {
  return props.tool.status === 'calling' ? '调用中...' : '已完成'
})

// 格式化输入参数
const formattedInput = computed(() => {
  if (!props.tool.input) return ''
  try {
    const obj = typeof props.tool.input === 'string'
      ? JSON.parse(props.tool.input)
      : props.tool.input
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(props.tool.input)
  }
})

// 格式化输出结果
const formattedOutput = computed(() => {
  if (!props.tool.output) return ''
  try {
    const obj = typeof props.tool.output === 'string'
      ? JSON.parse(props.tool.output)
      : props.tool.output
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(props.tool.output)
  }
})
</script>

<style scoped>
/* ========== 工具消息容器 ========== */
.tool-message {
  margin: var(--spacing-紧) 0;
  position: relative;
  overflow: hidden;
}

.tool-calling {
  animation: toolCallingPulse 2s ease-in-out infinite;
}

@keyframes toolCallingPulse {
  0%, 100% {
    background: var(--ink-晕染-浅);
  }
  50% {
    background: var(--ink-晕染-中);
  }
}

.tool-completed {
  animation: toolCompletedFadeIn 0.4s ease-out;
}

@keyframes toolCompletedFadeIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tool-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.8);
  border: var(--border-细);
  box-shadow: var(--shadow-墨-浅);
  transition: all 0.3s ease;
  cursor: pointer;
}

.tool-container:hover {
  border-color: rgba(26, 26, 26, 0.15);
  box-shadow: var(--shadow-墨-中);
}

.tool-calling .tool-container {
  border-color: rgba(26, 26, 26, 0.15);
}

.tool-completed .tool-container {
  border-color: rgba(26, 26, 26, 0.2);
}

/* ========== 工具图标 ========== */
.tool-icon-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.tool-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-晕染-浅);
  color: var(--ink-焦);
  transition: all 0.3s ease;
  clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
}

.tool-calling .tool-icon {
  background: var(--ink-晕染-中);
  color: var(--ink-焦);
}

.tool-completed .tool-icon {
  background: var(--ink-焦);
  color: var(--paper-新);
}

.tool-icon svg {
  width: 16px;
  height: 16px;
}

.tool-icon.rotating {
  animation: toolIconRotate 3s linear infinite;
}

@keyframes toolIconRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin-left: -16px;
  margin-top: -16px;
  border: 2px solid var(--ink-焦);
  opacity: 0;
  animation: iconRippleEffect 2s ease-out infinite;
  clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
}

@keyframes iconRippleEffect {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* ========== 工具内容 ========== */
.tool-content {
  flex: 1;
  min-width: 0;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-紧);
}

.tool-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-焦);
  font-family: var(--font-宋);
  letter-spacing: 0.5px;
}

.tool-status {
  font-size: 11px;
  padding: 2px var(--spacing-中);
  font-weight: 500;
  background: var(--ink-晕染-浅);
}

.tool-status.status-calling {
  color: var(--ink-焦);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.tool-status.status-completed {
  background: var(--ink-焦);
  color: var(--paper-新);
}

/* 展开图标 */
.tool-expand-icon {
  margin-left: auto;
  width: 18px;
  height: 18px;
  color: var(--ink-淡);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.tool-expand-icon.expanded {
  transform: rotate(180deg);
}

.tool-expand-icon svg {
  width: 100%;
  height: 100%;
}

/* 工具输入/输出区域 */
.tool-expand-enter-active,
.tool-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.tool-expand-enter-from,
.tool-expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.tool-expand-enter-to,
.tool-expand-leave-from {
  max-height: 250px;
  opacity: 1;
  margin-top: var(--spacing-紧);
}

.tool-input,
.tool-output {
  margin-top: var(--spacing-紧);
}

.tool-section-label {
  font-size: 11px;
  color: var(--ink-淡);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.tool-json {
  margin: 0;
  padding: 10px;
  background: var(--ink-晕染-浅);
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: var(--ink-重);
  line-height: 1.5;
  overflow-x: auto;
  border-left: 2px solid var(--ink-焦);
}

.tool-result-content {
  padding: 10px;
  background: var(--ink-晕染-浅);
  font-size: 12px;
  color: var(--ink-焦);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  border-left: 2px solid var(--ink-焦);
}
</style>
