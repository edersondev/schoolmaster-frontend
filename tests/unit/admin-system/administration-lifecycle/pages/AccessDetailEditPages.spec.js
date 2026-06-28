import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('access lifecycle detail/edit pages', () => {
  it('registers user and role route permission matrices without permission detail routes', () => {
    expect(administrationRoutes.find((route) => route.name === 'userEdit').meta.permissions).toEqual(['users.view', 'users.manage', 'roles.view'])
    expect(administrationRoutes.find((route) => route.name === 'roleEdit').meta.permissions).toEqual(['roles.view', 'roles.manage', 'permissions.view'])
    expect(administrationRoutes.find((route) => route.name === 'permissionDetail')).toBeUndefined()
  })
})
