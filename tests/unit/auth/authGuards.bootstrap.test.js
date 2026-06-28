import { describe, expect, it, vi } from 'vitest'
import { createAuthGuard } from '@/router/authGuards'

describe('protected route bootstrap guard', () => {
  it('bootstraps a guest-only route before deciding whether to allow it', async () => {
    const store = {
      hasBootstrapped: false,
      status: 'signed-out',
      permissions: [],
      activeSchool: null,
      requestedRoute: null,
      bootstrap: vi.fn(async () => {
        store.hasBootstrapped = true
        store.status = 'authenticated'
      }),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    await expect(
      guard({
        name: 'authLogin',
        fullPath: '/auth/login',
        meta: { guestOnly: true },
      }),
    ).resolves.toEqual({ name: 'adminDashboard' })
    expect(store.bootstrap).toHaveBeenCalledOnce()
  })

  it('waits for bootstrap before allowing protected content', async () => {
    let finishBootstrap
    const store = {
      hasBootstrapped: false,
      status: 'signed-out',
      permissions: [],
      activeSchool: null,
      bootstrap: vi.fn(
        () =>
          new Promise((resolve) => {
            finishBootstrap = () => {
              store.hasBootstrapped = true
              store.status = 'authenticated'
              store.permissions = [{ code: 'admin.dashboard.view', status: 'active' }]
              resolve()
            }
          }),
      ),
      captureRequestedRoute: vi.fn(),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })
    const navigation = guard(
      {
        name: 'adminDashboard',
        fullPath: '/admin',
        meta: { requiresAuth: true, permissions: ['admin.dashboard.view'] },
      },
      {},
    )

    expect(store.bootstrap).toHaveBeenCalled()
    finishBootstrap()
    await expect(navigation).resolves.toBe(true)
  })

  it('allows protected routes for active platform System Administrator roles', async () => {
    const store = {
      hasBootstrapped: true,
      status: 'authenticated',
      permissions: [{ code: 'admin.dashboard.view', status: 'active' }],
      roles: [{ name: 'System Administrator', scope: 'platform', status: 'active' }],
      activeSchool: { id: 'school-1' },
      setFeedbackState: vi.fn(),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    await expect(
      guard({
        name: 'usersList',
        fullPath: '/admin/users',
        meta: { requiresAuth: true, requiresSchoolContext: true, permissions: ['users.view'] },
      }),
    ).resolves.toBe(true)
    expect(store.setFeedbackState).not.toHaveBeenCalled()
  })
})
