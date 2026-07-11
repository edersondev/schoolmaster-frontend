import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('AdminRowActions', () => {
  it('hides unauthorized empty actions and renders authorized menu button', () => {
    const empty = mount(AdminRowActions, { global: { plugins: administrationPlugins() } })
    expect(empty.find('button').exists()).toBe(false)
    const wrapper = mount(AdminRowActions, {
      props: { actions: ['deactivate'] },
      global: { plugins: administrationPlugins() },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders an icon for each menu action', () => {
    const wrapper = mount(AdminRowActions, {
      props: {
        actions: [
          { key: 'edit', command: 'edit', label: 'Edit' },
          'deactivate',
          'delete',
          'restore',
        ],
      },
      global: { plugins: administrationPlugins() },
    })

    const menuItems = wrapper.findAllComponents({ name: 'ElDropdownItem' })
    expect(menuItems).toHaveLength(4)
    expect(menuItems.every((item) => item.findComponent({ name: 'ElIcon' }).exists())).toBe(true)
    expect(menuItems[2].findComponent({ name: 'ElIcon' }).classes()).toContain('!text-red-600')
    expect(menuItems[2].find('span').classes()).toContain('!text-red-600')
  })
})
