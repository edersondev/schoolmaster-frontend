import { describe, expect, it } from 'vitest'
import { getPostAuthRoute } from '@/router/authGuards'

describe('session recovery routing', () => {
  it('falls back to an allowed workspace when restoration is denied', () => {
    const store = {
      requestedRoute: {
        routeName: 'reports',
        routeParams: {},
        routeQuery: {},
        requiresSchoolContext: false,
        requiredPermissions: ['reports.view'],
      },
      status: 'authenticated',
      activeSchool: null,
      permissions: [],
    }

    expect(getPostAuthRoute(store, { name: 'adminDashboard' })).toEqual({ name: 'adminDashboard' })
  })
})
