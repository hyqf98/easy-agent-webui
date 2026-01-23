<template>
  <div class="process-panel">
    <div class="panel-header">
      <h3 class="panel-title">执行过程</h3>
      <span class="panel-badge">{{ filteredMessages.length }}</span>
    </div>

    <div class="panel-content">
      <template v-for="(message, index) in filteredMessages" :key="index">
        <!-- 思考过程 -->
        <ThinkingMessage
          v-if="message.type === 'thinking'"
          :message="message"
        />

        <!-- 工具调用 -->
        <ToolMessage
          v-else-if="message.type === 'tool_call_start' || message.type === 'tool_call_result'"
          :message="message"
        />

        <!-- 规划结果 -->
        <div
          v-else-if="message.type === 'plan_result'"
          class="message-plan-result message"
        >
          <div class="message-header">
            <el-icon class="message-icon"><List /></el-icon>
            <span class="message-title">生成计划</span>
          </div>
          <div class="plan-steps">
            <div
              v-for="(step, stepIndex) in message.steps"
              :key="stepIndex"
              class="plan-step"
            >
              <span class="step-number">{{ stepIndex + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>
        </div>
      </template>

      <div v-if="filteredMessages.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Clock /></el-icon>
        <p>等待任务开始...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, List } from '@element-plus/icons-vue'
import ThinkingMessage from '../ThinkingMessage/index.vue'
import ToolMessage from '../ToolMessage/index.vue'

/**
 * 过程面板组件
 *
 * <p>左侧面板，显示智能体执行过程中的思考、工具调用、规划结果。</p>
 *
 * <h3>显示规则</h3>
 * <ul>
 *   <li>✅ 思考过程（thinking）- 默认折叠</li>
 *   <li>✅ 工具调用（tool_call_start/result）- 默认展开</li>
 *   <li>✅ 规划结果（plan_result）- 显示步骤列表</li>
 *   <li>❌ 智能体切换（agent_switch）- 不显示</li>
 *   <li>❌ 文件创建通知（file_created）- 不显示</li>
 * </ul>
 *
 * @author easy-agent
 * @since 1.0.0
 */

const props = defineProps({
  /** 所有消息列表 */
  messages: {
    type: Array,
    default: () => []
  },
  /** 当前阶段（用于进度指示） */
  currentStage: {
    type: Number,
    default: 0
  }
})

/**
 * 过滤需要显示的消息类型
 */
const filteredMessages = computed(() => {
  const displayTypes = ['thinking', 'tool_call_start', 'tool_call_result', 'plan_result']
  return props.messages.filter(msg => displayTypes.includes(msg.type))
})
</script>

<style scoped src="./ProcessPanel.css"></style>
