<template>
  <div class="tool-call-view message-fade-in">
    <el-collapse>
      <el-collapse-item>
        <template #title>
          <div class="tool-call-header" :class="statusClass">
            <span class="status-icon" :class="iconClass">
              <svg v-if="toolCall.status === 'calling'" width="16" height="16" viewBox="0 0 16 16" fill="none" class="tool-call-spinning">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="12 4"/>
              </svg>
              <svg v-else-if="toolCall.status === 'success'" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="M5.5 8L7.5 10L10.5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="tool-name">{{ toolCall.name || '未知工具' }}</span>
            <span class="status-text">{{ statusText }}</span>
          </div>
        </template>

        <div class="tool-call-body">
          <!-- 输入参数 -->
          <div class="tool-section">
            <div class="section-label">输入参数</div>
            <pre class="json-content">{{ formatJson(toolCall.params) }}</pre>
          </div>

          <!-- 输出结果 -->
          <div v-if="toolCall.result" class="tool-section">
            <div class="section-label">输出结果</div>
            <pre class="json-content">{{ formatJson(toolCall.result) }}</pre>
          </div>

          <!-- 错误信息 -->
          <div v-if="toolCall.status === 'failed' && toolCall.errorMessage" class="tool-section error-section">
            <div class="section-label">错误信息</div>
            <div class="error-message">{{ toolCall.errorMessage }}</div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  toolCall: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      status: 'calling',
      params: '',
      result: '',
      errorMessage: ''
    })
  }
})

const statusText = computed(() => {
  switch (props.toolCall.status) {
    case 'calling':
      return '正在调用...'
    case 'success':
      return '调用成功'
    case 'failed':
      return '调用失败'
    default:
      return ''
  }
})

const statusClass = computed(() => {
  return `status-${props.toolCall.status}`
})

const iconClass = computed(() => {
  return props.toolCall.status === 'calling' ? 'tool-call-spinning' : ''
})

const formatJson = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
.tool-call-view {
  max-width: 75%;
}

.tool-call-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.status-calling .status-icon {
  color: var(--color-warning);
  background: rgba(212, 165, 116, 0.15);
}

.status-success .status-icon {
  color: var(--color-success);
  background: var(--accent-light);
}

.status-failed .status-icon {
  color: var(--color-error);
  background: rgba(196, 120, 106, 0.15);
}

.tool-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'Fira Code', 'Consolas', monospace;
}

.status-text {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* 工具调用内容 */
.tool-call-body {
  padding: 0.75rem 0 0;
}

.tool-section {
  margin-bottom: 0.75rem;
}

.tool-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: 0.375rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* JSON 内容展示 */
.json-content {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-primary);
  overflow-x: auto;
  white-space: pre;
  margin: 0;
  border: 1px solid var(--border-subtle);
}

/* 错误区域 */
.error-section {
  background: rgba(196, 120, 106, 0.08);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(196, 120, 106, 0.2);
}

.error-message {
  color: var(--color-error);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tool-call-spinning {
  animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* 淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-fade-in {
  animation: fadeInUp 0.35s cubic-bezier(0.2, 0, 0.2, 1);
}

/* 折叠面板样式覆盖 */
:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  border: none;
  background: transparent;
  height: auto;
  line-height: normal;
  padding: 0;
}

:deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

:deep(.el-collapse-item__arrow) {
  margin-left: 0.5rem;
  color: var(--text-tertiary);
}
</style>
