import { describe, expect, it } from 'vitest'
import { normalizeAuthError } from '@/services/auth/authErrorMapper'
import { lifecycleError } from '../fixtures'

describe('account lifecycle auth integration', () => {
  it.each([
    ['inactive_user', 'inactive-user'],
    ['auth_locked', 'lockout'],
    ['token_expired', 'expired-session'],
    ['forbidden', 'forbidden'],
    ['inactive_school', 'inactive-school'],
    ['tenant_mismatch', 'tenant-mismatch'],
  ])('preserves %s mapping', (code, state) => {
    expect(normalizeAuthError(lifecycleError(code, 403)).feedback.state).toBe(state)
  })
})

