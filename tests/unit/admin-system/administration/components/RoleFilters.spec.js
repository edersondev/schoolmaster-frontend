import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RoleFilters from '@/components/admin-system/roles/RoleFilters.vue'
import AdminFilterBar from '@/components/ui/admin/AdminFilterBar.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('RoleFilters', () => {
  it('uses the shared users-page filter style with role-supported status filtering', () => {
    const wrapper = mount(RoleFilters, {
      props: { status: 'active' },
      global: { plugins: administrationPlugins() },
    })
    const filterBar = wrapper.findComponent(AdminFilterBar)

    expect(filterBar.props()).toMatchObject({ status: 'active', showStatus: true })
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Reset filters')
    expect(wrapper.text()).not.toContain('INEP code')
    expect(wrapper.text()).not.toContain('CNPJ')
    expect(wrapper.text()).not.toContain('City')
  })

  it('forwards status and reset events from the shared filter bar', async () => {
    const wrapper = mount(RoleFilters, {
      global: { plugins: administrationPlugins() },
    })
    const filterBar = wrapper.findComponent(AdminFilterBar)

    filterBar.vm.$emit('update:status', 'active')
    filterBar.vm.$emit('reset')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:status')).toEqual([['active']])
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})
