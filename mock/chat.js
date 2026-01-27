/**
 * Chat Mock 服务
 *
 * @author haijun
 * @since 1.0.0
 */

import pkg from 'mockjs'
const { Random } = pkg

// 消息类型枚举
const MessageTypes = {
  THINKING: 'thinking',
  TOOL_THROUGH: 'tool_through',
  TOOL_CALL_START: 'tool_call_start',
  TOOL_CALL_RESULT: 'tool_call_result',
  CONTENT_CHUNK: 'content_chunk',
  COMPLETED: 'completed',
  ERROR: 'error',
  PLAN_RESULT: 'plan_result',
  FILE_CREATED: 'file_created',
  AGENT_SWITCH: 'agent_switch',
  REVIEW_RESULT: 'review_result'
}

// 工具状态枚举
const ToolStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
}

/**
 * 生成模拟的 SSE 消息流
 */
function generateMockSSEStream() {
  const messages = []

  // 1. 思考消息
  messages.push({
    type: MessageTypes.THINKING,
    content: '用户想要了解智能体平台的工作原理，我需要从架构、功能和使用方式三个方面进行解释...'
  })

  // 2. 工具思考
  messages.push({
    type: MessageTypes.TOOL_THROUGH,
    content: '我需要调用查询工具来获取最新的项目信息...'
  })

  // 3. 工具调用开始
  messages.push({
    type: MessageTypes.TOOL_CALL_START,
    id: 'tool_' + Random.guid(),
    name: 'SearchTool',
    toolStatus: ToolStatus.PENDING,
    result: null
  })

  // 4. 工具调用结果
  messages.push({
    type: MessageTypes.TOOL_CALL_RESULT,
    id: 'tool_' + Random.guid(),
    name: 'SearchTool',
    toolStatus: ToolStatus.SUCCESS,
    result: JSON.stringify({
      query: '智能体平台架构',
      results: [
        { title: 'Easy Agent - 多智能体编排平台', url: 'https://example.com' },
        { title: 'ReAct 架构详解', url: 'https://example.com' }
      ],
      total: 2
    }, null, 2)
  })

  // 5. 智能体切换
  messages.push({
    type: MessageTypes.AGENT_SWITCH,
    content: '正在切换到「代码生成助手」...',
    agentId: 'code_gen',
    agentName: 'CodeGenAssistant'
  })

  // 6. 规划结果
  messages.push({
    type: MessageTypes.PLAN_RESULT,
    content: JSON.stringify({
      steps: [
        { id: 1, task: '分析用户需求', status: 'completed' },
        { id: 2, task: '设计系统架构', status: 'in_progress' },
        { id: 3, task: '实现核心功能', status: 'pending' },
        { id: 4, task: '测试和优化', status: 'pending' }
      ]
    }, null, 2)
  })

  // 7. 流式内容输出
  const contentChunks = [
    '# Easy Agent 智能体平台\n\n',
    'Easy Agent 是一个基于 **Spring AI** 的多智能体编排平台，采用 ReAct (Reasoning + Acting) 架构实现智能体协作。\n\n',
    '## 核心特性\n\n',
    '- **多智能体协作**: 多个专业智能体协同工作\n',
    '- **ReAct 架构**: 思考-行动循环\n',
    '- **动态模型切换**: 支持多种大模型提供商\n',
    '- **SSE 流式响应**: 实时返回 AI 生成内容\n\n',
    '## 技术栈\n\n',
    '```javascript\n',
    '// 后端\n',
    'Spring Boot 3.4.3\n',
    'Spring AI 1.1.1\n',
    'Java 21\n\n',
    '// 前端\n',
    'Vue 3.5.24\n',
    'Vite 7.2.4\n',
    'Element Plus 2.13.0\n',
    '```\n'
  ]

  contentChunks.forEach((chunk, index) => {
    messages.push({
      type: MessageTypes.CONTENT_CHUNK,
      content: chunk
    })
  })

  // 8. 文件创建
  messages.push({
    type: MessageTypes.FILE_CREATED,
    content: '已创建文件 `src/components/ChatExample.vue`',
    filePath: '/src/components/ChatExample.vue',
    fileType: 'vue'
  })

  // 9. 审查结果
  messages.push({
    type: MessageTypes.REVIEW_RESULT,
    content: JSON.stringify({
      overall: '通过',
      checks: [
        { item: '代码规范', status: 'pass' },
        { item: '性能检查', status: 'pass' },
        { item: '安全检查', status: 'warning', message: '建议添加输入验证' }
      ]
    }, null, 2)
  })

  // 10. 完成
  messages.push({
    type: MessageTypes.COMPLETED,
    content: '响应完成'
  })

  return messages
}

/**
 * 聊天接口 Mock
 */
export default [
  // 聊天流式接口
  {
    url: '/api/chat/stream',
    method: 'post',
    response: async ({ body }) => {
      const { content, sessionId } = body

      console.log('[Mock] 收到聊天请求:', { content, sessionId })

      // 生成模拟消息流
      const messages = generateMockSSEStream()

      // 返回 SSE 流格式的响应
      // 注意：这里返回普通响应，实际 SSE 流需要在前端处理
      return {
        code: 200,
        message: 'success',
        data: {
          sessionId: sessionId || 'mock_session_' + Date.now(),
          messages: messages
        }
      }
    }
  },

  // 获取会话历史
  {
    url: '/api/chat/history',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: {
          sessions: [
            {
              id: 'session_1',
              title: '智能对话助手',
              icon: '助',
              updateTime: Date.now(),
              messageCount: 5
            },
            {
              id: 'session_2',
              title: '代码生成专家',
              icon: '代',
              updateTime: Date.now() - 600000,
              messageCount: 12
            },
            {
              id: 'session_3',
              title: '数据分析助手',
              icon: '数',
              updateTime: Date.now() - 3600000,
              messageCount: 8
            }
          ]
        }
      }
    }
  },

  // 获取会话详情
  {
    url: '/api/chat/session/:id',
    method: 'get',
    response: ({ query }) => {
      const { id } = query
      return {
        code: 200,
        message: 'success',
        data: {
          sessionId: id,
          messages: [
            { id: 1, type: 'user', content: '你好，请介绍一下这个平台', time: Date.now() - 300000 },
            { id: 2, type: 'thinking', content: '用户想要了解平台信息...', time: Date.now() - 299000 },
            { id: 3, type: 'normal', content: '欢迎使用 Easy Agent 智能体平台！', time: Date.now() - 298000 }
          ]
        }
      }
    }
  }
]
