# CLAUDE.md - 前端开发规范

本文件为 Claude Code 在前端模块 (easy-agent-webui) 工作时提供指导。

## 模块概述

Easy Agent 前端基于 Vue 3.5.24 + Vite 7.2.4 + Element Plus 2.13.0 构建，是一个多智能体编排平台的 Web 界面。

## 技术栈

- **Vue 3.5.24**: 前端框架 (使用 Composition API + `<script setup>`)
- **Vite 7.2.4**: 构建工具
- **Element Plus 2.13.0**: UI 组件库
- **Vue Router 4.6.4**: 路由管理
- **Axios 1.13.2**: HTTP 客户端
- **vue-element-plus-x 1.3.98**: AI 聊天组件库 (XMarkdown, Typewriter 等)

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 10000)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## Vite 配置

### 开发服务器配置

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    vue(),
    // Vue 和 Vue Router API 自动导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
    }),
    // Element Plus 组件自动导入
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
      deep: false,
      extensions: ['vue'],
      include: [/\.vue$/],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 10000,               // 前端开发端口
    proxy: {
      '/api': {
        target: 'http://localhost:20000',  // 代理到后端
        changeOrigin: true,
        ws: true                           // 支持 SSE (Server-Sent Events)
      },
    },
  },
})
```

## Auto-Import 自动导入配置

项目已配置自动导入，以下内容**无需手动导入**：

### Vue 和 Vue Router API
```javascript
// 以下内容自动导入，无需 import
- ref, computed, reactive, watch, watchEffect, nextTick, onMounted, onUnmounted
- useRouter, useRoute
- defineProps, defineEmits, defineExpose
```

## 代码编写规范

### 1. 组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 1. 导入第三方组件（需要手动导入的）
import { XMarkdown, Typewriter } from 'vue-element-plus-x'

// 2. 导入本地组件
import ConversationList from '@/components/chat/index.vue'

// 3. 导入 composables
import { useSettings } from '@/composables/useSettings'

// 4. Props 定义
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// 5. Emits 定义
const emit = defineEmits(['update:modelValue', 'submit'])

// 6. 响应式数据（ref/computed/reactive 自动导入）
const loading = ref(false)
const formData = reactive({})

// 7. 计算属性（computed 自动导入）
const isValid = computed(() => {
  return formData.value.name?.length > 0
})

// 8. 方法
const handleSubmit = async () => {
  loading.value = true
  try {
    emit('submit', formData.value)
  } finally {
    loading.value = false
  }
}

// 9. 生命周期（onMounted/onUnmounted 自动导入）
onMounted(() => {
  // 初始化逻辑
})

// 10. 暴露给父组件的方法
defineExpose({
  handleSubmit
})
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 2. 组件导入规范

```javascript
// ✅ 正确 - 手动导入第三方组件和本地组件
import { XMarkdown, Typewriter } from 'vue-element-plus-x'
import ConversationList from '@/components/chat/index.vue'
import { useSettings } from '@/composables/useSettings'

// ❌ 错误 - 不需要导入 Vue API
// import { ref, computed, onMounted } from 'vue'  // 已自动导入

// ❌ 错误 - 不需要导入 Element Plus 组件
// import { ElButton, ElInput } from 'element-plus'  // 已自动导入
```

### 3. Element Plus 使用规范

#### 3.1 组件直接使用（自动导入）

```vue
<template>
  <!-- 直接使用，无需 import -->
  <el-button type="primary">按钮</el-button>
  <el-input v-model="text" />
  <el-switch v-model="enabled" />
  <el-dropdown @visible-change="handleDropdownVisible">
    <div class="dropdown-trigger">点击</div>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="custom-content">菜单项</div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
const text = ref('')
const enabled = ref(false)
const handleDropdownVisible = (visible) => {
  console.log('Dropdown visible:', visible)
}
</script>
```

#### 3.2 Element Plus API 调用

```javascript
// ElMessage - 全局消息提示（自动导入）
ElMessage.success('操作成功')
ElMessage.warning('警告信息')
ElMessage.error('操作失败')

// ElMessageBox - 确认弹窗（自动导入）
ElMessageBox.confirm('确定要删除吗？', '提示', {
  confirmButtonText: '删除',
  cancelButtonText: '取消',
  type: 'warning',
  zIndex: 99999,
  closeOnClickModal: false,
  closeOnPressEscape: false
}).then(() => {
  // 确认后操作
  ElMessage.success('删除成功')
}).catch(() => {
  // 取消操作
})
```

#### 3.3 自定义 Element Plus 样式

```vue
<template>
  <el-switch
    v-model="enabled"
    :active-color="'#a86b4a'"
  />
</template>

<style scoped>
/* 使用 :deep() 修改 Element Plus 组件内部样式 */
:deep(.el-switch__core) {
  border-color: #e8e4dc;
}

/* 全局 Element Plus 样式修改（使用 :global） */
:global(.el-message-box) {
  z-index: 99999 !important;
}
</style>
```

### 4. 第三方组件使用

```vue
<template>
  <!-- vue-element-plus-x 组件需要手动导入 -->
  <XMarkdown :content="markdownContent" class="markdown-content" />
  <Typewriter :content="content" :interval="30" :step="2" />
</template>

<script setup>
// 必须手动导入
import { XMarkdown, Typewriter } from 'vue-element-plus-x'

const markdownContent = ref('# Hello World')
const content = ref('正在打字机效果...')
</script>
```

### 5. 路由配置

```javascript
// src/router/index.js
// 注意：createRouter 和 createWebHistory 需要手动导入
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'chat',
    component: () => import('@/views/chat/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

### 6. Composables 使用

```javascript
// src/composables/useSettings.js
import { ref, computed } from 'vue'  // 需要导入供类型推断

export function useSettings() {
  const settingsDialogVisible = ref(false)
  const modelProviders = ref([])

  const loadProviders = async () => {
    // 加载逻辑
  }

  return {
    settingsDialogVisible,
    modelProviders,
    loadProviders
  }
}

// 在组件中使用
<script setup>
import { useSettings } from '@/composables/useSettings'

const {
  settingsDialogVisible,
  modelProviders,
  loadProviders
} = useSettings()

onMounted(() => {
  loadProviders()
})
</script>
```

### 7. 工具函数模块

```javascript
// src/components/chat/ConversationList.js
// 导出工具函数和组合式函数

export const getIconText = (title) => {
  if (!title) return '对'
  return title.charAt(0)
}

export const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export const useConversationList = (emit) => {
  const hoveredId = ref(null)
  const contextMenuVisible = ref(false)

  const handleSelect = (id) => {
    emit('selectChat', id)
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    hoveredId,
    contextMenuVisible,
    handleSelect
  }
}
```

### 8. 样式规范

#### 8.1 CSS 变量使用

```css
/* 使用项目定义的 CSS 变量 */
.my-component {
  background: var(--paper-新, #faf8f3);
  border: 1px solid var(--border-细, #e8e4dc);
  color: var(--ink-焦, #2c2c2c);
  font-family: var(--font-宋, 'Noto Serif SC', serif);
}

.my-component:hover {
  border-color: var(--accent-赭石, #a86b4a);
  box-shadow: var(--shadow-墨-浅, 0 2px 8px rgba(0, 0, 0, 0.08));
}
```

#### 8.2 scoped 样式与深度选择器

```vue
<style scoped>
/* 组件内样式 */
.container {
  padding: 20px;
}

/* 使用 :deep() 修改子组件内部样式 */
:deep(.el-switch__core) {
  border-color: #e8e4dc;
}

/* 使用 :global() 修改全局样式 */
:global(.el-message-box) {
  z-index: 99999 !important;
}
</style>
```

#### 8.3 外部样式文件

```vue
<style scoped src="./MyComponent.css"></style>
<!-- 或 -->
<style src="../AiChatView.css"></style>
```

### 9. Teleport 使用

```vue
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-dialog" @click.stop>
          <!-- 弹窗内容 -->
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const visible = ref(false)
const handleClose = () => {
  visible.value = false
}
</script>
```

### 10. Transition 过渡动画

```vue
<template>
  <!-- 内置过渡名称 -->
  <Transition name="fade">
    <div v-if="show" class="content">内容</div>
  </Transition>

  <!-- TransitionGroup -->
  <TransitionGroup name="list" tag="div" class="list-container">
    <div
      v-for="item in items"
      :key="item.id"
      class="list-item"
    >
      {{ item.name }}
    </div>
  </TransitionGroup>
</template>

<style scoped>
/* 淡入淡出 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 列表动画 */
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

## 项目结构

```
src/
├── components/              # 公共组件
│   ├── chat/               # 聊天相关组件
│   ├── settings/           # 设置相关组件
├── views/                  # 页面视图
│   └── chat/               # 聊天页面
│       ├── index.vue
│       └── components/     # 页面子组件
├── router/                 # 路由配置
│   └── index.js
├── App.vue                 # 根组件
└── main.js                 # 入口文件
```

## 开发注意事项

1. **Auto-Import 配置**: Vue API 和 Element Plus 组件已自动导入，无需手动 import
2. **手动导入内容**:
   - 第三方组件库: `vue-element-plus-x` 组件
   - 本地组件: 使用 `@/` 别名路径导入
   - Composables: 使用 `@/composables` 路径导入
   - Vue Router: `createRouter`, `createWebHistory`
3. **@ 别名**: 使用 `@/` 引用 src 目录，如 `import Component from '@/components/Component.vue'`
4. **Element Plus API**: `ElMessage`, `ElMessageBox` 等全局方法自动可用
5. **样式变量**: 使用项目定义的 CSS 变量保持风格一致
6. **SSE 连接**: 组件销毁时记得关闭连接
7. **代码风格**: 使用 Composition API + `<script setup>` 语法
