import { describe, expect, it } from 'vitest'
import {
  ACCOUNT_LIFECYCLE_OPERATION_IDS,
  BLOCKED_ADMIN_INVITATION_RESEND,
  deriveAccountLifecycleEligibility,
  mapAccountInvitationCreateRequest,
  mapAccountLifecycleActionRequest,
  mapAccountLock,
  validateAccountLifecycleAction,
} from '@/contracts/admin-system/account-lifecycle'

describe('admin account lifecycle contract', () => {
  it('declares approved operation IDs and blocked resend', () => {
    expect(ACCOUNT_LIFECYCLE_OPERATION_IDS.createInvitation).toBe('createAccountInvitation')
    expect(BLOCKED_ADMIN_INVITATION_RESEND).toMatchObject({
      blocked: true,
      operationId: 'resendAccountInvitation',
    })
  })

  it('omits delivery metadata from invitation requests', () => {
    expect(
      mapAccountInvitationCreateRequest({
        scope: 'school',
        schoolId: 'school-1',
        fullName: ' Avery ',
        email: ' avery@example.com ',
        roleIds: ['role-1'],
        delivery_metadata: { blocked: true },
      }),
    ).toEqual({
      scope: 'school',
      school_id: 'school-1',
      full_name: 'Avery',
      email: 'avery@example.com',
      role_ids: ['role-1'],
    })
  })

  it('maps lock and action requests', () => {
    expect(mapAccountLock({ user_id: 'user-1', lock_type: 'administrative', status: 'active' })).toMatchObject({
      userId: 'user-1',
      lockType: 'administrative',
    })
    expect(mapAccountLifecycleActionRequest({ action: 'lock', reason: ' Support ' })).toEqual({
      reason: 'Support',
    })
    expect(mapAccountLifecycleActionRequest({ action: 'unlock', reason: 'ignored' })).toBeUndefined()
    expect(mapAccountLifecycleActionRequest({ action: 'recover', reason: 'Support' })).toEqual({
      action: 'unlock',
      reason: 'Support',
    })
  })

  it('keeps eligibility blocked until permission source is confirmed', () => {
    expect(
      deriveAccountLifecycleEligibility({
        target: { id: 'user-1', status: 'active' },
        permissions: ['*'],
        schoolReady: true,
      }),
    ).toMatchObject({ sourceConfirmed: false, blocked: true, canLock: false })
  })

  it('validates required lock reason only', () => {
    expect(validateAccountLifecycleAction({ action: 'lock', reason: '' })).toHaveProperty('reason')
    expect(validateAccountLifecycleAction({ action: 'unlock', reason: '' })).toEqual({})
  })
})

