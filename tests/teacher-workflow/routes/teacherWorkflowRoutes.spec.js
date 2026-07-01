import { describe, expect, it } from 'vitest'
import { teacherWorkflowRoutes } from '@/modules/teacher-workflow/routes'
import { TEACHER_WORKFLOW_ROUTE_NAMES } from '@/modules/teacher-workflow/routes/routeNames'

describe('teacher workflow routes', () => {
  it('registers protected teacher and admin-observed routes', () => {
    const names = JSON.stringify(teacherWorkflowRoutes)
    expect(names).toContain(TEACHER_WORKFLOW_ROUTE_NAMES.content)
    expect(names).toContain(TEACHER_WORKFLOW_ROUTE_NAMES.adminImports)
    expect(teacherWorkflowRoutes.every((route) => route.meta?.requiresAuth !== false)).toBe(true)
  })
})
