# 欢迎页面设计文档

**日期**: 2025-02-05
**状态**: 已批准
**作者**: Claude

---

## 一、需求概述

### 1.1 功能需求

设计一个新建会话时的欢迎页面，当用户点击"新对话"或打开网页且当前会话无消息时显示。

### 1.2 布局要求

- 标题："Easy Agent"
- 智能体平台说明文字
- 输入框（与对话时复用）
- 所有元素**水平垂直居中**显示
- **保留**顶部工具栏（侧边栏切换、模型选择器、会话标题）

### 1.3 动画效果

发送第一条消息后，输入框从屏幕中央**平滑过渡**到底部。

---

## 二、技术方案

### 2.1 实现方案

采用**方案 A - 条件渲染**：

- 通过判断当前会话是否有消息来动态切换布局模式
- 创建独立的 `WelcomeView` 组件
- 使用 Vue 的 `<Transition>` 组件实现平滑过渡
- CSS Flex 布局控制居中/底部位置

### 2.2 组件结构

```
src/views/chat/
├── index.vue              # 主入口（负责布局切换）
├── components/
│   ├── WelcomeView.vue    # 新增：欢迎页面组件
│   ├── MessageList.vue    # 现有：消息列表
│   └── InputArea.vue      # 现有：输入区域（复用）
└── chat.css               # 样式文件
```

### 2.3 状态判断

```javascript
const isWelcomeMode = computed(() => {
  return chatStore.sessionMessages.length === 0
})
```

---

## 三、组件设计

### 3.1 WelcomeView 组件

**职责**：
- 布局控制（Flex 居中）
- 内容展示（标题、说明、输入框插槽）
- 动画支持

**结构**：
```
WelcomeView.vue
├── welcome-wrapper (外层容器)
│   ├── welcome-title ("Easy Agent")
│   ├── welcome-description (平台说明)
│   └── slot (接收 InputArea)
```

### 3.2 布局切换结构

```vue
<template>
  <div class="chat-container">
    <SessionList />

    <div class="chat-main">
      <!-- 顶部工具栏 - 始终显示 -->
      <div class="chat-header">...</div>

      <!-- 欢迎模式 -->
      <div v-if="isWelcomeMode" class="welcome-mode">
        <WelcomeView>
          <InputArea />
        </WelcomeView>
      </div>

      <!-- 对话模式 -->
      <template v-else>
        <MessageList />
        <InputArea />
      </template>
    </div>
  </div>
</template>
```

---

## 四、数据流

### 4.1 输入框位置切换流程

```
用户发送消息
    ↓
InputArea 触发 handleSend
    ↓
chatStore.sendMessage()
    ↓
消息被添加到 messages 数组
    ↓
sessionMessages 计算属性更新
    ↓
isWelcomeMode 变为 false
    ↓
Vue v-if/v-else 切换视图
    ↓
Transition 动画执行（300ms）
    ↓
显示对话模式（MessageList + InputArea 在底部）
```

### 4.2 新会话切换

```
点击"新对话"
    ↓
chatStore.createSession()
    ↓
清空当前会话消息数组
    ↓
sessionMessages 变为空
    ↓
isWelcomeMode 重新变为 true
    ↓
切换回欢迎模式（反向动画）
```

---

## 五、动画设计

### 5.1 过渡效果

- **进入动画**：从下方淡入上移
- **离开动画**：向下淡出
- **过渡时长**：300ms
- **缓动函数**：ease-out

### 5.2 动画期间交互

- 动画执行期间禁用输入框和发送按钮
- 避免状态不一致

---

## 六、错误处理

### 6.1 边界情况

| 场景 | 处理方式 |
|------|----------|
| 没有选中模型 | 欢迎页面正常显示，发送时提示选择模型 |
| 会话列表为空 | 显示欢迎模式，临时会话已在 store 中创建 |
| 发送失败 | 保持在欢迎模式，显示错误提示 |
| 网络断开 | 同发送失败处理 |
| 快速连续发送 | 禁用发送按钮，防止重复提交 |

### 6.2 响应式适配

- 移动端：保持居中布局，适当缩小字体和间距
- 输入框最大宽度限制
- 高度自适应

---

## 七、实现步骤

### 7.1 开发任务

1. **创建 WelcomeView 组件**
   - 新建 `src/views/chat/components/WelcomeView.vue`
   - 实现居中布局、标题、说明文字
   - 添加 slot 接收 InputArea

2. **修改 chat/index.vue**
   - 添加 `isWelcomeMode` 计算属性
   - 使用 `v-if/v-else` 切换欢迎/对话模式
   - 添加 `<Transition>` 包装动画

3. **调整样式**
   - 在 `chat.css` 中添加欢迎模式样式
   - 添加 Transition 动画 CSS
   - 确保与现有设计风格一致

4. **测试验证**
   - 新建会话显示欢迎页面
   - 发送消息后切换到对话模式
   - 点击"新对话"返回欢迎模式
   - 响应式布局测试

### 7.2 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `WelcomeView.vue` | 新建 | 欢迎页面组件 |
| `chat/index.vue` | 修改 | 添加布局切换逻辑 |
| `chat.css` | 修改 | 添加欢迎模式和动画样式 |

---

## 八、设计原则确认

- ✓ 触发条件：会话无消息时显示欢迎模式
- ✓ 布局：标题 + 说明 + 输入框水平垂直居中
- ✓ 动画：发送消息后输入框平滑过渡到底部
- ✓ 组件复用：InputArea 在两种模式下复用
- ✓ 状态管理：基于现有 store，无需额外状态
- ✓ 保留顶部工具栏：确保界面一致性

---

## 九、后续优化

- 考虑添加快捷操作建议卡片（如"帮我写代码"、"分析数据"等）
- 支持自定义欢迎页面内容
- 添加品牌 Logo 展示
