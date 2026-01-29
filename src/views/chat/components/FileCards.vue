<template>
  <div v-if="files.length > 0" class="file-cards-container">
    <div class="file-cards-header">
      <el-icon :size="16"><Folder /></el-icon>
      <span class="header-title">相关文件</span>
      <span class="file-count">{{ files.length }}</span>
    </div>
    <div class="file-cards-scroll">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="file-card"
        :class="`file-card-rotate-${index % 3}`"
      >
        <div class="file-card-header">
          <el-icon class="file-icon" :size="16"><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
        </div>
        <div class="file-card-meta">
          <span class="file-size">{{ file.size }}</span>
          <span class="file-type">{{ file.type }}</span>
        </div>
      </div>
    </div>
    <div class="scroll-hint">
      <span>左右滑动查看更多</span>
      <el-icon :size="12"><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { Folder, Document, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
/* Hand-Drawn Sketch Style - File Cards */
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

.file-cards-container {
  margin-top: var(--space-md);
  margin-bottom: var(--space-md);
  /* 响应式宽度 - 确保有明确的最小宽度 */
  width: 100%;
  min-width: min(250px, 40vw);
  max-width: min(500px, 75vw);
  /* 透明背景，只渲染文件列表 */
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  position: relative;
}

.file-cards-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: var(--border-thin) dashed var(--ink-light);
}

.header-title {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--ink-medium);
  flex: 1;
}

.file-count {
  font-family: var(--font-hand);
  font-size: var(--text-xs);
  color: var(--pencil-orange);
  background: rgba(196, 135, 91, 0.15);
  padding: 2px 6px;
  border: var(--border-thin) solid rgba(196, 135, 91, 0.3);
  border-radius: 3px;
}

.file-cards-scroll {
  display: flex;
  gap: var(--space-md);
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--space-xs) 0 var(--space-sm) 2px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-medium) transparent;
}

.file-cards-scroll::-webkit-scrollbar {
  height: 6px;
}

.file-cards-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.file-cards-scroll::-webkit-scrollbar-thumb {
  background: var(--ink-medium);
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background-clip: padding-box;
}

.file-cards-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--ink-dark);
}

.file-card {
  flex-shrink: 0;
  /* 响应式宽度 */
  width: clamp(120px, 20%, 160px);
  padding: var(--space-sm);
  background: rgba(250, 247, 240, 0.6);
  border: var(--border-thin) solid var(--ink-medium);
  border-radius: 4px;
  box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.04);
  scroll-snap-align: start;
  transition: all var(--duration-fast) var(--ease-sketch);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.file-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--pencil-orange);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-sketch);
}

.file-card:hover {
  border-color: var(--pencil-orange);
  background: rgba(250, 247, 240, 0.9);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.08);
  transform: translateY(-2px) rotate(0deg) !important;
}

.file-card:hover::before {
  opacity: 1;
}

/* Different subtle rotations for file cards */
.file-card.file-card-rotate-0 {
  transform: rotate(-0.8deg);
}

.file-card.file-card-rotate-1 {
  transform: rotate(0.6deg);
}

.file-card.file-card-rotate-2 {
  transform: rotate(-0.4deg);
}

.file-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.file-icon {
  color: var(--pencil-orange);
  flex-shrink: 0;
}

.file-name {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--ink-dark);
  font-family: var(--font-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  line-height: 1.3;
}

.file-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
  font-size: 10px;
  color: var(--ink-light);
  font-family: var(--font-code);
}

.file-size {
  flex-shrink: 0;
}

.file-type {
  flex-shrink: 0;
  padding: 2px 6px;
  background: rgba(180, 220, 150, 0.4);
  border: var(--border-thin) solid var(--pencil-green);
  border-radius: 3px;
  color: #5A8B54;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 9px;
}

/* Scroll hint */
.scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: var(--space-xs);
  padding-top: var(--space-xs);
  border-top: var(--border-thin) dashed rgba(0, 0, 0, 0.08);
  font-size: 10px;
  color: var(--ink-faint);
  font-family: var(--font-hand);
  opacity: 0.5;
  transition: opacity var(--duration-fast) var(--ease-sketch);
}

.file-cards-container:hover .scroll-hint {
  opacity: 0.3;
}

/* Animation for new file cards */
@keyframes file-card-slide-in {
  from {
    opacity: 0;
    transform: translateX(-30px) rotate(-3deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(var(--rotation, 0deg));
  }
}

.file-card {
  animation: file-card-slide-in 0.4s var(--ease-sketch) backwards;
}

.file-card:nth-child(1) { animation-delay: 0ms; }
.file-card:nth-child(2) { animation-delay: 80ms; }
.file-card:nth-child(3) { animation-delay: 160ms; }
.file-card:nth-child(4) { animation-delay: 240ms; }
.file-card:nth-child(5) { animation-delay: 320ms; }
.file-card:nth-child(6) { animation-delay: 400ms; }

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .file-card {
    animation: none;
  }

  .file-card:hover {
    transform: translateY(-2px) !important;
  }
}

/* Touch target size for mobile */
@media (pointer: coarse) {
  .file-card {
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
