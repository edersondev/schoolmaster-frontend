import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminQuickActions from '@/components/admin-system/dashboard/AdminQuickActions.vue'
import { ADMIN_QUICK_ACTIONS } from '@/contracts/admin-system/navigation'
import { adminGlobalPlugins } from './shell.fixtures'

describe('AdminQuickActions', () => {
  it('renders approved quick action navigation behavior', () => {
    const wrapper = mount(AdminQuickActions, {
      props: {
        actions: ADMIN_QUICK_ACTIONS,
      },
      global: {
        plugins: adminGlobalPlugins(),
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a data-test="quick-action" href="#"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.find('[data-test="quick-action"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Open dashboard')
  })
})
