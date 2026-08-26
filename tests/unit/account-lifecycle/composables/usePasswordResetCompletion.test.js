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

  it('keeps a valid delivery token retryable after password validation and stores no password', async () => {
    const service = {
      completePasswordReset: vi.fn().mockResolvedValue({
        userId: 'user-1',
        status: 'active',
        action: 'password_reset_completed',
      }),
    }
    const completion = usePasswordResetCompletion({ token: shallowRef(validToken), service })

    await expect(completion.submit({ password: 'short' })).resolves.toBeNull()
    expect(service.completePasswordReset).not.toHaveBeenCalled()
    expect(completion.tokenInvalid.value).toBe(false)

    await expect(completion.submit({ password: 'valid-delivery-password' })).resolves.toMatchObject(
      {
        action: 'password_reset_completed',
      },
    )
    expect(service.completePasswordReset).toHaveBeenCalledWith({
      token: validToken,
      password: 'valid-delivery-password',
    })
    expect(completion.result.value).not.toHaveProperty('token')
    expect(completion.result.value).not.toHaveProperty('password')
  })

  it('discards a delivery completion response after the route token changes', async () => {
    let resolveCompletion
    const token = shallowRef(validToken)
    const completion = usePasswordResetCompletion({
      token,
      service: {
        completePasswordReset: vi.fn(
          () =>
            new Promise((resolve) => {
              resolveCompletion = resolve
            }),
        ),
      },
    })

    const pending = completion.submit({ password: 'valid-delivery-password' })
    token.value = `${validToken}changed`
    await nextTick()
    resolveCompletion({ userId: 'stale-user' })

    await expect(pending).resolves.toBeNull()
    expect(completion.result.value).toBeNull()
  })
})
