<template>
  <div class="content-panel">
    <!-- 工具栏 -->
    <ContentToolbar
      :can-download="canDownload"
      @download="handleDownload"
      @copy="handleCopy"
    />

    <!-- 状态指示器 -->
    <StatusIndicator
      :current-stage="currentStage"
      :estimated-time="estimatedTime"
    />

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 流式生成时使用 Typewriter -->
      <Typewriter
        v-if="isStreaming && content"
        :content="content"
        :is-markdown="true"
        :typing="{ step: 5, interval: 30 }"
      />

      <!-- 完成后显示静态内容 -->
      <XMarkdown
        v-else-if="content"
        :content="content"
      />

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-icon class="empty-icon"><Document /></el-icon>
        <p>等待内容生成...</p>
        <p class="empty-hint">智能体正在规划和采集数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { Typewriter, XMarkdown } from 'vue-element-plus-x'
import { ElMessage } from 'element-plus'
import ContentToolbar from '../toolbar/ContentToolbar.vue'
import StatusIndicator from '../StatusIndicator.vue'

/**
 * 内容面板组件
 *
 * <p>右侧面板，显示实时生成的内容和状态。</p>
 *
 * <h3>功能</h3>
 * <ul>
 *   <li>工具栏：复制、下载（MD/HTML/DOCX）</li>
 *   <li>状态指示器：显示当前阶段和进度</li>
 *   <li>内容展示：流式打字机效果或静态 Markdown</li>
 * </ul>
 *
 * @author easy-agent
 * @since 1.0.0
 */

const props = defineProps({
  /** 生成的内容 */
  content: {
    type: String,
    default: ''
  },
  /** 是否正在流式生成 */
  isStreaming: {
    type: Boolean,
    default: false
  },
  /** 当前阶段（0-4） */
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

// 是否可以下载
const canDownload = computed(() => {
  return props.content && !props.isStreaming
})

/**
 * 处理下载
 */
async function handleDownload(format) {
  try {
    // TODO: 实现下载功能
    ElMessage.success(`下载为 ${format.toUpperCase()} 格式...`)
  } catch (error) {
    ElMessage.error('下载失败：' + error.message)
  }
}

/**
 * 处理复制
 */
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.content)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}
</script>

<style scoped src="./ContentPanel.css"></style>
