import { describe, expect, it } from 'vitest'
import {
  createRoleForm,
  isSchoolPermission,
  mapRoleCreateRequest,
  validateRoleForm,
} from '@/contracts/admin-system/access'
import {
  createUserForm,
  mapUserCreateRequest,
  mapUserTableSort,
  validateUserForm,
} from '@/contracts/admin-system/users'

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

  it('maps Element Plus user table sorting to approved API fields', () => {
    expect(mapUserTableSort({ prop: 'fullName', order: 'ascending' })).toBe('full_name')
    expect(mapUserTableSort({ prop: 'email', order: 'descending' })).toBe('-email')
    expect(mapUserTableSort({ prop: 'roles', order: 'ascending' })).toBe('')
    expect(mapUserTableSort({ prop: 'status', order: null })).toBe('')
  })

  it('validates required user and role create inputs before submit', () => {
    expect(validateUserForm(createUserForm())).toEqual({
      full_name: ['Full name is required.'],
      email: ['Email is required.'],
      role_ids: ['Select at least one role.'],
    })
    expect(
      validateUserForm({ ...createUserForm(), fullName: 'A', email: 'invalid', roleIds: ['1'] }),
    ).toEqual({
      email: ['Enter a valid email address.'],
    })
    expect(validateRoleForm(createRoleForm())).toEqual({
      name: ['Role name is required.'],
      permission_ids: ['Select at least one permission.'],
    })
  })
})
