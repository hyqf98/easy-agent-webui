import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
// 导入 Element Plus 样式
import 'element-plus/dist/index.css'
// 导入 Element Plus 主题变量（可选，用于自定义主题）
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
