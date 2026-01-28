<template>
  <div class="demo">
    <h1>Easy Agent WebUI Demo</h1>
    <p>这是一个基础的 Demo 页面</p>
    <div class="info">
      <p>Vue 3.5.24 + Vite 7.2.4 + Element Plus 2.13.0</p>
      <el-button type="primary" @click="handleClick">点击测试</el-button>
    </div>
  </div>
</template>

<script setup>
const handleClick = () => {
  ElMessage.success('Element Plus 组件正常工作！')
}
</script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

.demo h1 {
  color: #333;
  margin: 0;
}

.demo p {
  color: #666;
  margin: 0;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
