<template>
  <div class="thinking-message" :class="{ 'expanded': isExpanded }">
    <div class="thinking-header" @click="$emit('toggle')">
      <div class="thinking-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="M1 12h6m6 0h6"/>
        </svg>
      </div>
      <span class="thinking-label">思考过程</span>
      <div class="expand-indicator" :class="{ 'rotated': isExpanded }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>
    </div>

    <Transition name="thinking-expand">
      <div v-if="isExpanded" class="thinking-content">
        <div class="thinking-inner">
          <div class="thinking-border-decoration"></div>
          <div class="thinking-text" v-html="formattedContent"></div>
          <div class="thinking-ink-drips">
            <div class="drip drip-1"></div>
            <div class="drip drip-2"></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

// 格式化思考内容
const formattedContent = computed(() => {
  if (!props.content) return '正在思考...'

  // 将内容按行分割并添加样式
  return props.content
    .split('\n')
    .map(line => {
      // 高亮关键词
      line = line
        .replace(/(分析|思考|推理|判断|结论|因为|所以|因此)/g, '<span class="keyword">$1</span>')
        .replace(/([「『]).*?([」』])/g, '<span class="quote">$&</span>')
      return `<p class="thinking-line">${line || '&nbsp;'}</p>`
    })
    .join('')
})
</script>

<style scoped>
.thinking-message {
  background: var(--ink-晕染-浅);
  border: 2px dashed rgba(26, 26, 26, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  margin: var(--spacing-紧) 0;
}

.thinking-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--ink-焦);
}

.thinking-message.expanded {
  border-style: solid;
  border-color: rgba(26, 26, 26, 0.2);
  box-shadow: var(--shadow-墨-中);
}

/* 头部 */
.thinking-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-紧);
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
  position: relative;
}

.thinking-header:hover {
  background: var(--ink-晕染-中);
}

.thinking-icon {
  width: 18px;
  height: 18px;
  color: var(--ink-焦);
  opacity: 0.4;
  animation: thinkRotate 4s linear infinite;
}

.thinking-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes thinkRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.thinking-label {
  font-size: 12px;
  color: var(--ink-重);
  font-weight: 500;
  letter-spacing: 1px;
}

.expand-indicator {
  margin-left: auto;
  width: 16px;
  height: 16px;
  color: var(--ink-淡);
  transition: transform 0.3s ease;
}

.expand-indicator.rotated {
  transform: rotate(180deg);
}

.expand-indicator svg {
  width: 100%;
  height: 100%;
}

/* 内容区域 */
.thinking-expand-enter-active,
.thinking-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.thinking-expand-enter-from,
.thinking-expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.thinking-expand-enter-to,
.thinking-expand-leave-from {
  max-height: 400px;
  opacity: 1;
  margin-top: var(--spacing-紧);
}

.thinking-content {
  border-top: var(--border-细);
}

.thinking-inner {
  position: relative;
  padding: 12px var(--spacing-宽);
  background: var(--ink-晕染-浅);
}

.thinking-border-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  opacity: 0.05;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Cpath d='M0,60 L60,60 L60,0' fill='none' stroke='%231a1a1a' stroke-width='1'/%3E%3C/svg%3E") no-repeat top right;
}

.thinking-text {
  position: relative;
  z-index: 1;
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink-重);
}

.thinking-line {
  margin: 0;
  padding: 2px 0;
  position: relative;
  padding-left: 14px;
}

.thinking-line::before {
  content: '·';
  position: absolute;
  left: 0;
  color: var(--ink-淡);
}

.thinking-line .keyword {
  color: var(--ink-焦);
  font-weight: 600;
}

.thinking-line .quote {
  color: var(--ink-重);
  font-style: italic;
}

/* 墨滴装饰 */
.thinking-ink-drips {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  overflow: hidden;
  pointer-events: none;
}

.drip {
  position: absolute;
  bottom: -10px;
  width: 30px;
  height: 30px;
  background: radial-gradient(ellipse, rgba(26, 26, 26, 0.06) 0%, transparent 70%);
  filter: blur(5px);
}

.drip-1 {
  left: 20%;
  animation: dripFall 3s ease-in-out infinite;
}

.drip-2 {
  left: 70%;
  animation: dripFall 3s ease-in-out infinite 1.5s;
}

@keyframes dripFall {
  0%, 100% {
    opacity: 0;
    transform: translateY(-10px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
