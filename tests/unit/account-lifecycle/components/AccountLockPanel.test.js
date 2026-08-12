import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountLockPanel from '@/components/admin-system/users/AccountLockPanel.vue'
import { lifecyclePlugins } from '../fixtures'

describe('AccountLockPanel', () => {
  it('renders only approved safe lock metadata', () => {
    const wrapper = mount(AccountLockPanel, {
      props: {
        lock: {
          status: 'active',
          lockType: 'administrative',
          reason: 'Security review',
          lockedAt: '2026-08-11T00:00:00Z',
          privateDiagnostic: 'must-not-render',
        },
      },
      global: { plugins: lifecyclePlugins() },
    })
    expect(wrapper.text()).toContain('Security review')
    expect(wrapper.text()).toContain('administrative')
    expect(wrapper.text()).not.toContain('must-not-render')
  })

  it('unmounts when hidden', () => {
    const wrapper = mount(AccountLockPanel, {
      props: { hidden: true },
      global: { plugins: lifecyclePlugins() },
    })
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
