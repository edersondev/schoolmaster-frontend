import { describe, expect, it, vi } from 'vitest'
import { createAuthAccountLifecycleService } from '@/services/auth/accountLifecycle'
import { createClient, lifecycleError, validToken } from '../fixtures'

describe('auth account lifecycle service', () => {
  it('completes invitation setup with token path and password body', async () => {
    const client = createClient({
      post: vi.fn().mockResolvedValue({
        data: { data: { user_id: 'user-1', status: 'active', action: 'setup' } },
      }),
    })
    const service = createAuthAccountLifecycleService(client)

    await expect(
      service.completeAccountInvitation({ invitationToken: validToken, password: 'valid-password' }),
    ).resolves.toMatchObject({ userId: 'user-1' })
    expect(client.post).toHaveBeenCalledWith(
      `/api/v1/account-invitations/${validToken}/setup`,
      { password: 'valid-password' },
      expect.any(Object),
    )
  })

  it('normalizes token and validation failures', async () => {
    const service = createAuthAccountLifecycleService(
      createClient({
        post: vi.fn().mockRejectedValue(lifecycleError('token_expired', 401)),
      }),
    )
    await expect(
      service.completePasswordReset({ token: validToken, password: 'valid-password' }),
    ).rejects.toMatchObject({ feedback: { state: 'invalid-token' } })

    const validationService = createAuthAccountLifecycleService(
      createClient({
        post: vi.fn().mockRejectedValue(lifecycleError('validation_failed', 422, { password: ['Weak'] })),
      }),
    )
    await expect(
      validationService.completePasswordReset({ token: validToken, password: 'valid-password' }),
    ).rejects.toMatchObject({ feedback: { state: 'validation' } })
  })
})

