import { describe, expect, it } from 'vitest'
import { normalizeAuthError } from '@/services/auth/authErrorMapper'
import { authError } from './auth.fixtures'

describe('auth session error mapping', () => {
  it.each([
    ['token_expired', 'expired-session'],
    ['token_revoked', 'expired-session'],
    ['forbidden', 'forbidden'],
    ['tenant_mismatch', 'tenant-mismatch'],
    ['inactive_user', 'inactive-user'],
    ['inactive_school', 'inactive-school'],
  ])('maps %s without exposing backend text', (code, state) => {
    const normalized = normalizeAuthError(authError(code, code === 'forbidden' ? 403 : 401))
    expect(normalized.feedback.state).toBe(state)
    expect(normalized.message).not.toContain('Unsafe backend message')
  })
})
