import { describe, expect, it, vi } from 'vitest'
import { captureRequestedRoute, createAuthGuard, resolveRequestedRoute } from '@/router/authGuards'

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

  it('restores privileged system administrator routes without literal permission codes', () => {
    const requested = captureRequestedRoute(target, 'signed-out')
    const result = resolveRequestedRoute(requested, {
      status: 'authenticated',
      activeSchool: { id: 'school-1' },
      permissions: [{ code: 'admin.dashboard.view', status: 'active' }],
      roles: [
        {
          name: 'System Administrator',
          scope: 'platform',
          status: 'active',
        },
      ],
    })

    expect(result).toEqual({ name: 'reports', params: { id: '1' }, query: { tab: 'summary' } })
  })

  it('captures missing-context intent when bootstrap enters selection state', async () => {
    const store = {
      status: 'selecting-school',
      hasBootstrapped: true,
      captureRequestedRoute: vi.fn(),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    const route = { name: 'usersList', meta: { requiresAuth: true, requiresSchoolContext: true } }
    await expect(guard(route)).resolves.toEqual({ name: 'authSchoolSelection' })
    expect(store.captureRequestedRoute).toHaveBeenCalledWith(route, 'missing-school-context')
  })

  it('allows unresolved System Administrators to open platform routes from the selector', async () => {
    const store = {
      status: 'selecting-school',
      hasBootstrapped: true,
      activeSchool: null,
      permissions: [],
      roles: [
        {
          name: 'System Administrator',
          scope: 'platform',
          status: 'active',
        },
      ],
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    const route = {
      name: 'schoolsList',
      meta: { requiresAuth: true, requiresSchoolContext: false, permissions: ['schools.view'] },
    }

    await expect(guard(route)).resolves.toBe(true)
    expect(store.status).toBe('authenticated')
  })
})
