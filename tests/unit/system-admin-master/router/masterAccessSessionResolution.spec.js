import { describe, expect, it, vi } from 'vitest'
import { createAuthGuard } from '@/router/authGuards'
import { systemAdministratorRole } from '../fixtures/masterAccess.fixtures'

describe('System Administrator session restoration', () => {
  it('waits for resolved role state before permission evaluation', async () => {
    let finishBootstrap
    const store = {
      hasBootstrapped: false,
      status: 'signed-out',
      roles: [],
      permissions: [],
      activeSchool: null,
      setFeedbackState: vi.fn(),
      bootstrap: vi.fn(() => new Promise((resolve) => {
        finishBootstrap = () => {
          store.hasBootstrapped = true
          store.status = 'authenticated'
          store.roles = [systemAdministratorRole]
          store.activeSchool = { id: 'school-1', status: 'active' }
          resolve()
        }
      })),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    const pending = guard({
      name: 'usersList',
      meta: { requiresAuth: true, requiresSchoolContext: true, permissions: ['users.view'] },
    })
    expect(store.setFeedbackState).not.toHaveBeenCalled()
    finishBootstrap()

    await expect(pending).resolves.toBe(true)
    expect(store.setFeedbackState).not.toHaveBeenCalled()
  })
})
