import { describe, expect, it, vi } from 'vitest'
import { createAuthGuard } from '@/router/authGuards'

describe('protected route bootstrap guard', () => {
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
})
