import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('administration routes', () => {
  it('defines protected routes with exact metadata', () => {
    expect(administrationRoutes).toHaveLength(25)
    expect(administrationRoutes.every((route) => route.meta.requiresAuth)).toBe(true)
    expect(
      administrationRoutes.find((route) => route.name === 'schoolCreate').meta.permissions,
    ).toEqual(['schools.view', 'schools.manage'])
    expect(
      administrationRoutes.find((route) => route.name === 'schoolEdit').meta.permissions,
    ).toEqual(['schools.view', 'schools.manage'])
    expect(
      administrationRoutes.find((route) => route.name === 'roleCreate').meta.permissions,
    ).toEqual(['roles.view', 'roles.manage', 'permissions.view'])
    expect(
      administrationRoutes.find((route) => route.name === 'userEdit').meta.permissions,
    ).toEqual(['users.view', 'users.manage', 'roles.view'])
    expect(
      administrationRoutes.find((route) => route.name === 'roleEdit').meta.permissions,
    ).toEqual(['roles.view', 'roles.manage', 'permissions.view'])
  })
})
