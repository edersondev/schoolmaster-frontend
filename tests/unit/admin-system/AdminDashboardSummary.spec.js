import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminDashboardSummaryCard from '@/components/admin-system/dashboard/AdminDashboardSummaryCard.vue'
import {
  DASHBOARD_PLACEHOLDER_STATES,
  dashboardSummaryCards,
} from '@/contracts/admin-system/dashboard'
import { adminGlobalPlugins } from './shell.fixtures'

describe('AdminDashboardSummaryCard', () => {
  it('renders placeholder-only summary card states', () => {
    const wrapper = mount(AdminDashboardSummaryCard, {
      props: {
        card: {
          ...dashboardSummaryCards[0],
          state: DASHBOARD_PLACEHOLDER_STATES.unavailable,
        },
      },
      global: {
        plugins: adminGlobalPlugins(),
      },
    })

    expect(wrapper.text()).toContain('Schools')
    expect(wrapper.text()).toContain('Unavailable')
    expect(wrapper.text()).toContain('Contract required before live values can be shown.')
  })
})
