import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { useInvitationSetup } from '@/composables/auth/useInvitationSetup'
import { lifecycleError, validToken } from '../fixtures'

describe('useInvitationSetup', () => {
  it('handles success, validation, invalid token, and stale responses', async () => {
    const service = {
      completeAccountInvitation: vi.fn().mockResolvedValue({ userId: 'user-1', status: 'active' }),
    }
    const token = shallowRef(validToken)
    const setup = useInvitationSetup({ token, service })

    await setup.submit({ password: 'short' })
    expect(setup.feedback.value.state).toBe('validation')

    await setup.submit({ password: 'valid-password' })
    expect(setup.feedback.value.state).toBe('success')

    token.value = 'bad'
    await nextTick()
    expect(setup.feedback.value.state).toBe('invalid-token')

    const deferred = Promise.resolve({ userId: 'old' })
    service.completeAccountInvitation = vi.fn().mockReturnValue(deferred)
    token.value = validToken
    await nextTick()
    const promise = setup.submit({ password: 'valid-password' })
    token.value = `${validToken}x`
    await promise
    expect(setup.result.value).toBe(null)
  })

  it('maps server invalid token without exposing token', async () => {
    const setup = useInvitationSetup({
      token: shallowRef(validToken),
      service: {
        completeAccountInvitation: vi.fn().mockRejectedValue({
          feedback: { state: 'invalid-token' },
          fieldErrors: {},
          diagnostic: lifecycleError('token_expired', 401),
        }),
      },
    })

    await expect(setup.submit({ password: 'valid-password' })).rejects.toMatchObject({
      feedback: { state: 'invalid-token' },
    })
  })
})

