import { describe, expect, it } from 'vitest'
import { accessAdministrationRoutes } from '@/router/modules/access-administration.routes'

describe('access administration page flows', () => {
  it('defines tenant-gated exact list/create route requirements', () => {
    expect(accessAdministrationRoutes.every((route) => route.meta.requiresSchoolContext)).toBe(true)
    expect(
      accessAdministrationRoutes.find((route) => route.name === 'userCreate').meta.permissions,
    ).toEqual(['users.view', 'users.manage', 'roles.view'])
  })
})
