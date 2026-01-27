<template>
  <div class="demo-page">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span>ready</span>
        </div>
        <div class="nav-bar">
          <span
            v-for="item in navItems"
            :key="item.text"
            class="nav-item"
            @click="handleNavClick(item)"
          >
            <span class="icon">{{ item.icon }}</span>
            <span>{{ item.text }}</span>
          </span>
        </div>
      </div>
      <div class="header-right">
        <button class="lang-btn" @click="toggleLang">
          <span>🌐</span>
          <span>{{ currentLang }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-card">
          <h1 class="hero-title">Agent Skills Marketplace</h1>
          <p class="hero-subtitle">基于开放的 SKILL.md 生态系统</p>

          <div class="code-block">
            <div v-for="(line, index) in codeLines" :key="index" class="code-line">
              <span
                v-for="(token, tokenIndex) in line"
                :key="tokenIndex"
                :class="token.type"
              >{{ token.text }}</span>
            </div>
          </div>

          <div class="info-box">
            每个技能都是一个独立的模块，可以通过简单的命令导入和使用。支持自定义扩展和社区贡献。
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">trend-analytics.tsx</span>
          </div>
          <div class="chart-container">
            <svg class="chart-svg" viewBox="0 0 400 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#e8a84c;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#e8a84c;stop-opacity:0" />
                </linearGradient>
              </defs>
              <!-- Area -->
              <path class="chart-area" d="M0,160 Q50,140 100,120 T200,80 T300,50 T400,60 V180 H0 Z" />
              <!-- Line -->
              <path
                fill="none"
                stroke="#e8a84c"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M0,160 Q50,140 100,120 T200,80 T300,50 T400,60"
              />
              <!-- Points -->
              <circle class="chart-point" cx="100" cy="120" />
              <circle class="chart-point" cx="200" cy="80" />
              <circle class="chart-point" cx="300" cy="50" />
              <circle class="chart-point" cx="400" cy="60" />
            </svg>
          </div>
          <div class="chart-labels">
            <span v-for="label in chartLabels" :key="label">{{ label }}</span>
          </div>
          <p class="chart-caption">根据 skill 最后 push 时间统计，非当日提交的数量</p>
        </div>
      </section>

      <!-- Search Section -->
      <section class="search-section">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索技能、命令或模块..."
          >
          <button class="search-btn" @click="handleSearch">
            <span>▶</span>
            <span>执行</span>
          </button>
        </div>
      </section>

      <!-- Skills Grid -->
      <section class="skills-grid">
        <div
          v-for="module in modules"
          :key="module.id"
          ref="cardRefs"
          class="skill-card"
          :class="{ selected: selectedModuleId === module.id }"
          :style="{ display: isCardVisible(module) ? 'block' : 'none' }"
          :tabindex="0"
          @click="handleModuleClick(module)"
          @keydown="handleCardKeydown($event, module)"
        >
          <div class="skill-body">
            <div class="module-header">
              <div class="module-folder">
                <span :class="['folder-icon', module.colorClass]">📁</span>
                <span class="folder-name">{{ module.folder }}/</span>
              </div>
              <span class="module-label">module</span>
            </div>
            <div class="module-content">
              <div class="module-line">
                <span class="json-key">"name"</span><span class="punctuation">:</span>
                <span class="json-value">"{{ module.name }}"</span>
              </div>
              <div class="module-line">
                <span class="json-key">"exports"</span><span class="punctuation">:</span>
                <span :class="['json-number', module.numberClass]">{{ module.exports }}</span>
                <span class="json-comment">// 个技能</span>
              </div>
            </div>
            <div class="module-command">
              <span class="command-prompt">$</span><span class="command-text"> {{ module.command }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Section -->
      <section class="bottom-section">
        <div v-for="(quote, index) in quotes" :key="index" class="quote-card">
          <p class="quote-text">{{ quote }}</p>
        </div>
      </section>
    </main>

    <!-- Floating Button -->
    <button class="floating-btn" @click="scrollToTop">
      <span>↑</span>
      <span>cd top</span>
    </button>
  </div>
</template>

<script setup>
// Refs
const searchInputRef = ref(null)
const cardRefs = ref([])

// 数据定义
const currentLang = ref('ZH')
const searchQuery = ref('')
const selectedModuleId = ref(null)

const navItems = [
  { icon: '$', text: 'ai --search' },
  { icon: 'cd', text: '/categories' },
  { icon: 'ls', text: '-la' }
]

const codeLines = [
  [
    { type: 'keyword', text: 'export' },
    { type: 'keyword', text: 'const' },
    { type: 'variable', text: 'skill' },
    { type: 'punctuation', text: '= {' }
  ],
  [
    { type: 'variable', text: 'name:' },
    { type: 'string', text: "'ai-assistant'" },
    { type: 'punctuation', text: ',' }
  ],
  [
    { type: 'variable', text: 'action:' },
    { type: 'string', text: "'generate-code'" },
    { type: 'punctuation', text: ',' }
  ],
  [
    { type: 'variable', text: 'enabled:' },
    { type: 'boolean', text: 'true' }
  ],
  [
    { type: 'punctuation', text: '}' }
  ]
]

const chartLabels = ['11月10日', '11月24日', '12月08日', '12月22日']

const quotes = [
  'Agent Skills Marketplace 是一个开放的平台，汇集了各类 AI 技能模块。每个模块都是独立的、可复用的组件，可以轻松集成到您的项目中。',
  '通过简单的命令行界面，您可以浏览、搜索和导入所需的技能模块。社区驱动的生态系统确保了技能的持续更新和质量保证。'
]

const modules = [
  {
    id: 'tools',
    folder: 'tools/',
    name: '工具',
    exports: 28400,
    colorClass: 'folder-purple',
    numberClass: 'number-high',
    command: 'cd tools && ls'
  },
  {
    id: 'development',
    folder: 'development/',
    name: '开发',
    exports: 15600,
    colorClass: 'folder-blue',
    numberClass: 'number-high',
    command: 'cd development && ls'
  },
  {
    id: 'data-ai',
    folder: 'data-ai/',
    name: '数据与AI',
    exports: 12300,
    colorClass: 'folder-indigo',
    numberClass: 'number-high',
    command: 'cd data-ai && ls'
  },
  {
    id: 'testing-security',
    folder: 'testing-security/',
    name: '测试与安全',
    exports: 8900,
    colorClass: 'folder-cyan',
    numberClass: 'number-medium',
    command: 'cd testing-security && ls'
  },
  {
    id: 'devops',
    folder: 'devops/',
    name: '运维',
    exports: 7200,
    colorClass: 'folder-orange',
    numberClass: 'number-medium',
    command: 'cd devops && ls'
  },
  {
    id: 'documentation',
    folder: 'documentation/',
    name: '文档',
    exports: 5400,
    colorClass: 'folder-green',
    numberClass: 'number-medium',
    command: 'cd documentation && ls'
  },
  {
    id: 'business',
    folder: 'business/',
    name: '商务',
    exports: 4100,
    colorClass: 'folder-pink',
    numberClass: 'number-low',
    command: 'cd business && ls'
  },
  {
    id: 'research',
    folder: 'research/',
    name: '研究',
    exports: 3800,
    colorClass: 'folder-teal',
    numberClass: 'number-low',
    command: 'cd research && ls'
  },
  {
    id: 'content-media',
    folder: 'content-media/',
    name: '内容与媒体',
    exports: 2900,
    colorClass: 'folder-lime',
    numberClass: 'number-low',
    command: 'cd content-media && ls'
  },
  {
    id: 'databases',
    folder: 'databases/',
    name: '数据库',
    exports: 2100,
    colorClass: 'folder-red',
    numberClass: 'number-low',
    command: 'cd databases && ls'
  }
]

// 方法
function toggleLang() {
  currentLang.value = currentLang.value === 'ZH' ? 'EN' : 'ZH'
}

function handleNavClick(item) {
  console.log(`Executing: ${item.text}`)
  // 添加视觉反馈
  const target = event.currentTarget
  target.style.transform = 'scale(0.95)'
  setTimeout(() => {
    target.style.transform = ''
  }, 100)
}

function isCardVisible(module) {
  if (!searchQuery.value) return true
  const query = searchQuery.value.toLowerCase()
  const text = `${module.name} ${module.folder}`.toLowerCase()
  return text.includes(query)
}

function handleSearch() {
  const query = searchQuery.value.toLowerCase()
  console.log('Searching for:', query)
}

function handleModuleClick(module) {
  console.log(`Executing: ${module.command}`)

  if (selectedModuleId.value === module.id) {
    selectedModuleId.value = null
  } else {
    selectedModuleId.value = module.id
  }

  // Click feedback animation
  const card = event.currentTarget
  card.style.transform = 'translateY(-4px) scale(0.98)'
  setTimeout(() => {
    if (selectedModuleId.value === module.id) {
      card.style.transform = 'translateY(-4px)'
    } else {
      card.style.transform = ''
    }
  }, 100)
}

function handleCardKeydown(e, module) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleModuleClick(module)
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 搜索输入监听
watch(searchQuery, (newVal) => {
  if (!newVal) {
    // 清空时显示所有卡片
    cardRefs.value.forEach(card => {
      if (card) card.style.display = 'block'
    })
  }
})

// 点击外部清除选择
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 监听搜索输入框的键盘事件
  if (searchInputRef.value) {
    searchInputRef.value.addEventListener('keyup', handleSearchKeyup)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchInputRef.value) {
    searchInputRef.value.removeEventListener('keyup', handleSearchKeyup)
  }
})

function handleClickOutside(e) {
  if (!e.target.closest('.skill-card') && selectedModuleId.value) {
    const selectedCard = cardRefs.value.find(c => c?.classList.contains('selected'))
    if (selectedCard) {
      selectedCard.classList.remove('selected')
      selectedCard.style.transform = ''
    }
    selectedModuleId.value = null
  }
}

function handleSearchKeyup(e) {
  if (e.key === 'Enter') {
    const query = searchQuery.value.toLowerCase()
    cardRefs.value.forEach(card => {
      if (card) {
        const text = card.textContent.toLowerCase()
        card.style.display = text.includes(query) ? 'block' : 'none'
      }
    })
  } else if (e.key === 'Escape') {
    searchQuery.value = ''
    cardRefs.value.forEach(card => {
      if (card) card.style.display = 'block'
    })
  }
}

// ESC 键清除选择
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

function handleEscape(e) {
  if (e.key === 'Escape') {
    if (selectedModuleId.value) {
      const selectedCard = cardRefs.value.find(c => c?.classList.contains('selected'))
      if (selectedCard) {
        selectedCard.classList.remove('selected')
        selectedCard.style.transform = ''
      }
      selectedModuleId.value = null
    }
    if (searchQuery.value) {
      searchQuery.value = ''
      cardRefs.value.forEach(card => {
        if (card) card.style.display = 'block'
      })
    }
  }
}
</script>

<style scoped>
/* CSS 变量定义 */
:root {
  /* 基础色彩 */
  --bg-cream: #faf8f5;
  --bg-white: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a5a;
  --text-muted: #8a8a9a;
  --border-color: #e0d8c8;
  --border-dark: #c8c0b0;

  /* 强调色 */
  --accent-blue: #4a90d9;
  --accent-purple: #9b7ed8;
  --accent-green: #5cb58a;
  --accent-orange: #e8a84c;
  --accent-pink: #e87a90;
  --accent-teal: #4ab8a8;

  /* 阴影 */
  --shadow-sm: 0 2px 4px rgba(26, 26, 46, 0.04);
  --shadow-md: 0 4px 12px rgba(26, 26, 46, 0.06);
  --shadow-lg: 0 8px 24px rgba(26, 26, 46, 0.08);
}

.demo-page {
  min-height: 100vh;
  background-color: var(--bg-cream);
  background-image:
    radial-gradient(circle at 1px 1px, rgba(200, 192, 176, 0.15) 1px, transparent 0);
  background-size: 24px 24px;
  color: var(--text-primary);
  line-height: 1.6;
}

/* Header */
.header {
  background: var(--bg-white);
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-cream);
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.nav-item .icon {
  font-weight: 600;
  opacity: 0.7;
}

.nav-item:hover .icon {
  opacity: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background: var(--accent-purple);
  color: white;
  border-color: var(--accent-purple);
}

/* Main Content */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.hero-card {
  background: var(--bg-white);
  padding: 28px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-pink));
  opacity: 0.8;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-weight: 400;
}

/* Code Block */
.code-block {
  background: #f8f6f3;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px;
  font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 18px;
  overflow-x: auto;
}

.code-line {
  display: flex;
  align-items: flex-start;
}

.keyword {
  color: var(--accent-purple);
  font-weight: 500;
}

.string {
  color: var(--accent-green);
}

.variable {
  color: var(--accent-blue);
  font-weight: 500;
}

.punctuation {
  color: var(--text-muted);
}

.boolean {
  color: var(--accent-orange);
  font-weight: 500;
}

.info-box {
  background: linear-gradient(135deg, #fff9ed 0%, #fff4e0 100%);
  border-left: 3px solid var(--accent-orange);
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Chart Card */
.chart-card {
  background: var(--bg-white);
  padding: 28px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.chart-header {
  margin-bottom: 18px;
}

.chart-title {
  font-size: 13px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

.chart-container {
  height: 180px;
  position: relative;
  background: #f8f6f3;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.chart-area {
  fill: url(#chartGradient);
  stroke: var(--accent-orange);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-point {
  fill: var(--bg-white);
  stroke: var(--accent-orange);
  stroke-width: 2.5;
  r: 5;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.chart-caption {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 12px;
}

/* Search Section */
.search-section {
  margin-bottom: 28px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 20px;
  max-width: 600px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
}

.search-icon {
  color: var(--text-muted);
  font-size: 18px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 400;
  color: var(--text-primary);
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--accent-green);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background: #4aa578;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.skill-card {
  background: var(--bg-white);
  border-radius: 14px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  position: relative;
  animation: fadeIn 0.4s ease backwards;
}

.skill-card:nth-child(1) { animation-delay: 0.05s; }
.skill-card:nth-child(2) { animation-delay: 0.1s; }
.skill-card:nth-child(3) { animation-delay: 0.15s; }
.skill-card:nth-child(4) { animation-delay: 0.2s; }
.skill-card:nth-child(5) { animation-delay: 0.25s; }
.skill-card:nth-child(6) { animation-delay: 0.3s; }
.skill-card:nth-child(7) { animation-delay: 0.35s; }
.skill-card:nth-child(8) { animation-delay: 0.4s; }
.skill-card:nth-child(9) { animation-delay: 0.45s; }
.skill-card:nth-child(10) { animation-delay: 0.5s; }

.skill-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-dark);
}

.skill-card.selected {
  border: 2px solid var(--accent-blue);
  box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.15), var(--shadow-lg);
}

.skill-card.selected::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-blue);
  border-radius: 14px 14px 0 0;
}

.skill-card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: 14px;
  padding: 1px;
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.skill-card:hover::before {
  opacity: 1;
}

.skill-body {
  padding: 18px;
}

.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.module-folder {
  display: flex;
  align-items: center;
  gap: 10px;
}

.folder-icon {
  font-size: 22px;
}

.folder-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.module-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  background: var(--bg-cream);
  border-radius: 6px;
}

.module-content {
  font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 14px;
}

.module-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.json-key {
  color: var(--accent-purple);
  font-weight: 500;
}

.json-value {
  color: var(--text-primary);
}

.json-number {
  color: var(--accent-orange);
  font-weight: 500;
}

.json-comment {
  color: var(--text-muted);
  font-size: 12px;
  font-style: italic;
}

.module-command {
  background: #f8f6f3;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  font-family: 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.command-prompt {
  color: var(--accent-green);
  font-weight: 600;
}

.command-text {
  color: var(--text-secondary);
}

/* Folder colors */
.folder-purple { color: var(--accent-purple); }
.folder-blue { color: var(--accent-blue); }
.folder-orange { color: var(--accent-orange); }
.folder-green { color: var(--accent-green); }
.folder-pink { color: var(--accent-pink); }
.folder-teal { color: var(--accent-teal); }
.folder-red { color: #e74c4c; }
.folder-indigo { color: #6c5ce7; }
.folder-cyan { color: #00cec9; }
.folder-lime { color: #a3cb38; }

/* Number colors based on value ranges */
.number-high { color: #e74c4c; font-weight: 600; }
.number-medium { color: var(--accent-orange); font-weight: 600; }
.number-low { color: var(--accent-green); font-weight: 600; }

/* Bottom Section */
.bottom-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.quote-card {
  background: var(--bg-white);
  padding: 24px;
  border-radius: 14px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  position: relative;
}

.quote-card::before {
  content: '"';
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 48px;
  color: var(--accent-blue);
  font-family: Georgia, serif;
  opacity: 0.15;
  line-height: 1;
}

.quote-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  padding-left: 20px;
}

/* Floating Button */
.floating-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.floating-btn:hover {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 26px;
  }
  .main-content {
    padding: 16px;
  }
}
</style>
