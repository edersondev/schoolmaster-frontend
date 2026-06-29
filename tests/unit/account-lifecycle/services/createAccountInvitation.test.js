import { describe, expect, it } from 'vitest'
import { mapAccountInvitationCreateRequest } from '@/contracts/admin-system/account-lifecycle'

describe('create account invitation request', () => {
  it('never includes delivery metadata', () => {
    const request = mapAccountInvitationCreateRequest({
      scope: 'school',
      schoolId: 'school-1',
      fullName: 'Avery',
      email: 'avery@example.com',
      roleIds: ['role-1'],
      delivery_metadata: { provider: 'blocked' },
      deliveryMetadata: { provider: 'blocked' },
    })

    expect(request).toEqual({
      scope: 'school',
      school_id: 'school-1',
      full_name: 'Avery',
      email: 'avery@example.com',
      role_ids: ['role-1'],
    })
  })
})

