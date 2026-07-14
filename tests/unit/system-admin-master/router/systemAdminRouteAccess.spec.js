import { describe, expect, it, vi } from 'vitest'
import { adminSystemRoutes } from '@/router/modules/admin-system.routes'
import { teacherWorkflowRoutes } from '@/modules/teacher-workflow/routes'
import { createAuthGuard } from '@/router/authGuards'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import {
  hasCapability,
  TEACHER_WORKFLOW_CAPABILITIES,
} from '@/modules/teacher-workflow/services/teacherWorkflowContract'
import {
  activeSchool,
  createResolvedSystemAdministrator,
  createSystemAdminPinia,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

function permissionProtectedRoutes(routes, inheritedMeta = {}) {
  return routes.flatMap((route) => {
    const meta = { ...inheritedMeta, ...route.meta }
    const current = meta.requiresAuth && meta.permissions?.length ? [{ ...route, meta }] : []
    return [...current, ...permissionProtectedRoutes(route.children ?? [], meta)]
  })
}

describe('System Administrator protected route access', () => {
  it('allows every released permission-protected route after session resolution', async () => {
    const protectedRoutes = permissionProtectedRoutes([...adminSystemRoutes, ...teacherWorkflowRoutes])
    const store = {
      ...createResolvedSystemAdministrator(),
      setFeedbackState: vi.fn(),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    expect(protectedRoutes.length).toBeGreaterThan(20)
    for (const route of protectedRoutes) {
      await expect(guard(route)).resolves.toBe(true)
    }
    expect(store.setFeedbackState).not.toHaveBeenCalled()
  })

  it('satisfies released workspace permission gates through shared session decision', () => {
    createSystemAdminPinia()
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'system-administrator' }
    store.roles = [systemAdministratorRole]
    store.activeSchool = activeSchool

    const reporting = createReportingAccessState(store)
    const assessment = useAdvancedAssessmentAccess({ session: store })

    expect(reporting.isReady.value).toBe(true)
    expect(reporting.hasLifecycleAccess.value).toBe(true)
    expect(assessment.canAuthor.value.allowed).toBe(true)
    expect(assessment.canReview.value.allowed).toBe(true)
    expect(hasCapability(store, TEACHER_WORKFLOW_CAPABILITIES.adminImport)).toBe(true)
  })
})
