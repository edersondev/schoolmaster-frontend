import { describe, expect, it, vi } from 'vitest'
import { shallowRef } from 'vue'
import { usePasswordResetCompletion } from '@/composables/auth/usePasswordResetCompletion'
import { validToken } from '../fixtures'

describe('account lifecycle no automatic sign-in', () => {
  it('only clears stale assumptions after reset completion', async () => {
    const service = { completePasswordReset: vi.fn().mockResolvedValue({ userId: 'user-1' }) }
    const clearSession = vi.fn()
    const completion = usePasswordResetCompletion({
      token: shallowRef(validToken),
      service,
      onSuccess: clearSession,
    })

    await completion.submit({ password: 'valid-password' })
    expect(clearSession).toHaveBeenCalled()
    expect(completion.feedback.value.recoveryAction).toBe('sign-in')
  })
})

