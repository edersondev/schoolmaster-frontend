import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountLifecycleActions from '@/components/admin-system/users/AccountLifecycleActions.vue'
import { lifecyclePlugins } from '../fixtures'

describe('AccountLifecycleActions', () => {
  it('renders only eligible current actions and emits intent', async () => {
    const wrapper = mount(AccountLifecycleActions, {
      props: {
        eligibility: {
          blocked: false,
          canLock: false,
          canUnlock: true,
          canRecover: true,
          canReactivate: false,
        },
      },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.text()).toContain('Unlock account')
    expect(wrapper.text()).toContain('Recover account')
    expect(wrapper.text()).not.toContain('Lock account')
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('action')?.[0]).toEqual(['unlock'])
  })

  it('unmounts when blocked', () => {
    const wrapper = mount(AccountLifecycleActions, {
      props: { eligibility: { blocked: true } },
      global: { plugins: lifecyclePlugins() },
    })
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
