import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { usePasswordResetCompletion } from '@/composables/auth/usePasswordResetCompletion'
import { validToken } from '../fixtures'

describe('usePasswordResetCompletion', () => {
  it('handles malformed token, success, stale response, and sign-in recovery callback', async () => {
    const onSuccess = vi.fn()
    const service = {
      completePasswordReset: vi.fn().mockResolvedValue({ userId: 'user-1' }),
    }
    const token = shallowRef('bad')
    const completion = usePasswordResetCompletion({ token, service, onSuccess })

    expect(completion.feedback.value.state).toBe('invalid-token')
    token.value = validToken
    await nextTick()
    await completion.submit({ password: 'valid-password' })
    expect(completion.feedback.value.state).toBe('success')
    expect(onSuccess).toHaveBeenCalled()
  })

  it('maps server invalid token response', async () => {
    const completion = usePasswordResetCompletion({
      token: shallowRef(validToken),
      service: {
        completePasswordReset: vi.fn().mockRejectedValue({
          feedback: { state: 'invalid-token' },
          fieldErrors: {},
        }),
      },
    })

    await expect(completion.submit({ password: 'valid-password' })).rejects.toMatchObject({
      feedback: { state: 'invalid-token' },
    })
  })
})

