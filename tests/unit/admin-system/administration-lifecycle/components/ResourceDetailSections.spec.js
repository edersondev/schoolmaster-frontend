import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolDetailSections from '@/components/admin-system/schools/SchoolDetailSections.vue'
import UserEditFields from '@/components/admin-system/users/UserEditFields.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('resource lifecycle detail/edit sections', () => {
  it('renders display-only status in details and no status edit control in user edit fields', () => {
    const detail = mount(SchoolDetailSections, {
      props: { record: { name: 'North', cnpj: '56563930000108', status: 'active', addressLabel: null } },
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
})
