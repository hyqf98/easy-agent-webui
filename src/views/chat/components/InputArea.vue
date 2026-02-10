<template>
  <div class="input-area">
    <div class="input-container">
      <!-- 文件列表显示区域（放在工具栏上方） -->
      <Transition name="file-list">
        <div v-if="uploadedFiles.length > 0" class="file-list-container">
          <div
            v-for="(file, index) in uploadedFiles"
            :key="index"
            class="file-item"
            :class="{ 'is-image': file.isImage, 'uploading': file.uploading, 'error': file.uploadError }"
            :title="file.name + (file.uploading ? ' (上传中...)' : '')"
            @mouseenter="handleFileMouseEnter(file, $event)"
            @mouseleave="handleFileMouseLeave"
          >
            <!-- 删除按钮 -->
            <button class="file-remove-btn" @click="removeFile(index)">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- 图片缩略图 -->
            <div v-if="file.isImage" class="file-thumbnail">
              <img :src="file.preview || getFileUrl(file.relativePath)" :alt="file.name" />
            </div>

            <!-- 文件图标 -->
            <div v-else class="file-icon">
              <svg v-if="file.type === 'pdf'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V7L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V7H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 15L10 9H11L12 15H13L14 9H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="file.type === 'word'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V7L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V7H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 12H16M8 16H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="file.type === 'excel'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V7L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V7H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 9H16M8 13H16M8 17H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <svg v-else-if="file.type === 'archive'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 8C21 7.44772 20.5523 7 20 7H4C3.44772 7 3 7.44772 3 8V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15V12M12 12L9.5 14.5M12 12L14.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 7V4H8V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2H6C5.44772 2 5 2.44772 5 3V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V7L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13 2V7H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- 上传状态遮罩 -->
            <div v-if="file.uploading || file.uploadError" class="file-status-overlay">
              <svg v-if="file.uploading" width="16" height="16" viewBox="0 0 24 24" fill="none" class="spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.3"/>
                <path d="M12 2C17.5228 2 22 6.47715 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 图片预览浮层 -->
      <Teleport to="body">
        <Transition name="preview-fade">
          <div
            v-if="hoveredFile && hoveredFile.preview"
            class="image-preview-popup"
            :style="{
              left: previewPosition.x + 'px',
              top: previewPosition.y + 'px'
            }"
            @mouseenter="handlePreviewMouseEnter"
            @mouseleave="handleFileMouseLeave"
          >
            <img :src="hoveredFile.preview" :alt="hoveredFile.name" />
            <div class="preview-filename">{{ hoveredFile.name }}</div>
          </div>
        </Transition>
      </Teleport>

      <!-- 工具栏区域 -->
      <div class="toolbar-row">
        <!-- 文件上传按钮 -->
        <div class="file-upload-btn" @click="handleFileUpload">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M8 8L4 4M8 8L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <!-- 隐藏的文件输入 -->
        <input type="file" ref="fileInputRef" @change="handleFileChange" style="display: none" multiple>

        <!-- 工具选择器 -->
        <div class="tool-selector-wrapper" v-click-outside="closeToolSelector">
          <!-- 折叠按钮 -->
          <div
            class="tool-selector-btn"
            @mousedown.prevent
            @click="toggleToolSelector"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8.5 2.5C8.5 2.22386 8.27614 2 8 2C7.72386 2 7.5 2.22386 7.5 2.5V7.5H2.5C2.22386 7.5 2 7.72386 2 8C2 8.27614 2.22386 8.5 2.5 8.5H7.5V13.5C7.5 13.7761 7.72386 14 8 14C8.27614 14 8.5 13.7761 8.5 13.5V8.5H13.5C13.7761 8.5 14 8.27614 14 8C14 7.72386 13.7761 7.5 13.5 7.5H8.5V2.5Z" fill="currentColor"/>
              <circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/>
              <circle cx="10.5" cy="5.5" r="1.5" fill="currentColor"/>
              <circle cx="5.5" cy="10.5" r="1.5" fill="currentColor"/>
              <circle cx="10.5" cy="10.5" r="1.5" fill="currentColor"/>
            </svg>
            <span>工具</span>
            <span v-if="selectedToolsCount > 0" class="tool-badge">{{ selectedToolsCount }}</span>
          </div>

          <!-- 展开面板 -->
          <Transition name="tool-panel">
            <div v-if="toolSelectorOpen" class="tool-selector-panel">
              <!-- 加载中 -->
              <div v-if="mcpLoading" class="loading-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="spin">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.3"/>
                  <path d="M12 2C17.5228 2 22 6.47715 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>加载中...</span>
              </div>

              <!-- 错误状态 -->
              <div v-else-if="mcpError" class="error-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="error-text">加载失败</span>
                <button class="retry-btn" @click.stop="loadMcpConfigs">重试</button>
              </div>

              <!-- 空状态 -->
              <div v-else-if="mcpConfigs.length === 0" class="empty-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9.5 10C9.5 10 10.5 11 12 11C13.5 11 14.5 10 14.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="9" cy="7" r="1" fill="currentColor"/>
                  <circle cx="15" cy="7" r="1" fill="currentColor"/>
                  <path d="M21 15C21 18.866 17.4183 22 12 22C6.58172 22 3 18.866 3 15" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 13C3 13 4.5 15 7.5 15C10.5 15 12 13 12 13C12 13 13.5 15 16.5 15C19.5 15 21 13 21 13" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span class="empty-text">暂无可用工具</span>
                <span class="empty-hint">请联系管理员配置 MCP 服务</span>
              </div>

              <!-- 工具列表 -->
              <div v-else class="tool-list">
                <div
                  v-for="config in mcpConfigs"
                  :key="config.id"
                  class="tool-item"
                  :class="{ selected: selectedToolIds.includes(config.id) }"
                  @mousedown.prevent
                  @click="toggleTool(config.id)"
                >
                  <input
                    type="checkbox"
                    :checked="selectedToolIds.includes(config.id)"
                    @click.stop
                    readonly
                  />
                  <span class="tool-name">{{ config.serverName }}</span>
                  <span v-if="config.serverDesc" class="tool-desc" :title="config.serverDesc">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M8 5V8H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 聊天模式选择按钮 -->
        <div v-if="canChangeChatMode" class="chat-mode-selector" v-click-outside="closeChatModeSelector">
          <div
            class="chat-mode-btn"
            @mousedown.prevent
            @click="toggleChatModeSelector"
          >
            <span class="mode-icon">{{ currentChatModeOption?.icon || '💬' }}</span>
            <span>{{ currentChatModeOption?.label || '智能问答' }}</span>
          </div>

          <Transition name="mode-panel">
            <div v-if="chatModeSelectorOpen" class="chat-mode-panel">
              <div
                v-for="mode in chatModeOptions"
                :key="mode.value"
                class="mode-item"
                :class="{ active: chatMode === mode.value }"
                @mousedown.prevent
                @click="selectChatMode(mode.value)"
              >
                <span class="mode-icon">{{ mode.icon }}</span>
                <span>{{ mode.label }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-wrapper" :class="{ focused: isFocused }">
        <!-- 输入框和按钮的包装器 -->
        <div class="input-row">
          <textarea
            ref="textareaRef"
            v-model="inputContent"
            class="message-input"
            placeholder="输入消息..."
            rows="1"
            @input="handleInput"
            @keydown="handleKeydown"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />

          <!-- 右侧按钮组 -->
          <div class="input-actions">
            <!-- 取消按钮（发送中显示） -->
            <button
              v-if="isSending"
              class="action-btn cancel-btn"
              @click="handleCancel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- 发送按钮 -->
            <button
              v-else
              class="action-btn send-btn"
              :class="{ disabled: !canSend }"
              :disabled="!canSend"
              @click="handleSend"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 8H13.5M13.5 8L9 3.5M13.5 8L9 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="input-hint">
        <span class="hint-text">按 Enter 发送，Shift + Enter 换行</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, nextTick, onUnmounted, ref, toRefs, watch} from 'vue'
import {useChatStore} from '@/stores/chat'
import {chatApi} from '@/api/chat'

const chatStore = useChatStore()

const textareaRef = ref(null)
const fileInputRef = ref(null)
const inputContent = ref('')
const isSending = ref(false)
const isFocused = ref(false)

// 工具选择器相关状态
const toolSelectorOpen = ref(false)

// 聊天模式选择器相关状态
const chatModeSelectorOpen = ref(false)

// 文件上传相关状态
const uploadedFiles = ref([])

// 图片预览状态
const hoveredFile = ref(null)
const previewPosition = ref({ x: 0, y: 0 })

// 文件类型映射配置
const FILE_TYPE_MAP = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  pdf: ['pdf'],
  word: ['doc', 'docx', 'txt', 'md'],
  excel: ['xls', 'xlsx', 'csv'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz']
}

// 文件类型判断
const getFileType = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.includes(ext)) return type
  }
  return 'file'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 从 store 解构 MCP 相关状态（使用 toRefs 保持响应性）
const { mcpConfigs, selectedToolIds, mcpLoading, mcpError, selectedToolsCount, chatMode, chatModeOptions, canChangeChatMode } = toRefs(chatStore)

const canSend = computed(() => {
  return inputContent.value.trim().length > 0 && !isSending.value
})

// 当前选中的聊天模式选项
const currentChatModeOption = computed(() => {
  return chatModeOptions.value.find(m => m.value === chatMode.value)
})

// 处理输入 - 自动调整高度
const handleInput = () => {
  autoResize()
}

// 自动调整文本框高度
const autoResize = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    if (!textarea) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const lineHeight = 1.5 * parseFloat(getComputedStyle(textarea).fontSize)

    const minHeight = 2.25
    const maxHeight = 9.75

    if (scrollHeight <= lineHeight * 6) {
      textarea.style.height = `${Math.max(minHeight, scrollHeight / 16)}rem`
    } else {
      textarea.style.height = `${maxHeight}rem`
    }
  })
}

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 发送消息
const handleSend = () => {
  if (!canSend.value) return

  const message = inputContent.value.trim()
  inputContent.value = ''
  isSending.value = true

  nextTick(() => {
    autoResize()
  })

  // 从 store 获取选中的工具 ID
  const toolIds = chatStore.selectedToolIds

  // 获取已上传文件的相对路径列表
  const uploadedFilePaths = uploadedFiles.value
    .filter(f => !f.uploading && !f.uploadError && f.relativePath)
    .map(f => f.relativePath)

  chatStore.sendMessage({
    message,
    toolIds,
    files: uploadedFilePaths.length > 0 ? uploadedFilePaths : undefined
  })

  // 清空已上传文件列表
  uploadedFiles.value = []
}

// ============ 工具选择器相关方法 ============

// 切换工具选择器展开/收起
const toggleToolSelector = async () => {
  if (!toolSelectorOpen.value) {
    // 首次展开时加载 MCP 配置
    await chatStore.loadMcpConfigs()
  }
  toolSelectorOpen.value = !toolSelectorOpen.value
}

// 关闭工具选择器
const closeToolSelector = () => {
  toolSelectorOpen.value = false
}

// 切换工具选择状态
const toggleTool = (toolId) => {
  chatStore.toggleToolSelection(toolId)
}

// 加载 MCP 配置
const loadMcpConfigs = () => {
  chatStore.loadMcpConfigs()
}

// ============ 文件上传相关方法 ============

// 获取文件URL
const getFileUrl = (relativePath) => {
  if (!relativePath) return ''
  // 使用 /api/file/view 接口预览文件
  return `/api/file/view?path=${encodeURIComponent(relativePath)}`
}

// 处理文件上传按钮点击
const handleFileUpload = () => {
  fileInputRef.value?.click()
}

// 处理文件选择变化
const handleFileChange = async (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  // 获取或生成会话ID
  let sessionId = chatStore.currentSessionId
  if (!sessionId) {
    // 如果没有会话ID，生成临时ID用于上传
    sessionId = 'temp-' + Date.now()
  }

  // 上传所有文件
  const uploadPromises = Array.from(files).map(async (file) => {
    const fileType = getFileType(file.name)
    const fileData = {
      file,
      name: file.name,
      size: file.size,
      sizeText: formatFileSize(file.size),
      type: fileType,
      isImage: fileType === 'image',
      preview: null,
      uploading: true,
      relativePath: null
    }

    // 为图片创建预览（本地预览，上传前显示）
    if (fileData.isImage) {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileData.preview = e.target.result
      }
      reader.readAsDataURL(file)
    }

    // 先添加到列表显示上传中状态
    const index = uploadedFiles.value.length
    uploadedFiles.value.push(fileData)

    try {
      // 调用后端上传接口，传递 sessionId
      const result = await chatApi.uploadFile(file, sessionId)

      // 使用响应式方式更新
      uploadedFiles.value[index] = {
        ...fileData,
        relativePath: result.path,
        uploading: false,
        // 上传成功后，使用服务器URL作为预览
        preview: fileData.isImage ? getFileUrl(result.path) : fileData.preview
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      // 使用响应式方式更新
      uploadedFiles.value[index] = {
        ...fileData,
        uploading: false,
        uploadError: true
      }
    }
  })

  await Promise.all(uploadPromises)

  // 重置文件输入，允许重复选择同一文件
  e.target.value = ''
}

// 移除文件
const removeFile = async (index) => {
  const fileData = uploadedFiles.value[index]

  // 如果删除的是当前悬停的文件，清空悬停状态
  if (hoveredFile.value === fileData) {
    hoveredFile.value = null
  }

  // 如果文件已上传成功且有相对路径，调用后端删除接口
  if (fileData.relativePath && !fileData.uploading && !fileData.uploadError) {
    try {
      await chatApi.deleteFile(fileData.relativePath)
      console.log('文件删除成功:', fileData.relativePath)
    } catch (error) {
      console.error('删除服务器文件失败:', error)
      // 即使删除失败也继续移除本地显示
    }
  }

  // 释放本地预览 URL
  if (fileData.preview && fileData.preview.startsWith('blob:')) {
    URL.revokeObjectURL(fileData.preview)
  }

  // 从列表中移除
  uploadedFiles.value.splice(index, 1)
}

// 图片预览处理
let previewHideTimer = null

const handleFileMouseEnter = (file, event) => {
  // 清除之前的隐藏定时器
  if (previewHideTimer) {
    clearTimeout(previewHideTimer)
    previewHideTimer = null
  }

  if (!file.isImage || file.uploading || file.uploadError) return
  hoveredFile.value = file
  // 计算预览位置（在文件项上方居中）
  const rect = event.currentTarget.getBoundingClientRect()
  previewPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top
  }
}

const handlePreviewMouseEnter = () => {
  // 鼠标进入预览浮层时，取消隐藏
  if (previewHideTimer) {
    clearTimeout(previewHideTimer)
    previewHideTimer = null
  }
}

const handleFileMouseLeave = () => {
  // 延迟隐藏，避免鼠标移动到预览浮层时立即隐藏
  previewHideTimer = setTimeout(() => {
    hoveredFile.value = null
  }, 100)
}

// 监听文件列表变化，如果悬停的文件不在列表中了，清空悬停状态
watch(uploadedFiles, (newFiles) => {
  if (hoveredFile.value && !newFiles.includes(hoveredFile.value)) {
    hoveredFile.value = null
  }
}, { deep: true })

// 组件卸载时清理定时器
onUnmounted(() => {
  if (previewHideTimer) {
    clearTimeout(previewHideTimer)
  }
})

// 点击外部关闭功能（使用自定义指令）
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}

// 聊天模式选择器相关方法
const toggleChatModeSelector = () => {
  chatModeSelectorOpen.value = !chatModeSelectorOpen.value
}

const closeChatModeSelector = () => {
  chatModeSelectorOpen.value = false
}

const selectChatMode = (mode) => {
  chatStore.setChatMode(mode)
  chatModeSelectorOpen.value = false
}

// 取消发送
const handleCancel = () => {
  chatStore.cancelSend()
  isSending.value = false
}

// 监听 store 的发送状态
watch(() => chatStore.isSending, (val) => {
  isSending.value = val
})
</script>

<style scoped>
.input-area {
  padding: 1rem 1.5rem 1.25rem;
  background: var(--bg-primary);
}

.input-container {
  max-width: 42rem;
  margin: 0 auto;
}

/* 工具栏区域 */
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0.625rem 0.875rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-2xl);
  transition: var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.input-wrapper:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.input-wrapper.focused {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(124, 154, 109, 0.12), var(--shadow-md);
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 0.625rem;
}

.message-input {
  flex: 1;
  min-height: 2.25rem;
  max-height: 9.75rem;
  padding: 0.5rem 0;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.message-input::placeholder {
  color: var(--text-tertiary);
}

.message-input:disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.input-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.input-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0 0.25rem;
}

.hint-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.action-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.send-btn {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.send-btn:hover:not(.disabled) {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.send-btn.disabled {
  background: var(--bg-hover);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--color-error);
  color: var(--text-inverse);
}

.cancel-btn:hover {
  background: #b85c50;
  transform: scale(1.05);
}

/* ============ 工具选择器样式 ============ */

/* 文件上传按钮 */
.file-upload-btn {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.file-upload-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
  color: var(--text-primary);
}

/* ============ 文件列表样式 ============ */

/* 文件列表容器 */
.file-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0;  /* 使用负边距实现重叠，不需要 gap */
  margin-bottom: 0.5rem;
}

/* 文件列表过渡动画 */
.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.2s ease-out;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* 文件项 - 固定大小的缩略图 */
.file-item {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  margin-left: -0.75rem;  /* 负边距实现重叠效果 */
  flex-shrink: 0;
  overflow: hidden;
}

/* 第一个文件不使用负边距 */
.file-item:first-child {
  margin-left: 0;
}

/* 悬停效果 - 稍微放大并提高 z-index */
.file-item:hover {
  transform: translateY(-0.125rem) scale(1.05);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

/* 上传中状态 */
.file-item.uploading {
  opacity: 0.7;
  border-color: var(--color-primary, #3b82f6);
}

/* 错误状态 */
.file-item.error {
  border-color: var(--color-error, #ef4444);
}

/* 删除按钮 */
.file-remove-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 0.875rem;
  height: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-error, #ef4444);
  border: 1.5px solid var(--bg-elevated);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: var(--transition-base);
  color: var(--text-inverse);
  z-index: 2;
}

.file-item:hover .file-remove-btn {
  opacity: 1;
}

.file-remove-btn:hover {
  background: #b85c50;
  transform: scale(1.1);
}

/* 图片缩略图 */
.file-thumbnail {
  width: 100%;
  height: 100%;
  border-radius: calc(var(--radius-md) - 1px);
  overflow: hidden;
  background: var(--bg-secondary);
}

.file-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 文件图标 */
.file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: calc(var(--radius-md) - 1px);
}

/* 不同文件类型的图标颜色 */
.file-item:has(.file-icon) .file-remove-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.file-item:has(.file-icon) .file-remove-btn:hover {
  background: var(--color-error);
  color: var(--text-inverse);
}

/* PDF 文件 - 红色 */
.file-item:has([d*="M9 15"]) .file-icon {
  color: #ef4444;
  background: #fef2f2;
}

/* Word 文件 - 蓝色 */
.file-item:has([d*="M8 12H16"]) .file-icon {
  color: #3b82f6;
  background: #eff6ff;
}

/* Excel 文件 - 绿色 */
.file-item:has([d*="M8 9H16"]) .file-icon {
  color: #10b981;
  background: #ecfdf5;
}

/* 压缩文件 - 橙色 */
.file-item:has([d*="M12 15"]) .file-icon {
  color: #f97316;
  background: #fff7ed;
}

/* 状态遮罩层 */
.file-status-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: calc(var(--radius-md) - 1px);
  color: var(--text-inverse);
  z-index: 1;
}

/* 旋转动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ============ 图片预览浮层 ============ */

.image-preview-popup {
  position: fixed;
  transform: translate(-50%, -100%) translateY(-0.75rem);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
  z-index: 9999;
  pointer-events: auto;
  max-width: 20rem;
}

.image-preview-popup img {
  display: block;
  max-width: 100%;
  max-height: 16rem;
  width: auto;
  height: auto;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.preview-filename {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 19rem;
}

/* 预览浮层过渡动画 */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.15s ease-out;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) translateY(-0.5rem);
}

.tool-selector-wrapper {
  position: relative;
}

.tool-selector-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: 0.75rem;
  color: var(--text-secondary);
  width: fit-content;
}

.tool-selector-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
  color: var(--text-primary);
}

.tool-badge {
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  min-width: 1.25rem;
  text-align: center;
}

.tool-selector-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  min-width: 16rem;
  max-width: 24rem;
  max-height: 18rem;
  overflow-y: auto;
  z-index: 10;
}

/* 工具面板过渡动画 */
.tool-panel-enter-active,
.tool-panel-leave-active {
  transition: all 0.2s ease-out;
}

.tool-panel-enter-from,
.tool-panel-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* 加载中状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.loading-state .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  color: var(--text-secondary);
}

.error-text {
  font-size: 0.875rem;
  color: var(--color-error);
}

.retry-btn {
  padding: 0.375rem 0.875rem;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: var(--transition-base);
}

.retry-btn:hover {
  background: var(--accent-hover);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* 工具列表 */
.tool-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
}

.tool-item:hover {
  background: var(--bg-hover);
}

.tool-item.selected {
  background: rgba(124, 154, 109, 0.08);
}

.tool-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.tool-name {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.tool-desc {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  cursor: help;
}

/* ============ 聊天模式选择器样式 ============ */

.chat-mode-selector {
  position: relative;
}

.chat-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(124, 154, 109, 0.12);
  border: 1px solid rgba(124, 154, 109, 0.35);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: 0.75rem;
  color: var(--text-secondary);
  width: fit-content;
}

.chat-mode-btn:hover {
  background: rgba(124, 154, 109, 0.18);
  border-color: rgba(124, 154, 109, 0.5);
  color: var(--text-primary);
}

.chat-mode-btn .mode-icon {
  font-size: 0.875rem;
}

.chat-mode-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  min-width: 10rem;
  z-index: 10;
}

.mode-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: 0.875rem;
  color: var(--text-primary);
}

.mode-item:hover {
  background: var(--bg-hover);
}

.mode-item.active {
  background: rgba(124, 154, 109, 0.12);
  color: var(--accent-primary);
  font-weight: 500;
}

.mode-item .mode-icon {
  font-size: 1.125rem;
}

/* 模式面板过渡动画 */
.mode-panel-enter-active,
.mode-panel-leave-active {
  transition: all 0.2s ease-out;
}

.mode-panel-enter-from,
.mode-panel-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
