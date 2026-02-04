<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="43.75rem"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="9rem"
      class="mcp-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>

        <el-form-item label="服务器名称" prop="serverName">
          <el-input
            v-model="form.serverName"
            placeholder="如：filesystem"
            clearable
          />
        </el-form-item>

        <el-form-item label="服务器描述" prop="serverDesc">
          <el-input
            v-model="form.serverDesc"
            placeholder="描述该MCP服务器的用途（可选）"
            clearable
          />
        </el-form-item>

        <el-form-item label="连接协议类型" prop="connectionType">
          <el-radio-group v-model="form.connectionType">
            <el-radio value="STDIO">STDIO（标准输入输出）</el-radio>
            <el-radio value="SSE">SSE（服务器推送事件）</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- STDIO配置 -->
      <div v-if="form.connectionType === 'STDIO'" class="form-section">
        <div class="section-title">STDIO配置</div>

        <el-form-item label="命令" prop="command">
          <el-input
            v-model="form.command"
            placeholder="如：npx 或 python"
            clearable
          />
        </el-form-item>

        <el-form-item label="命令参数" prop="commandArgs">
          <el-input
            v-model="form.commandArgs"
            placeholder='JSON数组格式，如：["-y", "@server/filesystem", "/data"]'
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="环境变量" prop="commandEnv">
          <el-input
            v-model="form.commandEnv"
            placeholder='JSON对象格式，如：{"API_KEY": "xxx"}'
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </div>

      <!-- SSE配置 -->
      <div v-if="form.connectionType === 'SSE'" class="form-section">
        <div class="section-title">SSE配置</div>

        <el-form-item label="服务器URL" prop="serverUrl">
          <el-input
            v-model="form.serverUrl"
            placeholder="如：http://localhost:3000"
            clearable
          />
        </el-form-item>

        <el-form-item label="端点路径" prop="serverEndpoint">
          <el-input
            v-model="form.serverEndpoint"
            placeholder="如：/mcp/sse（可选）"
            clearable
          />
        </el-form-item>

        <el-form-item label="请求超时" prop="requestTimeout">
          <el-input-number
            v-model="form.requestTimeout"
            :min="1"
            :max="300"
            style="width: 100%"
          />
          <span style="margin-left: 0.5rem; color: var(--text-tertiary); font-size: 0.875rem;">
            秒
          </span>
        </el-form-item>
      </div>

      <!-- 其他设置 -->
      <div class="form-section">
        <div class="section-title">其他设置</div>

        <el-form-item label="是否启用" prop="enabled">
          <el-switch v-model="form.enabled" />
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
  connectionType: 'STDIO',
  command: '',
  commandArgs: '',
  commandEnv: '',
  serverUrl: '',
  serverEndpoint: '',
  requestTimeout: 30,
  enabled: true,
  remark: ''
})

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
  if (form.value.connectionType === 'STDIO') {
    baseRules.command = [
      { required: true, message: '请输入命令', trigger: 'blur' }
    ]
  }

  // SSE 必填项
  if (form.value.connectionType === 'SSE') {
    baseRules.serverUrl = [
      { required: true, message: '请输入服务器URL', trigger: 'blur' }
    ]
  }

  return baseRules
})

// 监听 props.formData 变化
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
    serverName: '',
    serverDesc: '',
    connectionType: 'STDIO',
    command: '',
    commandArgs: '',
    commandEnv: '',
    serverUrl: '',
    serverEndpoint: '',
    requestTimeout: 30,
    enabled: true,
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
.mcp-form {
  max-height: 37.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.mcp-form::-webkit-scrollbar {
  width: 0.375rem;
}

.mcp-form::-webkit-scrollbar-thumb {
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

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
