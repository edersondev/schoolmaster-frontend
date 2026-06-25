import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('administration routes', () => {
  it('defines 13 lazy protected routes with exact metadata', () => {
    expect(administrationRoutes).toHaveLength(13)
    expect(administrationRoutes.every((route) => route.meta.requiresAuth)).toBe(true)
    expect(
      administrationRoutes.find((route) => route.name === 'schoolCreate').meta.permissions,
    ).toEqual(['schools.view', 'schools.manage'])
    expect(
      administrationRoutes.find((route) => route.name === 'roleCreate').meta.permissions,
    ).toEqual(['roles.view', 'roles.manage', 'permissions.view'])
  })
})
