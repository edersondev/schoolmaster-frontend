import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UserForm from '@/components/admin-system/users/UserForm.vue'
import UserTable from '@/components/admin-system/users/UserTable.vue'
import RoleForm from '@/components/admin-system/roles/RoleForm.vue'
import RoleEditFields from '@/components/admin-system/roles/RoleEditFields.vue'
import RolePermissionsDialog from '@/components/admin-system/roles/RolePermissionsDialog.vue'
import RoleTable from '@/components/admin-system/roles/RoleTable.vue'
import PermissionTable from '@/components/admin-system/permissions/PermissionTable.vue'
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
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
        permissions: [
          { id: 'permission-1', name: 'Permission 1' },
          { id: 'permission-2', name: 'Permission 2' },
        ],
      },
      global: { plugins: administrationPlugins() },
    })
    expect(role.text()).toContain('fixed to current school')
    expect(role.text()).not.toContain('Page 1 of')
    expect(role.text()).not.toContain('Previous')
    expect(role.text()).not.toContain('Next')
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

  it('renders Edit Role permission choices without pagination controls', () => {
    const roleEdit = mount(RoleEditFields, {
      props: {
        modelValue: { name: 'Teacher', permissionIds: ['permission-1'] },
        permissions: [
          { id: 'permission-1', name: 'Permission 1' },
          { id: 'permission-2', name: 'Permission 2' },
        ],
      },
      global: { plugins: administrationPlugins() },
    })

    expect(roleEdit.text()).not.toContain('Page 1 of')
    expect(roleEdit.text()).not.toContain('Previous')
    expect(roleEdit.text()).not.toContain('Next')
  })

  it('moves role permissions from the list column into a read-only dialog action', () => {
    const role = {
      id: 'role-1',
      name: 'Director',
      scope: 'school',
      status: 'active',
      permissions: [
        { id: 'permission-1', code: 'users.view', name: 'View users' },
        { id: 'permission-2', code: 'users.manage', name: 'Manage users' },
      ],
    }
    const roleTable = mount(RoleTable, {
      props: {
        rows: [role],
        canManage: false,
      },
      global: { plugins: administrationPlugins() },
    })

    expect(roleTable.findComponent(AdminDataTable).props('columns')).not.toContainEqual(
      expect.objectContaining({ prop: 'permissions' }),
    )
    expect(roleTable.findComponent(AdminRowActions).props('actions')).toContainEqual(
      expect.objectContaining({
        command: 'listPermissions',
        label: 'List permissions',
      }),
    )

    roleTable.findComponent(AdminRowActions).vm.$emit('action', 'listPermissions')
    expect(roleTable.emitted('permissions')).toHaveLength(1)

    const dialog = mount(RolePermissionsDialog, {
      props: { open: true, role },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          ElDialog: {
            name: 'ElDialog',
            props: ['modelValue', 'title'],
            emits: ['update:modelValue', 'closed'],
            template: '<section><slot /><slot name="footer" /></section>',
          },
        },
      },
    })
    expect(dialog.findComponent({ name: 'ElDialog' }).props('title')).toBe('Director permissions')
    expect(dialog.find('table').exists()).toBe(false)
    expect(dialog.find('ul').exists()).toBe(false)
    expect(dialog.get('[data-test="permission-grid"]').classes()).toEqual(
      expect.arrayContaining(['grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4']),
    )
    expect(dialog.findAll('[data-test="permission-card"]')).toHaveLength(2)
    expect(dialog.findAll('[data-test="permission-card"]')[0].text()).toContain('users.view')
    expect(dialog.findAll('[data-test="permission-card"]')[0].text()).toContain('View users')
  })
})
