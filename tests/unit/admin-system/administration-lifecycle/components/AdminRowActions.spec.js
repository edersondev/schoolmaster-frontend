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
})
