import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/services/auth/authService'
import { authError, authSessionEnvelope, createAuthClient } from './auth.fixtures'

describe('authService.login', () => {
  it('maps a successful session and completes inside the 30-second target', async () => {
    const client = createAuthClient({ post: vi.fn().mockResolvedValue(authSessionEnvelope) })
    const service = createAuthService(client)
    const startedAt = performance.now()

    const session = await service.login({ email: 'avery@example.com', password: 'password123' })

    expect(session.currentUser.fullName).toBe('Avery Stone')
    expect(session.permissions).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'admin.dashboard.view' })]),
    )
    expect(performance.now() - startedAt).toBeLessThan(30_000)
  })

  it.each([
    ['validation_failed', 422, 'validation'],
    ['invalid_credentials', 401, 'invalid-credentials'],
    ['auth_locked', 429, 'lockout'],
    ['inactive_user', 401, 'inactive-user'],
    ['inactive_school', 401, 'inactive-school'],
  ])('normalizes %s as %s', async (code, status, expectedState) => {
    const service = createAuthService(
      createAuthClient({ post: vi.fn().mockRejectedValue(authError(code, status)) }),
    )

    await expect(
      service.login({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toMatchObject({
      feedback: { state: expectedState },
    })
  })
})
