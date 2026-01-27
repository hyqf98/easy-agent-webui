/**
 * SSE Mock 数据生成器
 *
 * @author haijun
 * @since 1.0.0
 */

// 消息类型枚举（与后端保持一致）
export const SseMessageType = {
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

/**
 * 判断是否使用 Mock 模式（通过 URL 判断）
 *
 * @param {string} url - 请求 URL
 * @returns {boolean}
 */
export function isMockUrl(url) {
  return url.includes('/mock/')
}

/**
 * 生成模拟的 SSE 流
 *
 * @param {Object} options - 配置选项
 * @param {number} options.delay - 每条消息的延迟时间（毫秒）
 * @param {Array<string>} options.types - 要生成的消息类型，默认生成所有类型
 * @returns {ReadableStream} SSE 流
 */
export function generateMockSSEStream(options = {}) {
  const {
    delay = 500,
    types = Object.values(SseMessageType)
  } = options

  // 定义所有消息生成器
  const messageGenerators = {
    [SseMessageType.THINKING]: () => ({
      type: SseMessageType.THINKING,
      content: '正在分析用户的需求，我需要从以下几个方面来思考...\n\n1. 理解用户的意图\n2. 确定需要使用哪些工具\n3. 制定执行计划\n4. 逐步执行并反馈结果'
    }),

    [SseMessageType.TOOL_THROUGH]: () => ({
      type: SseMessageType.TOOL_THROUGH,
      content: '根据当前情况，我需要调用搜索工具来获取相关信息。这将帮助我提供更准确的答案。'
    }),

    [SseMessageType.TOOL_CALL_START]: () => ({
      type: SseMessageType.TOOL_CALL_START,
      id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: ['SearchTool', 'Calculator', 'CodeExecutor', 'FileWriteTool'][Math.floor(Math.random() * 4)],
      toolStatus: 'pending'
    }),

    [SseMessageType.TOOL_CALL_RESULT]: () => ({
      type: SseMessageType.TOOL_CALL_RESULT,
      id: `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'SearchTool',
      toolStatus: Math.random() > 0.1 ? 'success' : 'error',
      result: JSON.stringify({
        query: '智能体平台',
        results: [
          { title: 'Easy Agent - 多智能体编排平台', description: '基于 Spring AI 的智能体平台' },
          { title: 'ReAct 架构详解', description: '推理-行动循环架构模式' }
        ],
        total: 2,
        executionTime: Math.floor(Math.random() * 1000) + 'ms'
      }, null, 2)
    }),

    [SseMessageType.CONTENT_CHUNK]: () => {
      const contents = [
        '# Easy Agent 智能体平台\n\n',
        'Easy Agent 是一个基于 **Spring AI** 的多智能体编排平台。',
        '\n\n## 核心特性\n\n',
        '- **多智能体协作** - 多个专业智能体协同工作\n',
        '- **ReAct 架构** - 思考-行动循环模式\n',
        '- **动态模型切换** - 支持多种大模型提供商\n',
        '- **SSE 流式响应** - 实时返回 AI 生成内容\n\n',
        '## 技术栈\n\n',
        '**后端**:\n',
        '- Spring Boot 3.4.3\n',
        '- Spring AI 1.1.1\n',
        '- Java 21\n\n',
        '**前端**:\n',
        '- Vue 3.5.24\n',
        '- Vite 7.2.4\n',
        '- Element Plus 2.13.0\n'
      ]
      return {
        type: SseMessageType.CONTENT_CHUNK,
        content: contents[Math.floor(Math.random() * contents.length)]
      }
    },

    [SseMessageType.AGENT_SWITCH]: () => ({
      type: SseMessageType.AGENT_SWITCH,
      agentId: ['planning', 'data_collect', 'content_gen', 'review'][Math.floor(Math.random() * 4)],
      agentName: ['规划助手', '数据采集助手', '内容生成助手', '审查助手'][Math.floor(Math.random() * 4)],
      description: '正在切换到专业助手处理当前任务...'
    }),

    [SseMessageType.PLAN_RESULT]: () => ({
      type: SseMessageType.PLAN_RESULT,
      content: JSON.stringify({
        steps: [
          { id: 1, task: '分析需求', status: 'completed', duration: '1.2s' },
          { id: 2, task: '制定计划', status: 'completed', duration: '0.8s' },
          { id: 3, task: '执行任务', status: 'in_progress', duration: '2.5s' },
          { id: 4, task: '验证结果', status: 'pending', estimated: '1.0s' },
          { id: 5, task: '输出总结', status: 'pending', estimated: '0.5s' }
        ],
        totalDuration: '4.5s'
      }, null, 2)
    }),

    [SseMessageType.FILE_CREATED]: () => ({
      type: SseMessageType.FILE_CREATED,
      filePath: `/src/components/${['ChatExample', 'DataPanel', 'AgentView'][Math.floor(Math.random() * 3)]}.vue`,
      fileType: 'vue',
      content: `已创建文件，包含完整的组件结构和样式定义。`
    }),

    [SseMessageType.REVIEW_RESULT]: () => ({
      type: SseMessageType.REVIEW_RESULT,
      content: JSON.stringify({
        overall: 'pass',
        summary: '代码审查通过，符合规范要求。',
        checks: [
          { item: '代码规范', status: 'pass', message: '符合项目编码规范' },
          { item: '性能检查', status: 'pass', message: '无明显性能问题' },
          { item: '安全检查', status: 'warning', message: '建议添加输入验证' },
          { item: '测试覆盖', status: 'pass', message: '单元测试覆盖率 85%' }
        ]
      }, null, 2)
    }),

    [SseMessageType.ERROR]: () => ({
      type: SseMessageType.ERROR,
      content: '处理请求时遇到错误：工具调用超时。请稍后重试。',
      errorCode: 'TIMEOUT',
      retryable: true
    }),

    [SseMessageType.COMPLETED]: () => ({
      type: SseMessageType.COMPLETED,
      content: '任务已完成',
      duration: Math.floor(Math.random() * 5000) + 1000 + 'ms'
    })
  }

  // 根据指定的类型生成消息列表
  const messages = []
  types.forEach(type => {
    if (messageGenerators[type]) {
      messages.push(messageGenerators[type]())
    }
  })

  // 确保 COMPLETED 消息在最后
  if (!messages.find(m => m.type === SseMessageType.COMPLETED)) {
    messages.push(messageGenerators[SseMessageType.COMPLETED]())
  }

  // 创建 ReadableStream
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      for (const message of messages) {
        // 添加延迟
        await new Promise(resolve => setTimeout(resolve, delay))

        // 格式化为 SSE 格式
        const sseMessage = `data: ${JSON.stringify(message)}\n\n`
        controller.enqueue(encoder.encode(sseMessage))

        console.log('[Mock SSE] 发送消息:', message.type)
      }

      controller.close()
      console.log('[Mock SSE] 流结束')
    }
  })
}

/**
 * 获取 Mock SSE 流
 *
 * @param {Object} request - 请求参数
 * @returns {Response} Mock 响应
 */
export function getMockSSEResponse(request) {
  console.log('[Mock] 使用 Mock SSE 模式', request)

  const stream = generateMockSSEStream({
    delay: 300,
    types: Object.values(SseMessageType)
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
