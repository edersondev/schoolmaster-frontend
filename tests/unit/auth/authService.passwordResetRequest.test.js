import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/services/auth/authService'
import { authError, createAuthClient } from './auth.fixtures'

describe('authService.requestPasswordReset', () => {
  it('maps accepted confirmation inside the 15-second target', async () => {
    const client = createAuthClient({
      post: vi.fn().mockResolvedValue({ data: { accepted: true }, meta: {} }),
    })
    const service = createAuthService(client)
    const startedAt = performance.now()

    await expect(service.requestPasswordReset({ email: 'avery@example.com' })).resolves.toEqual({
      accepted: true,
    })
    expect(performance.now() - startedAt).toBeLessThan(15_000)
  })

  it('preserves validation errors', async () => {
    const service = createAuthService(
      createAuthClient({
        post: vi
          .fn()
          .mockRejectedValue(authError('validation_failed', 422, { email: ['Invalid email'] })),
      }),
    )
    await expect(service.requestPasswordReset({ email: 'bad' })).rejects.toMatchObject({
      feedback: { state: 'validation' },
      fieldErrors: { email: ['Invalid email'] },
    })
  })
})
