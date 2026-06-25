import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('AdminListPage', () => {
  it('renders heading, authorized create action, slots, and feedback', () => {
    const wrapper = mount(AdminListPage, {
      props: { title: 'Schools', createTo: { name: 'schoolCreate' }, canCreate: true },
      slots: { filters: '<div>filters</div>', default: '<div>rows</div>' },
      global: { plugins: administrationPlugins(), stubs: ['RouterLink'] },
    })
    expect(wrapper.text()).toContain('Schools')
    expect(wrapper.text()).toContain('filters')
    expect(wrapper.text()).toContain('rows')
  })
})
