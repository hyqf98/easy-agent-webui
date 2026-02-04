<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="43.75rem"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="9rem"
      class="model-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>

        <el-form-item label="模型编码" prop="modelCode">
          <el-input
            v-model="form.modelCode"
            placeholder="如：gpt-4o"
            clearable
          />
        </el-form-item>

        <el-form-item label="模型名称" prop="modelName">
          <el-input
            v-model="form.modelName"
            placeholder="如：GPT-4o"
            clearable
          />
        </el-form-item>

        <el-form-item label="提供商类型" prop="providerType">
          <el-select
            v-model="form.providerType"
            placeholder="请选择提供商"
            style="width: 100%"
          >
            <el-option label="OpenAI" value="openai" />
            <el-option label="智谱AI" value="zhipuai" />
            <el-option label="Anthropic" value="anthropic" />
          </el-select>
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            placeholder="请输入API密钥"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="API基础URL" prop="baseUrl">
          <el-input
            v-model="form.baseUrl"
            placeholder="用于代理或自定义端点（可选）"
            clearable
          />
        </el-form-item>
      </div>

      <!-- 参数配置 -->
      <div class="form-section">
        <div class="section-title">参数配置</div>

        <el-form-item label="温度参数" prop="temperature">
          <div class="slider-wrapper">
            <el-slider
              v-model="form.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              :show-tooltip="true"
            />
            <span class="slider-value">{{ form.temperature }}</span>
          </div>
        </el-form-item>

        <el-form-item label="最大生成Token数" prop="maxTokens">
          <el-input-number
            v-model="form.maxTokens"
            :min="1"
            :max="100000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="最大上下文窗口" prop="maxContextWindow">
          <el-input-number
            v-model="form.maxContextWindow"
            :min="1"
            :max="1000000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Top-P采样" prop="topP">
          <div class="slider-wrapper">
            <el-slider
              v-model="form.topP"
              :min="0"
              :max="1"
              :step="0.05"
              :show-tooltip="true"
            />
            <span class="slider-value">{{ form.topP }}</span>
          </div>
        </el-form-item>

        <el-form-item label="Top-K采样" prop="topK">
          <el-input-number
            v-model="form.topK"
            :min="1"
            :max="1000"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <!-- 能力设置 -->
      <div class="form-section">
        <div class="section-title">能力设置</div>

        <el-form-item label="支持工具调用" prop="supportTools">
          <el-switch v-model="form.supportTools" />
        </el-form-item>

        <el-form-item label="支持视觉识别" prop="supportVision">
          <el-switch v-model="form.supportVision" />
        </el-form-item>
      </div>

      <!-- 其他设置 -->
      <div class="form-section">
        <div class="section-title">其他设置</div>

        <el-form-item label="是否启用" prop="enabled">
          <el-switch v-model="form.enabled" />
        </el-form-item>

        <el-form-item label="设为默认模型" prop="isDefault">
          <el-switch v-model="form.isDefault" />
        </el-form-item>

        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            :maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </span>
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

// 监听 props.formData 变化，回显数据
watch(() => props.formData, (newData) => {
  if (newData) {
    form.value = { ...newData }
  } else {
    resetForm()
  }
}, { immediate: true })

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

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

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
.model-form {
  max-height: 37.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.model-form::-webkit-scrollbar {
  width: 0.375rem;
}

.model-form::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 0.1875rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

:deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-color: var(--border-default);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--accent-primary);
}

:deep(.el-form-item__error) {
  color: var(--color-error);
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.slider-wrapper .el-slider {
  flex: 1;
}

.slider-value {
  min-width: 3rem;
  text-align: right;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
