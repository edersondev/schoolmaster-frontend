import { describe, expect, it } from 'vitest'
import { accessAdministrationRoutes } from '@/router/modules/access-administration.routes'

describe('teacher assignment routes', () => {
  it('keeps teacher assignment management under admin metadata only', () => {
    const route = accessAdministrationRoutes.find((entry) => entry.name === 'teacherAssignmentsList')
    expect(route.meta.requiresAuth).toBe(true)
    expect(route.meta.requiresSchoolContext).toBe(true)
    expect(accessAdministrationRoutes.some((entry) => String(entry.path).includes('own-assignments'))).toBe(false)
  })
})
