import { createRouter, createWebHistory } from 'vue-router'
import HomeNew from '@/views/HomeNew.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeNew,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
