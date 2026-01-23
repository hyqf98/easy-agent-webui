<template>
  <div class="content-toolbar">
    <div class="toolbar-left">
      <button
        class="toolbar-btn"
        :disabled="!canCopy"
        @click="$emit('copy')"
        title="复制内容"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        <span>复制</span>
      </button>
    </div>

    <div class="toolbar-right">
      <el-dropdown trigger="click" @command="handleDownload">
        <button
          class="toolbar-btn toolbar-btn-primary"
          :disabled="downloading || !canDownload"
        >
          <svg v-if="!downloading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <svg v-else class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path fill="none" stroke="currentColor" stroke-width="2" d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <span>{{ downloading ? '下载中...' : '下载' }}</span>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="md">
              <span class="dropdown-item">
                <span class="dropdown-icon">M</span>
                Markdown (.md)
              </span>
            </el-dropdown-item>
            <el-dropdown-item command="html">
              <span class="dropdown-item">
                <span class="dropdown-icon">H</span>
                网页 (.html)
              </span>
            </el-dropdown-item>
            <el-dropdown-item command="docx">
              <span class="dropdown-item">
                <span class="dropdown-icon">W</span>
                Word 文档 (.docx)
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/**
 * 内容工具栏组件
 *
 * <p>提供内容复制和下载功能。</p>
 *
 * @author easy-agent
 * @since 1.0.0
 */

const props = defineProps({
  /** 是否可以下载（内容生成完成） */
  canDownload: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['download', 'copy'])

// 是否正在下载
const downloading = ref(false)

// 是否可以复制
const canCopy = computed(() => props.canDownload)

/**
 * 处理下载
 */
async function handleDownload(format) {
  if (downloading.value || !props.canDownload) return
  downloading.value = true
  try {
    await emit('download', format)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: var(--spacing-sm);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
}

.toolbar-btn:hover:not(:disabled) {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
  border-color: var(--color-border-secondary);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn-primary {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.toolbar-btn-primary:hover:not(:disabled) {
  background: var(--color-primary-100);
}

/* 加载动画 */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 下拉菜单样式 */
.dropdown-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.dropdown-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: #ffffff;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
}

.dropdown-item[data-command="html"] .dropdown-icon {
  background: var(--color-warning);
}

.dropdown-item[data-command="docx"] .dropdown-icon {
  background: var(--color-info);
}
</style>
