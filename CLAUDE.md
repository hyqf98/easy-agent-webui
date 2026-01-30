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

## 项目结构规范

```
src/
├── components/              # 公共组件（全局复用）
│   ├── chat/               # 按功能模块分组
│   │   └── index.vue
│   └── settings/
│       └── index.vue
├── api/                     # API 接口定义
│   ├── chat.js             # 聊天模块接口
│   ├── provider.js         # 模型提供商接口
│   └── conversation.js     # 会话管理接口
├── views/                   # 页面视图
│   ├── chat/               # 模块文件夹
│   │   ├── index.vue       # 页面入口
│   │   ├── chat.js         # 模块业务逻辑
│   │   ├── chat.css        # 模块样式
│   │   └── components/     # 模块私有子组件
│   │       ├── MessageList.vue
│   │       └── InputBox.vue
│   └── settings/           # 其他模块
│       ├── index.vue
│       ├── settings.js
│       ├── settings.css
│       └── components/
├── router/                  # 路由配置
│   └── index.js
├── App.vue                 # 根组件
└── main.js                 # 入口文件
```

### 目录组织原则

1. **components/**: 放置可跨页面复用的公共组件，按功能分组
2. **api/**: 每个模块一个 `.js` 文件，命名格式 `模块名.js`
3. **views/**: 每个页面一个模块文件夹，包含：
   - `index.vue` - 页面入口组件
   - `模块名.js` - 页面业务逻辑（可选，复杂页面时使用）
   - `模块名.css` - 页面私有样式（可选）
   - `components/` - 页面私有子组件

## Auto-Import 自动导入

项目已配置自动导入，以下内容**无需手动导入**：

### Vue API（自动导入）
```javascript
// 以下内容无需 import，直接使用
ref, computed, reactive, watch, watchEffect, nextTick
onMounted, onUnmounted, onBeforeUnmount
useRouter, useRoute
defineProps, defineEmits, defineExpose
```

### Element Plus 组件（自动导入）
```javascript
// 以下组件无需 import，直接在模板使用
el-button, el-input, el-select, el-dialog
el-message, el-message-box, el-dropdown
// ... 所有 Element Plus 组件
```

### 需要手动导入的内容
```javascript
// 1. 第三方组件库
import { XMarkdown, Typewriter } from 'vue-element-plus-x'

// 2. Vue Router 核心方法
import { createRouter, createWebHistory } from 'vue-router'

// 3. 本地组件
import LocalComponent from '@/components/chat/index.vue'

// 4. API 接口
import { chatApi } from '@/api/chat.js'
```

## 代码编写规范

### 组件基本结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 1. 手动导入需要的内容（Vue API 无需导入）
import { XMarkdown } from 'vue-element-plus-x'
import { chatApi } from '@/api/chat.js'

// 2. Props/Emits
const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

// 3. 响应式数据（ref/computed 自动导入）
const loading = ref(false)

// 4. 生命周期（onMounted 自动导入）
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
/* 组件样式 */
</style>
```

### API 接口定义规范

```javascript
// src/api/chat.js
import axios from 'axios'

const BASE_URL = '/api'

export const chatApi = {
  // 发送消息
  sendMessage(data) {
    return axios.post(`${BASE_URL}/chat/send`, data)
  },

  // 获取历史记录
  getHistory(sessionId) {
    return axios.get(`${BASE_URL}/chat/history/${sessionId}`)
  },

  // SSE 流式响应
  streamChat(data, onMessage, onError) {
    return new EventSource(`${BASE_URL}/chat/stream?${new URLSearchParams(data)}`)
  }
}
```

### 模块业务逻辑分离

```javascript
// src/views/chat/chat.js
import { chatApi } from '@/api/chat.js'

export function useChat() {
  const messages = ref([])
  const loading = ref(false)

  const sendMessage = async (content) => {
    loading.value = true
    try {
      const response = await chatApi.sendMessage({ content })
      messages.value.push(response.data)
    } finally {
      loading.value = false
    }
  }

  return {
    messages,
    loading,
    sendMessage
  }
}

// 在 index.vue 中使用
<script setup>
import { useChat } from './chat.js'

const { messages, loading, sendMessage } = useChat()
</script>
```

## 样式规范

### CSS 变量使用

```css
/* 使用项目定义的 CSS 变量保持风格一致 */
.component {
  background: var(--paper-新, #faf8f3);
  border: 1px solid var(--border-细, #e8e4dc);
  color: var(--ink-焦, #2c2c2c);
  font-family: var(--font-宋, 'Noto Serif SC', serif);
}
```

### 深度选择器

```vue
<style scoped>
/* 修改子组件内部样式 */
:deep(.el-switch__core) {
  border-color: #e8e4dc;
}

/* 修改全局样式 */
:global(.el-message-box) {
  z-index: 99999 !important;
}
</style>
```

### 外部样式文件

```vue
<!-- 引用模块私有样式文件 -->
<style scoped src="./chat.css"></style>
```

## Vite 配置说明

```javascript
// vite.config.js
export default defineConfig({
  plugins: [
    vue(),
    // Vue API 自动导入
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
    port: 10000,
    proxy: {
      '/api': {
        target: 'http://localhost:20000',
        changeOrigin: true,
        ws: true  // 支持 SSE
      },
    },
  },
})
```

## 开发注意事项

1. **自动导入**: Vue API 和 Element Plus 组件无需手动 import
2. **目录结构**: 严格遵循 components/api/views 的组织规范
3. **API 定义**: 每个模块一个 `.js` 文件，统一放在 `api/` 目录
4. **模块文件**: views 下每个模块包含 `index.vue`、可选的 `.js`、`.css` 和 `components/`
5. **@ 别名**: 使用 `@/` 引用 src 目录
6. **SSE 连接**: 组件销毁时记得关闭连接
7. **代码风格**: 统一使用 Composition API + `<script setup>` 语法
