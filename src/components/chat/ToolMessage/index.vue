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
import { useToolMessage } from './ToolMessage.js'

const props = defineProps({
  tool: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.name && value.status && ['calling', 'completed'].includes(value.status)
    }
  }
})

const { isExpanded, toggleExpand, statusText, formattedInput, formattedOutput } = useToolMessage(props)
</script>

<style src="./ToolMessage.css"></style>
