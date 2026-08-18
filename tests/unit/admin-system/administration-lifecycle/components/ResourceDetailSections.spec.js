import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RoleDetailSections from '@/components/admin-system/roles/RoleDetailSections.vue'
import SchoolDetailSections from '@/components/admin-system/schools/SchoolDetailSections.vue'
import UserEditFields from '@/components/admin-system/users/UserEditFields.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('resource lifecycle detail/edit sections', () => {
  it('renders display-only status in details and no status edit control in user edit fields', () => {
    const detail = mount(SchoolDetailSections, {
      props: {
        record: { name: 'North', cnpj: '56563930000108', status: 'active', addressLabel: null },
      },
      global: { plugins: administrationPlugins() },
    })
    expect(detail.text()).toContain('Active')

    const edit = mount(UserEditFields, {
      props: {
        modelValue: { fullName: '', email: '', roleIds: [] },
        roles: [],
      },
      global: { plugins: administrationPlugins() },
    })
    expect(edit.text()).not.toContain('Status')
  })

  it('renders role permissions as a responsive four-column grid with descriptions', () => {
    const detail = mount(RoleDetailSections, {
      props: {
        record: {
          name: 'Director',
          scope: 'school',
          status: 'active',
          permissions: [
            { id: 'permission-1', code: 'users.view', name: 'View users' },
            { id: 'permission-2', code: 'users.manage', name: 'Manage users' },
          ],
        },
      },
      global: { plugins: administrationPlugins() },
    })

    expect(detail.find('table').exists()).toBe(false)
    expect(detail.find('ul').exists()).toBe(false)
    expect(detail.get('[data-test="permission-grid"]').classes()).toEqual(
      expect.arrayContaining(['grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4']),
    )
    expect(detail.findAll('[data-test="permission-card"]')).toHaveLength(2)
    expect(detail.findAll('[data-test="permission-card"]')[0].text()).toContain('users.view')
    expect(detail.findAll('[data-test="permission-card"]')[0].text()).toContain('View users')
  })
})
