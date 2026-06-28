import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminBulkActionBar from '@/components/ui/admin/AdminBulkActionBar.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('AdminBulkActionBar', () => {
  it('renders selected count, max warning, and clear action', async () => {
    const wrapper = mount(AdminBulkActionBar, {
      props: { selectedCount: 51, actions: ['deactivate'], overLimit: true },
      global: { plugins: administrationPlugins() },
    })
    expect(wrapper.text()).toContain('51 selected')
    expect(wrapper.text()).toContain('Select no more than 50 records.')
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })
})
