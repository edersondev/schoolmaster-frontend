import { describe, expect, it } from 'vitest'
import { resolveSchoolContextRoute } from '@/router/schoolContextRoutes'

const router = { hasRoute: (name) => name !== 'missing' }

describe('school context route compatibility', () => {
  it('retains registered platform and explicitly safe generic list routes', () => {
    expect(
      resolveSchoolContextRoute(
        {
          routeName: 'platform',
          routeParams: {},
          routeQuery: { tab: 'audit' },
          requiresSchoolContext: false,
        },
        router,
      ),
    ).toEqual({ name: 'platform', params: {}, query: { tab: 'audit' } })

    expect(
      resolveSchoolContextRoute(
        {
          routeName: 'usersList',
          routeParams: {},
          routeQuery: { page: '2', unsafe: 'drop' },
          requiresSchoolContext: true,
          schoolContextSwitch: 'retain',
          contextNeutralQueryKeys: ['page'],
        },
        router,
      ),
    ).toEqual({ name: 'usersList', params: {}, query: { page: '2' } })
  })

  it.each([
    [
      {
        routeName: 'detail',
        routeParams: { id: 'old' },
        requiresSchoolContext: true,
        schoolContextSwitch: 'retain',
      },
    ],
    [
      {
        routeName: 'action',
        routeParams: {},
        requiresSchoolContext: true,
        schoolContextSwitch: 'discard',
      },
    ],
    [{ routeName: 'missing', routeParams: {}, requiresSchoolContext: false }],
    [
      {
        routeName: 'disabled',
        routeParams: {},
        requiresSchoolContext: false,
        featureEnabled: false,
      },
    ],
  ])('defaults unsafe, parameterized, missing, or disabled routes to fallback', (intent) => {
    expect(resolveSchoolContextRoute(intent, router)).toBeNull()
  })
})
