import { describe, expect, it, vi } from 'vitest'
import { createAuthGuard } from '@/router/authGuards'
import { createLimitedSession } from '../fixtures/masterAccess.fixtures'

describe('limited-role permission denial', () => {
  it('keeps existing denied route outcome', async () => {
    const store = {
      ...createLimitedSession(),
      setFeedbackState: vi.fn(),
    }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    await expect(
      guard({
        name: 'usersList',
        meta: {
          requiresAuth: true,
          requiresSchoolContext: true,
          permissions: ['users.view'],
        },
      }),
    ).resolves.toEqual({ name: 'authState' })
    expect(store.setFeedbackState).toHaveBeenCalledWith('forbidden')
  })
})
