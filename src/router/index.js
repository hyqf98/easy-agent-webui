import {createRouter, createWebHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'chat',
    component: () => import('../views/AiChatView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
