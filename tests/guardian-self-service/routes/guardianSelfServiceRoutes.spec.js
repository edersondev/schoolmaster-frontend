import { describe, expect, it } from 'vitest'
import { guardianRoutes } from '@/router/modules/guardian'
import { GUARDIAN_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/guardian/guardianSelfServiceContract'

describe('guardian self-service routes', () => {
  it('registers protected guardian workspace routes with default linked-students landing', () => {
    expect(guardianRoutes.map((route) => route.name)).toEqual([
      GUARDIAN_SELF_SERVICE_ROUTE_NAMES.workspace,
      GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents,
      GUARDIAN_SELF_SERVICE_ROUTE_NAMES.studentDetail,
      GUARDIAN_SELF_SERVICE_ROUTE_NAMES.academics,
      GUARDIAN_SELF_SERVICE_ROUTE_NAMES.contacts,
    ])
    expect(guardianRoutes[0].redirect).toEqual({
      name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents,
    })
    expect(guardianRoutes.every((route) => route.meta?.requiresAuth === true)).toBe(true)
    expect(JSON.stringify(guardianRoutes)).not.toMatch(/studentSelfService|school-admin|teacher/)
  })
})
