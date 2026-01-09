# 前后端 SSE 对接文档

## 概述

本文档描述了前端如何对接后端的 SSE (Server-Sent Events) 流式接口。

## 后端接口规范

### 端点
```
POST /api/chat/stream
```

### 请求参数
```javascript
{
  userQuery: string,           // 必填：用户消息
  sessionId?: string,          // 可选：会话ID
  mode?: string,               // 可选：聊天模式 (chat/markdown/html/ppt/report)
  additionalFeatures?: string[], // 可选：附加功能 (deep_thinking/deep_search)
  userPrompt?: string          // 可选：自定义提示词
}
```

### SSE 消息类型

| 类型 | code | 说明 | 数据结构 |
|------|------|------|----------|
| THINKING | thinking | 思考内容 | `{ type, content }` |
| TOOL_CALL_START | tool_call_start | 工具调用开始 | `{ type, id, name }` |
| TOOL_CALL_RESULT | tool_call_result | 工具调用结果 | `{ type, id, name, toolStatus, result }` |
| CONTENT_CHUNK | final_answer | 内容流式输出 | `{ type, content }` |
| COMPLETED | completed | 完成 | `{ type }` |
| ERROR | error | 错误 | `{ type, error }` |

## 前端实现

### 文件结构

```
src/
├── types/
│   └── sse.ts                    # SSE 类型定义 (TypeScript)
├── services/
│   ├── sseService.js             # SSE 服务 (JavaScript)
│   ├── messageAdapter.js         # 消息适配器
│   └── chatApi.ts                # 聊天 API (TypeScript)
└── views/
    └── chat/
        └── AiChatView.js         # 主视图 (已集成)
```

### 核心服务

#### 1. SSE 服务 (`sseService.js`)

负责建立和管理 SSE 连接，解析后端消息。

```javascript
import { sseChatService, SseMessageType } from '@/services/sseService.js'

// 建立连接
const cleanup = sseChatService.connect(request)

// 注册消息处理器
const unregister = sseChatService.onMessage((message) => {
  console.log('收到消息:', message)
})

// 断开连接
cleanup()
```

#### 2. 消息适配器 (`messageAdapter.js`)

将后端 SSE 消息转换为前端消息格式。

```javascript
import { messageAdapter, MessageUpdateType } from '@/services/messageAdapter.js'

// 创建新消息
messageAdapter.createNewAIMessage()

// 适配 SSE 消息
const { updateType, message } = messageAdapter.adaptSSEMessage(sseMessage)

// 根据更新类型处理
switch (updateType) {
  case MessageUpdateType.THINKING:
    // 处理思考内容
    break
  case MessageUpdateType.CONTENT:
    // 处理内容块
    break
  // ...其他类型
}
```

### 使用示例

```javascript
import { sseChatService, ChatMode } from '@/services/sseService.js'
import { messageAdapter } from '@/services/messageAdapter.js'

// 发送消息
async function sendMessage(userQuery) {
  const request = {
    userQuery,
    sessionId: currentSessionId,
    mode: ChatMode.CHAT,
    additionalFeatures: ['deep_thinking']
  }

  sseChatService.onMessage((sseMessage) => {
    const { updateType, message } = messageAdapter.adaptSSEMessage(sseMessage)

    // 更新 UI
    updateMessage(message)
  })

  sseChatService.connect(request)
}
```

## 配置

### 环境变量 (`.env.development` / `.env.production`)

**开发环境** (`.env.development`):
```env
# API 配置（通过 Vite 代理转发）
VITE_API_BASE_URL=/api
```

**生产环境** (`.env.production`):
```env
# API 配置（完整 URL，部署时需修改）
VITE_API_BASE_URL=http://localhost:20000
```

## 扩展性设计

### 1. 消息类型扩展

当后端添加新的消息类型时：

1. 在 `sseService.js` 中添加新的常量到 `SseMessageType`
2. 在 `messageAdapter.js` 中添加对应的处理方法
3. 在 UI 组件中添加对应的显示逻辑

### 2. 自定义处理器

```javascript
// 注册自定义消息处理器
const unregister = sseChatService.onMessage((message) => {
  if (message.type === 'custom_type') {
    // 自定义处理逻辑
  }
})
```

### 3. 错误处理

```javascript
sseChatService.onError((error) => {
  console.error('SSE 错误:', error)
  // 显示错误提示
})
```

## 注意事项

1. **连接管理**: 使用完毕后务必调用清理函数断开连接
2. **超时处理**: 默认超时时间为 5 分钟
3. **错误恢复**: 连接错误时会自动重置状态
4. **状态同步**: 使用 `messageAdapter` 确保消息状态一致

## 开发模式

### 启动前端
```bash
npm run dev
```

### 启动后端
确保后端服务运行在 `http://localhost:20000`

## 调试

### 查看 SSE 消息

打开浏览器控制台，可以看到：
- `[SSE] Connecting to:` - 连接 URL
- `[SSE] Connection opened` - 连接成功
- `[SSE] Message received:` - 收到消息
- `[SSE] Connection error:` - 连接错误

### 网络面板

在浏览器开发者工具的 Network 面板中，可以看到：
- EventStream 类型的请求
- 实时的消息流
