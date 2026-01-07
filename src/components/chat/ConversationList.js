// 获取图标文字
export const getIconText = (title) => {
  if (!title) return '对'
  return title.charAt(0)
}

// 格式化时间
export const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // 更早
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 组合式函数
export const useConversationList = (emit) => {
  const hoveredId = ref(null)
  const contextMenuVisible = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })
  const contextMenuConv = ref(null)
  const renameDialogVisible = ref(false)
  const deleteDialogVisible = ref(false)
  const newTitle = ref('')
  const renameInputRef = ref(null)

  // 选择会话
  const handleSelect = (id) => {
    emit('selectChat', id)
  }

  // 显示右键菜单
  const showContextMenu = (event, conv) => {
    contextMenuConv.value = conv
    contextMenuPosition.value = {
      x: event.clientX,
      y: event.clientY
    }
    contextMenuVisible.value = true
  }

  // 隐藏右键菜单
  const hideContextMenu = () => {
    contextMenuVisible.value = false
  }

  // 处理重命名
  const handleRename = () => {
    hideContextMenu()
    newTitle.value = contextMenuConv.value?.title || ''
    renameDialogVisible.value = true
    nextTick(() => {
      renameInputRef.value?.focus()
      renameInputRef.value?.select()
    })
  }

  // 确认重命名
  const confirmRename = () => {
    const title = newTitle.value.trim()
    if (title && contextMenuConv.value) {
      emit('renameChat', contextMenuConv.value.id, title)
    }
    closeRenameDialog()
  }

  // 关闭重命名弹窗
  const closeRenameDialog = () => {
    renameDialogVisible.value = false
    newTitle.value = ''
  }

  // 处理删除
  const handleDelete = () => {
    hideContextMenu()
    deleteDialogVisible.value = true
  }

  // 确认删除
  const confirmDelete = () => {
    if (contextMenuConv.value) {
      emit('deleteChat', contextMenuConv.value.id)
    }
    closeDeleteDialog()
  }

  // 关闭删除弹窗
  const closeDeleteDialog = () => {
    deleteDialogVisible.value = false
  }

  // 点击外部关闭菜单
  const handleClickOutside = (event) => {
    if (contextMenuVisible.value) {
      hideContextMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    hoveredId,
    contextMenuVisible,
    contextMenuPosition,
    contextMenuConv,
    renameDialogVisible,
    deleteDialogVisible,
    newTitle,
    renameInputRef,
    handleSelect,
    showContextMenu,
    handleRename,
    confirmRename,
    closeRenameDialog,
    handleDelete,
    confirmDelete,
    closeDeleteDialog
  }
}
