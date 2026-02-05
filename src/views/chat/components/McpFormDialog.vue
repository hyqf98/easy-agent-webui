<template>
  <el-dialog
    v-model="dialogVisible"
    width="50rem"
    :close-on-click-modal="false"
    class="mcp-form-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M3 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h3 class="dialog-title">{{ dialogTitle }}</h3>
          <p class="dialog-subtitle">配置MCP服务器的连接信息</p>
        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="mcp-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 5V9L12 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="section-title">基本信息</span>
        </div>

        <el-form-item label="服务器名称" prop="serverName">
          <el-input
            v-model="form.serverName"
            placeholder="如: filesystem"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2Z" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="服务器描述" prop="serverDesc">
          <el-input
            v-model="form.serverDesc"
            placeholder="描述该MCP服务器的用途（可选）"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M4 4H12M4 8H12M4 12H8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="连接协议类型" prop="connectionType">
          <div class="connection-selector">
            <div
              v-for="type in connectionTypes"
              :key="type.value"
              class="connection-card"
              :class="{ active: form.connectionType === type.value }"
              @click="form.connectionType = type.value"
            >
              <div class="connection-icon" :class="`conn-${type.value.toLowerCase()}`">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L2 6L10 10L18 6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 14L10 18L18 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 10L10 14L18 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="connection-info">
                <span class="connection-name">{{ type.label }}</span>
                <span class="connection-desc">{{ type.desc }}</span>
              </div>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- STDIO配置 -->
      <div v-if="form.connectionType === 'stdio'" class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9H15M3 5H15M3 13H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="section-title">STDIO配置</span>
        </div>

        <el-form-item label="命令" prop="command">
          <el-input
            v-model="form.command"
            placeholder="如: npx 或 python"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="命令参数" prop="commandArgs">
          <el-input
            v-model="form.commandArgs"
            placeholder='JSON数组格式，如: ["-y", "@server/filesystem", "/data"]'
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="环境变量" prop="commandEnv">
          <div class="env-vars-container">
            <div
              v-for="(env, index) in envVarsList"
              :key="index"
              class="env-var-row"
            >
              <el-input
                v-model="env.key"
                placeholder="变量名"
                class="env-key-input"
              />
              <span class="env-separator">=</span>
              <el-input
                v-model="env.value"
                placeholder="变量值"
                class="env-value-input"
              />
              <el-button
                v-if="envVarsList.length > 1"
                link
                type="danger"
                @click="removeEnvVar(index)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </el-button>
            </div>
            <el-button
              link
              type="primary"
              class="add-env-btn"
              @click="addEnvVar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              添加环境变量
            </el-button>
          </div>
        </el-form-item>
      </div>

      <!-- SSE配置 -->
      <div v-if="form.connectionType === 'sse'" class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 3V9L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="section-title">SSE配置</span>
        </div>

        <el-form-item label="服务器URL" prop="serverUrl">
          <el-input
            v-model="form.serverUrl"
            placeholder="如: http://localhost:3000"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 2C11.314 2 14 4.686 14 8C14 11.314 11.314 14 8 14" stroke="currentColor" stroke-width="1.2"/>
                <path d="M3 8H13" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="端点路径" prop="serverEndpoint">
          <el-input
            v-model="form.serverEndpoint"
            placeholder="如: /mcp/sse（可选）"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M8 2L8 14M8 2L4 6M8 2L12 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="请求超时" prop="requestTimeout">
          <el-input-number
            v-model="form.requestTimeout"
            :min="1"
            :max="300"
            class="full-width"
          />
          <span class="input-hint">秒</span>
        </el-form-item>
      </div>

      <!-- HTTP_STREAM配置 -->
      <div v-if="form.connectionType === 'http_stream'" class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 3V9L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="section-title">HTTP Stream配置</span>
        </div>

        <el-form-item label="服务器URL" prop="serverUrl">
          <el-input
            v-model="form.serverUrl"
            placeholder="如: http://localhost:3000"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 2C11.314 2 14 4.686 14 8C14 11.314 11.314 14 8 14" stroke="currentColor" stroke-width="1.2"/>
                <path d="M3 8H13" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="请求超时" prop="requestTimeout">
          <el-input-number
            v-model="form.requestTimeout"
            :min="1"
            :max="300"
            class="full-width"
          />
          <span class="input-hint">秒</span>
        </el-form-item>
      </div>

      <!-- 其他设置 -->
      <div class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 5V9L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="section-title">其他设置</span>
        </div>

        <div class="switch-group">
          <div class="switch-item">
            <div class="switch-content">
              <div class="switch-label">启用服务</div>
              <div class="switch-desc">是否启用此MCP服务器</div>
            </div>
            <el-switch v-model="form.enabled" size="large" />
          </div>
        </div>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-word-limit
            placeholder="添加备注信息..."
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button size="large" @click="handleClose">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          取消
        </el-button>
        <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 6.5L10.5 9.5L8 7M2.5 8L5.5 5L8 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ submitting ? '保存中...' : '保存配置' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { mcpApi } from '@/api/mcp.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add'
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const connectionTypes = [
  { label: 'STDIO', value: 'stdio', desc: '标准输入输出' },
  { label: 'SSE', value: 'sse', desc: '服务器推送事件' },
  { label: 'HTTP_STREAM', value: 'http_stream', desc: 'HTTP流式传输' }
]

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增MCP配置' : '编辑MCP配置'
})

const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = ref({
  serverName: '',
  serverDesc: '',
  connectionType: 'stdio',
  command: '',
  commandArgs: '',
  commandEnv: '',
  serverUrl: '',
  serverEndpoint: '',
  requestTimeout: 30,
  enabled: true,
  remark: ''
})

// 环境变量列表
const envVarsList = ref([{ key: '', value: '' }])

// 表单验证规则
const rules = computed(() => {
  const baseRules = {
    serverName: [
      { required: true, message: '请输入服务器名称', trigger: 'blur' }
    ],
    connectionType: [
      { required: true, message: '请选择连接协议类型', trigger: 'change' }
    ],
    enabled: [
      { required: true, message: '请选择是否启用', trigger: 'change' }
    ]
  }

  // STDIO 必填项
  if (form.value.connectionType === 'stdio') {
    baseRules.command = [
      { required: true, message: '请输入命令', trigger: 'blur' }
    ]
  }

  // SSE 必填项
  if (form.value.connectionType === 'sse') {
    baseRules.serverUrl = [
      { required: true, message: '请输入服务器URL', trigger: 'blur' }
    ]
  }

  // HTTP_STREAM 必填项
  if (form.value.connectionType === 'http_stream') {
    baseRules.serverUrl = [
      { required: true, message: '请输入服务器URL', trigger: 'blur' }
    ]
  }

  return baseRules
})

// 重置表单
const resetForm = () => {
  form.value = {
    serverName: '',
    serverDesc: '',
    connectionType: 'stdio',
    command: '',
    commandArgs: '',
    commandEnv: '',
    serverUrl: '',
    serverEndpoint: '',
    requestTimeout: 30,
    enabled: true,
    remark: ''
  }
  envVarsList.value = [{ key: '', value: '' }]
  formRef.value?.clearValidate()
}

// 监听对话框打开状态
watch(dialogVisible, (visible) => {
  if (visible && props.formData) {
    nextTick(() => {
      // 合并数据，确保所有字段都有值
      form.value = {
        serverName: props.formData.serverName || '',
        serverDesc: props.formData.serverDesc || '',
        connectionType: props.formData.connectionType || 'stdio',
        command: props.formData.command || '',
        commandArgs: props.formData.commandArgs || '',
        commandEnv: props.formData.commandEnv || '',
        serverUrl: props.formData.serverUrl || '',
        serverEndpoint: props.formData.serverEndpoint || '',
        requestTimeout: props.formData.requestTimeout || 30,
        enabled: props.formData.enabled !== undefined ? props.formData.enabled : true,
        remark: props.formData.remark || '',
        id: props.formData.id
      }
      parseEnvVars(props.formData.commandEnv)
    })
  }
})

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 添加环境变量
const addEnvVar = () => {
  envVarsList.value.push({ key: '', value: '' })
}

// 删除环境变量
const removeEnvVar = (index) => {
  if (envVarsList.value.length > 1) {
    envVarsList.value.splice(index, 1)
  }
}

// 将环境变量列表转换为JSON字符串
const serializeEnvVars = () => {
  const validEnvs = envVarsList.value.filter(env => env.key && env.value)
  if (validEnvs.length === 0) {
    return ''
  }
  return JSON.stringify(
    Object.fromEntries(validEnvs.map(env => [env.key, env.value]))
  )
}

// 将JSON字符串解析为环境变量列表
const parseEnvVars = (envJson) => {
  if (!envJson) {
    envVarsList.value = [{ key: '', value: '' }]
    return
  }
  try {
    const envObj = JSON.parse(envJson)
    const entries = Object.entries(envObj)
    envVarsList.value = entries.length > 0
      ? entries.map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  } catch {
    envVarsList.value = [{ key: '', value: '' }]
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    // 将环境变量列表转换为JSON字符串
    form.value.commandEnv = serializeEnvVars()

    submitting.value = true

    if (props.mode === 'add') {
      await mcpApi.create(form.value)
      ElMessage.success('新增成功')
    } else {
      await mcpApi.update(form.value)
      ElMessage.success('修改成功')
    }

    emit('submit')
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败: ' + error.message)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 弹框头部 */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #7c9a6d 0%, #95b087 100%);
  border-bottom: 1px solid var(--border-subtle);
}

.header-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: var(--radius-lg);
}

.header-text {
  flex: 1;
}

.dialog-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}

.dialog-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.85);
}

/* 表单容器 */
.mcp-form {
  padding: 1.5rem;
  max-height: 36rem;
  overflow-y: auto;
}

.mcp-form::-webkit-scrollbar {
  width: 0.375rem;
}

.mcp-form::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

/* 表单区块 */
.form-section {
  margin-bottom: 1.5rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #7c9a6d;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 表单项 */
:deep(.el-form-item) {
  margin-bottom: 1rem;
}

:deep(.el-form-item__label) {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.input-icon {
  color: var(--text-tertiary);
}

.input-hint {
  margin-left: 0.5rem;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--border-default) inset;
  padding: 0.5rem 0.75rem;
  transition: var(--transition-base);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--border-strong) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #7c9a6d inset;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: var(--radius-md);
}

.full-width {
  width: 100%;
}

/* 连接类型选择器 */
.connection-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.connection-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.connection-card:hover {
  border-color: var(--border-strong);
  background: var(--bg-hover);
}

.connection-card.active {
  border-color: #7c9a6d;
  background: rgba(124, 154, 109, 0.12);
}

.connection-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
  flex-shrink: 0;
}

.connection-icon.conn-stdio {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.connection-icon.conn-sse {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.connection-icon.conn-http_stream {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.connection-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.connection-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.connection-card.active .connection-name {
  color: #7c9a6d;
}

/* 环境变量输入 */
.env-vars-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.env-var-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.env-key-input {
  flex: 1;
  min-width: 8rem;
}

.env-value-input {
  flex: 2;
}

.env-separator {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  font-weight: 500;
}

.add-env-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  width: fit-content;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.add-env-btn:hover {
  border-color: #7c9a6d;
  color: #7c9a6d;
  background: rgba(124, 154, 109, 0.05);
}

/* 开关组 */
.switch-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.switch-item:hover {
  border-color: var(--border-strong);
}

.switch-content {
  flex: 1;
}

.switch-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.switch-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

:deep(.el-switch) {
  --el-switch-on-color: #7c9a6d;
}

:deep(.el-switch__core) {
  border-radius: var(--radius-full);
  height: 1.25rem;
  min-width: 2.5rem;
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}

:deep(.el-button) {
  border-radius: var(--radius-lg);
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border-color: var(--border-default);
  color: var(--text-secondary);
}

:deep(.el-button:hover) {
  border-color: var(--border-strong);
  color: var(--text-primary);
}

:deep(.el-button--primary) {
  background: #7c9a6d;
  border-color: #6a8549;
  color: white;
}

:deep(.el-button--primary:hover) {
  background: #6a8549;
  border-color: #5d7440;
}

:deep(.el-button svg) {
  margin-right: 0.375rem;
}
</style>

<style>
/* 弹框居中修复 - 保持不变 */
.el-overlay-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-overlay-dialog .el-dialog {
  margin: 0 !important;
}
</style>
