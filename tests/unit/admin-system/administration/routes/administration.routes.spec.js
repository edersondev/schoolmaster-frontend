import { describe, expect, it } from 'vitest'
import {
  createReturnToListLocation,
  sanitizeAdministrationReturnQuery,
} from '@/router/modules/administration-route'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('administration routes', () => {
  it('defines protected routes with exact metadata', () => {
    expect(administrationRoutes).toHaveLength(33)
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

  it('preserves serialized list query keys when returning from detail and edit routes', () => {
    expect(
      sanitizeAdministrationReturnQuery({
        page: '3',
        per_page: '50',
        academic_year_id: 'year-1',
        status: 'active',
        academicPeriodId: 'period-1',
        unsafe: 'drop',
      }),
    ).toEqual({
      page: '3',
      per_page: '50',
      academic_year_id: 'year-1',
      academicPeriodId: 'period-1',
      status: 'active',
    })

    expect(
      createReturnToListLocation(
        {
          meta: { returnListRoute: 'academicPeriodsList' },
          query: { per_page: '100', academic_year_id: 'year-2' },
        },
        'fallback',
      ),
    ).toEqual({
      name: 'academicPeriodsList',
      query: { per_page: '100', academic_year_id: 'year-2' },
    })
  })
})
