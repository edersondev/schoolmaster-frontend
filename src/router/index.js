import { createRouter, createWebHistory } from 'vue-router'
import { adminSystemRoutes } from './modules/admin-system.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...adminSystemRoutes],
})

export default router
