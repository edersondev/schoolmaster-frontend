import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/services/auth/authService'
import { authError, authSessionEnvelope, createAuthClient } from './auth.fixtures'

describe('authService.getCurrentUser', () => {
  it('maps user, roles, permissions, school, header, and timing target', async () => {
    const client = createAuthClient({ get: vi.fn().mockResolvedValue(authSessionEnvelope) })
    const service = createAuthService(client)
    const startedAt = performance.now()

    const session = await service.getCurrentUser({
      schoolId: authSessionEnvelope.data.resolved_school.id,
    })

    expect(client.get).toHaveBeenCalledWith('/api/v1/auth/me', {
      headers: { 'X-School-Id': authSessionEnvelope.data.resolved_school.id },
    })
    expect(session.activeSchool.name).toBe('Northfield Academy')
    expect(session.activeSchool.timezone).toBe('America/Sao_Paulo')
    expect(session.roles[0].name).toBe('System Administrator')
    expect(performance.now() - startedAt).toBeLessThan(30_000)
  })

  it.each([
    ['token_expired', 401, 'expired-session'],
    ['token_revoked', 401, 'expired-session'],
    ['tenant_mismatch', 403, 'tenant-mismatch'],
  ])('normalizes %s', async (code, status, state) => {
    const service = createAuthService(
      createAuthClient({ get: vi.fn().mockRejectedValue(authError(code, status)) }),
    )
    await expect(service.getCurrentUser()).rejects.toMatchObject({ feedback: { state } })
  })
})
