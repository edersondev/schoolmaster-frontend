import { createRouter, createWebHistory } from 'vue-router'
import { adminSystemRoutes } from './modules/admin-system.routes'
import { authRoutes } from './modules/auth.routes'
import { createAuthGuard } from './authGuards'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...authRoutes, ...adminSystemRoutes],
})

router.beforeEach((to, from) => {
  const store = useAuthSessionStore()
  const guard = createAuthGuard({
    store,
    fallbackRoute: { name: 'adminDashboard' },
  })
  return guard(to, from)
})

export default router
