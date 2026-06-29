import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '@/components/admin-system/users/UserForm.vue'
import UserTable from '@/components/admin-system/users/UserTable.vue'
import RoleForm from '@/components/admin-system/roles/RoleForm.vue'
import PermissionTable from '@/components/admin-system/permissions/PermissionTable.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('access administration components', () => {
  it('uses role-only users, school-fixed roles, read-only permissions', () => {
    const user = mount(UserForm, {
      props: {
        modelValue: { fullName: '', email: '', status: 'active', roleIds: [] },
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

  it('shows user edit-only status and forwards table sort/actions to its parent', async () => {
    const userForm = mount(UserForm, {
      props: {
        modelValue: { fullName: '', email: '', status: 'active', roleIds: [] },
        showStatus: true,
      },
      global: { plugins: administrationPlugins() },
    })
    expect(userForm.text()).toContain('Status')

    const userTable = mount(UserTable, {
      props: {
        canManage: true,
        actionResolver: () => ['delete'],
        rows: [{ id: 'user-1', fullName: 'Ada', email: 'ada@example.test', roles: [] }],
      },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          ElTable: {
            emits: ['sort-change'],
            template: `
              <div>
                <button
                  data-test="sort-user"
                  @click="$emit('sort-change', { prop: 'email', order: 'descending' })"
                >Sort</button>
                <slot />
              </div>
            `,
          },
          ElTableColumn: {
            template: `
              <div>
                <slot
                  :row="{
                    id: 'user-1',
                    fullName: 'Ada',
                    email: 'ada@example.test',
                    status: 'active',
                    roles: []
                  }"
                />
              </div>
            `,
          },
        },
      },
    })

    await userTable.get('[data-test="sort-user"]').trigger('click')
    await userTable.get('[data-test="edit-user"]').trigger('click')
    userTable.findComponent(AdminRowActions).vm.$emit('action', 'delete')

    expect(userTable.emitted('sort')).toEqual([[{ prop: 'email', order: 'descending' }]])
    expect(userTable.emitted('edit')[0][0].id).toBe('user-1')
    expect(userTable.emitted('lifecycle')[0][0]).toMatchObject({
      row: expect.objectContaining({ id: 'user-1' }),
      action: 'delete',
    })
  })
})
