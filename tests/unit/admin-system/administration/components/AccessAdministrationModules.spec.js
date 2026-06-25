import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '@/components/admin-system/users/UserForm.vue'
import RoleForm from '@/components/admin-system/roles/RoleForm.vue'
import PermissionTable from '@/components/admin-system/permissions/PermissionTable.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('access administration components', () => {
  it('uses role-only users, school-fixed roles, read-only permissions', () => {
    const user = mount(UserForm, {
      props: {
        modelValue: { fullName: '', email: '', roleIds: [] },
        roles: [{ id: 'role', name: 'Role' }],
        lookupMeta: { page: 1, perPage: 1, total: 2 },
      },
      global: { plugins: administrationPlugins() },
    })
    expect(user.text()).toContain('Roles')
    expect(user.text()).toContain('Page 1 of 2')
    expect(user.text()).not.toContain('Permissions')
    const role = mount(RoleForm, {
      props: {
        modelValue: { name: '', permissionIds: [] },
        permissions: [{ id: 'permission', name: 'Permission' }],
        lookupMeta: { page: 1, perPage: 1, total: 2 },
      },
      global: { plugins: administrationPlugins() },
    })
    expect(role.text()).toContain('fixed to current school')
    expect(role.text()).toContain('Page 1 of 2')
    const permissions = mount(PermissionTable, {
      props: { rows: [] },
      global: { plugins: administrationPlugins() },
    })
    expect(permissions.text()).not.toContain('Create')
  })
})
