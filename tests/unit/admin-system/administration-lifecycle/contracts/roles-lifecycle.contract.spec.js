import { describe, expect, it } from 'vitest'
import { mapRoleUpdateRequest } from '@/contracts/admin-system/access'

describe('role lifecycle contract', () => {
  it('maps permission assignments and blocks scope editing', () => {
    expect(mapRoleUpdateRequest({ name: 'Ops', scope: 'platform', permissionIds: ['p1'] })).toEqual({ name: 'Ops', permission_ids: ['p1'] })
  })
})
