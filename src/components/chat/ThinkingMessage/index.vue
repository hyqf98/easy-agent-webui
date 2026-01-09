<template>
  <div class="thinking-message" :class="{ 'expanded': isExpanded }">
    <div class="thinking-header" @click="toggle">
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
import { useThinkingMessage } from './ThinkingMessage.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle'])

const { formattedContent, toggle } = useThinkingMessage(props, emit)
</script>

<style src="./ThinkingMessage.css"></style>
