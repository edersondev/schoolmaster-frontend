import { describe, expect, it } from 'vitest'
import { accessAdministrationRoutes } from '@/router/modules/access-administration.routes'

describe('access administration page flows', () => {
  it('defines dynamic user lookup routes and tenant-gated mutation routes', () => {
    expect(
      accessAdministrationRoutes.find((route) => route.name === 'usersList').meta,
    ).toMatchObject({
      requiresSchoolContext: false,
      anyPermissions: ['users.view', 'schools.view'],
    })
    expect(
      accessAdministrationRoutes.find((route) => route.name === 'userDetail').meta,
    ).toMatchObject({
      requiresSchoolContext: false,
      anyPermissions: ['users.view', 'schools.view'],
    })
    expect(
      accessAdministrationRoutes.find((route) => route.name === 'userCreate').meta
        .requiresSchoolContext,
    ).toBe(true)
    expect(
      accessAdministrationRoutes.find((route) => route.name === 'userCreate').meta.permissions,
    ).toEqual(['users.view', 'users.manage', 'roles.view', 'account_lifecycle.manage'])
    expect(
      accessAdministrationRoutes.find((route) => route.name === 'userEdit').meta.permissions,
    ).toEqual(['users.view', 'users.manage', 'roles.view'])
  })
})
