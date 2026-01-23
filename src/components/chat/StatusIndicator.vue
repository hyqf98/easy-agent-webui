<template>
  <div class="status-indicator">
    <div class="status-info">
      <span class="status-text">{{ statusText }}</span>
      <span v-if="estimatedTime" class="status-time">预计 {{ estimatedTime }}</span>
    </div>
    <div class="status-progress">
      <div
        class="status-progress-bar"
        :class="{ 'status-progress-bar-animated': isRunning }"
        :style="{ width: progress + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 状态指示器组件
 *
 * <p>显示当前生成阶段和进度。</p>
 *
 * <h3>阶段说明</h3>
 * <ul>
 *   <li>阶段 0: 准备开始</li>
 *   <li>阶段 1: 正在分析需求并制定计划（PlanningAgent）</li>
 *   <li>阶段 2: 正在采集相关数据（DataCollectAgent）</li>
 *   <li>阶段 3: 正在生成内容（ContentGenAgent）</li>
 *   <li>阶段 4: 已完成</li>
 * </ul>
 *
 * @author easy-agent
 * @since 1.0.0
 */

const props = defineProps({
  /** 当前阶段（0-4） */
  currentStage: {
    type: Number,
    default: 0
  },
  /** 预计剩余时间（如 "2分钟"） */
  estimatedTime: {
    type: String,
    default: ''
  }
})

// 进度百分比
const progress = computed(() => {
  if (props.currentStage >= 4) return 100
  return Math.min((props.currentStage / 3) * 100, 100)
})

// 是否正在运行
const isRunning = computed(() => {
  return props.currentStage > 0 && props.currentStage < 4
})

// 状态文本
const statusText = computed(() => {
  const texts = {
    0: '准备开始...',
    1: '阶段 1/3: 正在分析需求并制定计划...',
    2: '阶段 2/3: 正在采集相关数据...',
    3: '阶段 3/3: 正在生成内容...',
    4: '已完成'
  }
  return texts[props.currentStage] || texts[0]
})
</script>

<style scoped>
.status-indicator {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
}

.status-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.status-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.status-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.status-progress {
  height: 4px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.status-progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

/* 进度条动画 */
@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.status-progress-bar-animated {
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 50%,
    var(--color-primary) 100%
  );
  background-size: 200% 100%;
  animation: progress-shimmer 2s linear infinite;
}

/* 完成状态 */
.status-indicator.completed .status-progress-bar {
  background: var(--color-success);
}
</style>
