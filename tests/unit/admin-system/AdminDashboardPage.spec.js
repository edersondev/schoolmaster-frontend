import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminDashboardPage from '@/pages/admin-system/dashboard/AdminDashboardPage.vue'
import { adminGlobalPlugins } from './shell.fixtures'

describe('AdminDashboardPage', () => {
  it('renders placeholder-only activity and notification regions without live data', () => {
    const wrapper = mount(AdminDashboardPage, {
      global: {
        plugins: adminGlobalPlugins(),
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a href="#"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('No approved activity source is connected in this slice.')
    expect(wrapper.text()).toContain('No notification contract is approved yet.')
    expect(wrapper.text()).not.toContain('Coming soon')
  })
})
