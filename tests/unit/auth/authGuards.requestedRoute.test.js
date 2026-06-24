import { describe, expect, it } from 'vitest'
import { captureRequestedRoute, resolveRequestedRoute } from '@/router/authGuards'

describe('requested route recovery', () => {
  const target = {
    name: 'reports',
    params: { id: '1' },
    query: { tab: 'summary' },
    meta: { requiresSchoolContext: true, permissions: ['reports.view'] },
  }

  it('captures and restores an authorized route', () => {
    const requested = captureRequestedRoute(target, 'signed-out')
    const result = resolveRequestedRoute(requested, {
      status: 'authenticated',
      activeSchool: { id: 'school-1' },
      permissions: [{ code: 'reports.view', status: 'active' }],
    })

    expect(result).toEqual({ name: 'reports', params: { id: '1' }, query: { tab: 'summary' } })
  })

  it('rejects restoration when permission is no longer present', () => {
    expect(
      resolveRequestedRoute(captureRequestedRoute(target, 'expired-session'), {
        status: 'authenticated',
        activeSchool: { id: 'school-1' },
        permissions: [],
      }),
    ).toBeNull()
  })
})
