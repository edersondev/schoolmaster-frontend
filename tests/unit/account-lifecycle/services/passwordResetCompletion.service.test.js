import { describe, expect, it, vi } from 'vitest'
import { createAuthAccountLifecycleService } from '@/services/auth/accountLifecycle'
import { createClient, lifecycleError, validToken } from '../fixtures'

describe('password reset completion service', () => {
  it('maps success and token failures safely', async () => {
    const service = createAuthAccountLifecycleService(
      createClient({
        post: vi.fn().mockResolvedValue({
          data: { data: { user_id: 'user-1', status: 'active', action: 'password_reset' } },
        }),
      }),
    )
    await expect(
      service.completePasswordReset({ token: validToken, password: 'valid-password' }),
    ).resolves.toMatchObject({ userId: 'user-1' })

    const failing = createAuthAccountLifecycleService(
      createClient({ post: vi.fn().mockRejectedValue(lifecycleError('token_revoked', 401)) }),
    )
    await expect(
      failing.completePasswordReset({ token: validToken, password: 'valid-password' }),
    ).rejects.toMatchObject({ feedback: { state: 'invalid-token' } })
  })
})

