import { describe, expect, it } from 'vitest'
import {
  createAccountLifecycleFeedbackState,
  isMalformedLifecycleToken,
  mapAccountInvitation,
  mapInvitationSetupRequest,
  mapPasswordResetCompletionRequest,
  mapPasswordResetRequest,
  validateLifecyclePassword,
} from '@/contracts/auth/account-lifecycle'

describe('auth account lifecycle contract', () => {
  it('maps invitations without token fields', () => {
    const mapped = mapAccountInvitation({
      id: 'inv-1',
      user_id: 'user-1',
      school_id: 'school-1',
      scope: 'school',
      status: 'pending',
      expires_at: '2026-06-30T00:00:00Z',
      delivery_channel: 'email',
      delivery_requested_at: '2026-06-29T00:00:00Z',
      invitation_token: 'secret',
    })

    expect(mapped).toEqual(
      expect.objectContaining({ userId: 'user-1', schoolId: 'school-1' }),
    )
    expect(mapped.invitationToken).toBeUndefined()
  })

  it('maps guest requests using approved fields only', () => {
    expect(
      mapPasswordResetRequest({
        email: ' avery@example.com ',
        schoolId: 'blocked',
        delivery_metadata: { ip: 'blocked' },
      }),
    ).toEqual({ email: 'avery@example.com' })
    expect(mapInvitationSetupRequest({ password: 'long-password' })).toEqual({
      password: 'long-password',
    })
    expect(mapPasswordResetCompletionRequest({ token: ' token ', password: 'long-password' })).toEqual(
      { token: 'token', password: 'long-password' },
    )
  })

  it('validates password and token boundaries', () => {
    expect(validateLifecyclePassword('short')).toContain('Use at least 12 characters.')
    expect(validateLifecyclePassword('a'.repeat(129))).toContain('Use 128 characters or fewer.')
    expect(validateLifecyclePassword('valid-password')).toEqual([])
    expect(isMalformedLifecycleToken('short')).toBe(true)
    expect(isMalformedLifecycleToken('a'.repeat(32))).toBe(false)
  })

  it('creates safe feedback metadata', () => {
    expect(createAccountLifecycleFeedbackState('invalid-token')).toMatchObject({
      severity: 'warning',
      recoveryAction: 'request-reset',
    })
  })
})

