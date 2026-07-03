import { createRouter, createWebHistory } from 'vue-router'
import { adminSystemRoutes } from './modules/admin-system.routes'
import { authRoutes } from './modules/auth.routes'
import { guardianRoutes } from './modules/guardian'
import { reportingRoutes } from './modules/reporting'
import { studentRoutes } from './modules/student'
import { teacherWorkflowRoutes } from '@/modules/teacher-workflow/routes'
import { createAuthGuard } from './authGuards'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { getAdminFallbackRoute } from './adminFallbackRoute'

export { getAdminFallbackRoute } from './adminFallbackRoute'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...adminSystemRoutes,
    ...teacherWorkflowRoutes,
    ...studentRoutes,
    ...guardianRoutes,
    ...reportingRoutes,
  ],
})

router.beforeEach((to, from) => {
  const store = useAuthSessionStore()
  const guard = createAuthGuard({
    store,
    fallbackRoute: getAdminFallbackRoute,
  })
  return guard(to, from)
})

export default router
