import { describe, expect, it } from 'vitest'
import { createAuthGuard } from '@/router/authGuards'

describe('guest lifecycle route guards', () => {
  it('allows signed-in users to open token-proven guest lifecycle links', async () => {
    const guard = createAuthGuard({
      store: {
        hasBootstrapped: true,
        status: 'authenticated',
      },
      fallbackRoute: { name: 'adminDashboard' },
    })

    await expect(guard({ meta: { guestLifecycle: true } })).resolves.toBe(true)
  })
})

