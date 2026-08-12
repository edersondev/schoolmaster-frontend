import { describe, expect, it } from 'vitest'
import {
  ACCOUNT_LIFECYCLE_OPERATION_IDS,
  ACCOUNT_LIFECYCLE_PERMISSIONS,
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
    expect(
      mapAccountLock({ user_id: 'user-1', lock_type: 'administrative', status: 'active' }),
    ).toMatchObject({
      userId: 'user-1',
      lockType: 'administrative',
    })
    expect(mapAccountLifecycleActionRequest({ action: 'lock', reason: ' Support ' })).toEqual({
      reason: 'Support',
    })
    expect(
      mapAccountLifecycleActionRequest({ action: 'unlock', reason: 'ignored' }),
    ).toBeUndefined()
    expect(mapAccountLifecycleActionRequest({ action: 'recover', reason: 'Support' })).toEqual({
      action: 'unlock',
      reason: 'Support',
    })
  })

  it('requires an active exact-code permission in the target scope', () => {
    const target = { id: 'user-1', schoolId: 'school-1', status: 'active' }

    expect(
      deriveAccountLifecycleEligibility({
        actorId: 'admin-1',
        target,
        schoolId: 'school-1',
        permissions: [
          { code: ACCOUNT_LIFECYCLE_PERMISSIONS.manage, scope: 'platform', status: 'active' },
        ],
      }),
    ).toMatchObject({ hasAuthority: false, blocked: true, canLock: false })

    expect(
      deriveAccountLifecycleEligibility({
        actorId: 'admin-1',
        target,
        schoolId: 'school-1',
        permissions: [
          { code: ACCOUNT_LIFECYCLE_PERMISSIONS.manage, scope: 'school', status: 'inactive' },
        ],
      }),
    ).toMatchObject({ hasAuthority: false, blocked: true })

    expect(
      deriveAccountLifecycleEligibility({
        actorId: 'admin-1',
        target,
        schoolId: 'school-1',
        permissions: [
          { code: ACCOUNT_LIFECYCLE_PERMISSIONS.manage, scope: 'school', status: 'active' },
        ],
      }),
    ).toMatchObject({ hasAuthority: true, blocked: false, canLock: true })
  })

  it('recognizes only the exact active System Administrator role as master authority', () => {
    const base = {
      actorId: 'master-1',
      target: { id: 'user-1', status: 'active', schoolId: null },
      permissions: [],
    }

    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        roles: [{ name: 'System Administrator', scope: 'platform', status: 'active' }],
      }),
    ).toMatchObject({ isMaster: true, blocked: false })
    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        roles: [{ name: 'system administrator', scope: 'platform', status: 'active' }],
      }),
    ).toMatchObject({ isMaster: false, blocked: true })
  })

  it('blocks unresolved school, mismatched tenant, self, and unavailable targets', () => {
    const permission = {
      code: ACCOUNT_LIFECYCLE_PERMISSIONS.manage,
      scope: 'school',
      status: 'active',
    }
    const base = {
      actorId: 'admin-1',
      target: { id: 'user-1', schoolId: 'school-1', status: 'active' },
      permissions: [permission],
    }

    expect(deriveAccountLifecycleEligibility(base)).toMatchObject({ blocked: true })
    expect(deriveAccountLifecycleEligibility({ ...base, schoolId: 'school-2' })).toMatchObject({
      blocked: true,
    })
    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        schoolId: 'school-1',
        target: { ...base.target, id: 'admin-1' },
      }),
    ).toMatchObject({ selfTarget: true, blocked: true })
    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        schoolId: 'school-1',
        target: { ...base.target, deletedAt: '2026-08-11T00:00:00Z' },
      }),
    ).toMatchObject({ blocked: true })
  })

  it('derives the action table from current target and lock state', () => {
    const base = {
      actorId: 'admin-1',
      schoolId: 'school-1',
      permissions: [
        { code: ACCOUNT_LIFECYCLE_PERMISSIONS.manage, scope: 'school', status: 'active' },
      ],
    }

    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        target: { id: 'active-1', schoolId: 'school-1', status: 'active' },
        lock: { status: 'active' },
      }),
    ).toMatchObject({ canLock: false, canUnlock: true, canRecover: true, canReactivate: false })
    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        target: { id: 'inactive-1', schoolId: 'school-1', status: 'inactive' },
      }),
    ).toMatchObject({ canLock: false, canUnlock: false, canRecover: false, canReactivate: true })
    expect(
      deriveAccountLifecycleEligibility({
        ...base,
        target: { id: 'invited-1', schoolId: 'school-1', status: 'invited' },
      }),
    ).toMatchObject({ canInvite: true, canLock: false, canReactivate: false })
  })

  it('validates required lock reason only', () => {
    expect(validateAccountLifecycleAction({ action: 'lock', reason: '' })).toHaveProperty('reason')
    expect(validateAccountLifecycleAction({ action: 'unlock', reason: '' })).toEqual({})
  })
})
