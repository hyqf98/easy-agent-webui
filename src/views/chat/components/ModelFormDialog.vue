<template>
  <el-dialog
    v-model="dialogVisible"
    width="50rem"
    :close-on-click-modal="false"
    class="model-form-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h3 class="dialog-title">{{ dialogTitle }}</h3>
          <p class="dialog-subtitle">配置AI模型的参数和访问信息</p>
        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="model-form"
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

        <div class="form-grid">
          <el-form-item label="模型编码" prop="modelCode">
            <el-input
              v-model="form.modelCode"
              placeholder="如: gpt-4o"
              clearable
            >
              <template #prefix>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                  <path d="M4 4H12M4 8H12M4 12H8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="模型名称" prop="modelName">
            <el-input
              v-model="form.modelName"
              placeholder="如: GPT-4o"
              clearable
            >
              <template #prefix>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                  <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2Z" stroke="currentColor" stroke-width="1.2"/>
                  <path d="M8 5V8L10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <el-form-item label="提供商" prop="providerType">
          <div class="provider-selector">
            <div
              v-for="provider in providerOptions"
              :key="provider.value"
              class="provider-card"
              :class="{ active: form.providerType === provider.value }"
              @click="form.providerType = provider.value"
            >
              <div class="provider-icon" :class="`provider-${provider.value}`">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L2 6L10 10L18 6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 14L10 18L18 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 10L10 14L18 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="provider-name">{{ provider.label }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            placeholder="sk-..."
            show-password
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M12 2C12.5523 2 13 2.44772 13 3V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V3C3 2.44772 3.44772 2 4 2H12Z" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="API基础URL（可选）" prop="baseUrl">
          <el-input
            v-model="form.baseUrl"
            placeholder="用于代理或自定义端点"
            clearable
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="input-icon">
                <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8C14 4.686 11.314 2 8 2Z" stroke="currentColor" stroke-width="1.2"/>
                <path d="M3 8H13" stroke="currentColor" stroke-width="1.2"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>
      </div>

      <!-- 参数配置 -->
      <div class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 3V5M9 13V15M3 9H5M13 9H15M5.3 5.3L6.7 6.7M11.3 11.3L12.7 12.7M5.3 12.7L6.7 11.3M11.3 6.7L12.7 5.3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="section-title">参数配置</span>
        </div>

        <el-form-item label="温度参数">
          <div class="slider-control">
            <el-slider
              v-model="form.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              :show-tooltip="false"
            />
            <div class="slider-value-display">
              <span class="value-badge">{{ form.temperature }}</span>
            </div>
          </div>
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="最大Token数" prop="maxTokens">
            <el-input-number
              v-model="form.maxTokens"
              :min="1"
              :max="1000000"
              :step="100"
              class="full-width"
            />
          </el-form-item>

          <el-form-item label="上下文窗口" prop="maxContextWindow">
            <el-input-number
              v-model="form.maxContextWindow"
              :min="1"
              :max="2000000"
              :step="1000"
              placeholder="可选"
              class="full-width"
            />
          </el-form-item>
        </div>

        <el-form-item label="Top-P采样">
          <div class="slider-control">
            <el-slider
              v-model="form.topP"
              :min="0"
              :max="1"
              :step="0.05"
              :show-tooltip="false"
            />
            <div class="slider-value-display">
              <span class="value-badge">{{ form.topP }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Top-K采样（可选）" prop="topK">
          <el-input-number
            v-model="form.topK"
            :min="1"
            :max="10000"
            placeholder="可选"
            class="full-width"
          />
        </el-form-item>
      </div>

      <!-- 能力设置 -->
      <div class="form-section">
        <div class="section-header">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3L11 6H15L12.5 9.5L14 14L9 11.5L4 14L5.5 9.5L3 6H7L9 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="section-title">能力设置</span>
        </div>

        <div class="switch-group">
          <div class="switch-item">
            <div class="switch-content">
              <div class="switch-label">工具调用</div>
              <div class="switch-desc">支持Function Calling功能</div>
            </div>
            <el-switch v-model="form.supportTools" size="large" />
          </div>

          <div class="switch-item">
            <div class="switch-content">
              <div class="switch-label">视觉识别</div>
              <div class="switch-desc">支持图像分析能力</div>
            </div>
            <el-switch v-model="form.supportVision" size="large" />
          </div>
        </div>
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
              <div class="switch-label">启用模型</div>
              <div class="switch-desc">是否在对话中显示此模型</div>
            </div>
            <el-switch v-model="form.enabled" size="large" />
          </div>

          <div class="switch-item">
            <div class="switch-content">
              <div class="switch-label">默认模型</div>
              <div class="switch-desc">设为新建对话的默认选择</div>
            </div>
            <el-switch v-model="form.isDefault" size="large" />
          </div>
        </div>

        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
            class="full-width"
          />
        </el-form-item>

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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { modelApi } from '@/api/model.js'

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
    default: 'add' // 'add' or 'edit'
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const providerOptions = [
  { label: 'OpenAI', value: 'openai' },
  { label: '智谱AI', value: 'zhipuai' },
  { label: 'Anthropic', value: 'anthropic' }
]

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => {
  return props.mode === 'add' ? '新增模型配置' : '编辑模型配置'
})

const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = ref({
  modelCode: '',
  modelName: '',
  providerType: '',
  apiKey: '',
  baseUrl: '',
  temperature: 0.7,
  maxTokens: 2000,
  maxContextWindow: null,
  topP: 1.0,
  topK: null,
  supportTools: true,
  supportVision: false,
  enabled: true,
  isDefault: false,
  sortOrder: 0,
  remark: ''
})

// 表单验证规则
const rules = {
  modelCode: [
    { required: true, message: '请输入模型编码', trigger: 'blur' }
  ],
  modelName: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  providerType: [
    { required: true, message: '请选择提供商类型', trigger: 'change' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ],
  supportTools: [
    { required: true, message: '请选择是否支持工具调用', trigger: 'change' }
  ],
  supportVision: [
    { required: true, message: '请选择是否支持视觉识别', trigger: 'change' }
  ],
  enabled: [
    { required: true, message: '请选择是否启用', trigger: 'change' }
  ],
  isDefault: [
    { required: true, message: '请选择是否为默认模型', trigger: 'change' }
  ]
}

// 重置表单
const resetForm = () => {
  form.value = {
    modelCode: '',
    modelName: '',
    providerType: '',
    apiKey: '',
    baseUrl: '',
    temperature: 0.7,
    maxTokens: 2000,
    maxContextWindow: null,
    topP: 1.0,
    topK: null,
    supportTools: true,
    supportVision: false,
    enabled: true,
    isDefault: false,
    sortOrder: 0,
    remark: ''
  }
  formRef.value?.clearValidate()
}

// 监听 props.formData 变化，回显数据
watch(() => props.formData, (newData) => {
  if (newData) {
    form.value = { ...newData }
    // 调试：打印回显的数据
    console.log('回显的表单数据:', form.value)
    console.log('回显的 maxTokens 值:', form.value.maxTokens, '类型:', typeof form.value.maxTokens)
  } else {
    resetForm()
  }
}, { immediate: true })

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    // 调试：打印提交的数据
    console.log('提交的表单数据:', form.value)
    console.log('maxTokens 值:', form.value.maxTokens, '类型:', typeof form.value.maxTokens)

    if (props.mode === 'add') {
      await modelApi.create(form.value)
      ElMessage.success('新增成功')
    } else {
      await modelApi.update(form.value)
      ElMessage.success('修改成功')
    }

    emit('submit')
  } catch (error) {
    if (error !== false) { // 表单验证失败时 error 为 false
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
.model-form {
  padding: 1.5rem;
  max-height: 36rem;
  overflow-y: auto;
}

.model-form::-webkit-scrollbar {
  width: 0.375rem;
}

.model-form::-webkit-scrollbar-thumb {
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

/* 表单网格 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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

/* 提供商选择器 */
.provider-selector {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.5rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* 隐藏滚动条但保持滚动功能 */
.provider-selector::-webkit-scrollbar {
  height: 4px;
}

.provider-selector::-webkit-scrollbar-track {
  background: var(--bg-hover);
  border-radius: var(--radius-full);
}

.provider-selector::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--radius-full);
}

.provider-selector::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

.provider-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: var(--bg-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
  flex-shrink: 0;
  min-width: 5rem;
}

.provider-card:hover {
  border-color: var(--border-strong);
  background: var(--bg-hover);
}

.provider-card.active {
  border-color: #7c9a6d;
  background: rgba(124, 154, 109, 0.12);
}

.provider-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: white;
}

.provider-icon.provider-openai {
  background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%);
}

.provider-icon.provider-zhipuai {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.provider-icon.provider-anthropic {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.provider-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.provider-card.active .provider-name {
  color: #7c9a6d;
}

/* 滑块控件 */
.slider-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  width: 100%;
  min-height: 3rem;
}

.slider-control :deep(.el-slider) {
  flex: 1;
  width: 100%;
}

:deep(.el-slider__runway) {
  height: 8px !important;
  background: var(--border-subtle);
  border-radius: var(--radius-full);
}

:deep(.el-slider__bar) {
  height: 8px !important;
  background: #7c9a6d;
  border-radius: var(--radius-full);
}

:deep(.el-slider__button-wrapper) {
  height: 20px;
  width: 20px;
  top: 50%;
  transform: translateY(-50%);
}

:deep(.el-slider__button) {
  width: 18px;
  height: 18px;
  border: 3px solid #7c9a6d;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider-value-display {
  flex-shrink: 0;
  min-width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.value-badge {
  display: inline-block;
  min-width: 2.5rem;
  padding: 0.375rem 0.625rem;
  background: #7c9a6d;
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: center;
  border-radius: var(--radius-md);
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
