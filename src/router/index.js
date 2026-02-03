import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/chat/index.vue')
  },
  {
    path: '/chat/:id',
    name: 'ChatWithSession',
    component: () => import('@/views/chat/index.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
