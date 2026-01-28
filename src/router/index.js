import {createRouter, createWebHistory} from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'chat',
    component: () => import('@/views/chat/index.vue')
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import('@/views/Demo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
