import { describe, expect, it } from 'vitest'
import { mapUserUpdateRequest } from '@/contracts/admin-system/users'

describe('user lifecycle contract', () => {
  it('maps role assignments and omits status/direct permissions', () => {
    expect(mapUserUpdateRequest({ fullName: 'A', email: 'a@example.test', status: 'inactive', roleIds: ['r1'] })).toEqual({ full_name: 'A', email: 'a@example.test', role_ids: ['r1'] })
  })
})
