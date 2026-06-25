import { describe, expect, it } from 'vitest'
import {
  createRoleForm,
  isSchoolPermission,
  mapRoleCreateRequest,
} from '@/contracts/admin-system/access'
import { createUserForm, mapUserCreateRequest } from '@/contracts/admin-system/users'

describe('access contracts', () => {
  it('maps users by role and roles with fixed school scope', () => {
    expect(mapUserCreateRequest({ ...createUserForm(), fullName: 'A', email: 'a@b.test' })).toEqual(
      {
        full_name: 'A',
        email: 'a@b.test',
        role_ids: [],
      },
    )
    expect(mapRoleCreateRequest({ ...createRoleForm(), name: 'Admin' }).scope).toBe('school')
    expect(isSchoolPermission({ scope: 'school', status: 'active' })).toBe(true)
  })
})
