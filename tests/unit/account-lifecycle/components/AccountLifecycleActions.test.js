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
          canDeliverPassword: true,
        },
      },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.text()).toContain('Unlock account')
    expect(wrapper.text()).toContain('Recover account')
    expect(wrapper.text()).not.toContain('Lock account')
    expect(wrapper.text()).toContain('Send password link')
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('action')?.[0]).toEqual(['unlock'])
  })

  it('emits delivery intent and renders only safe feedback', async () => {
    const wrapper = mount(AccountLifecycleActions, {
      props: {
        eligibility: { blocked: false, canDeliverPassword: true },
        delivery: {
          status: 'requested',
          deliveryChannel: 'email',
          deliveryRequestedAt: '2026-08-26T12:00:00Z',
          token: 'must-not-render',
          email: 'must-not-render@example.test',
        },
      },
      global: { plugins: lifecyclePlugins() },
    })

    await wrapper.get('[data-test="password-delivery-action"]').trigger('click')
    expect(wrapper.emitted('password-delivery')).toHaveLength(1)
    expect(wrapper.get('[data-test="password-delivery-result"]').text()).toContain(
      'Password email submission accepted',
    )
    expect(wrapper.text()).not.toContain('must-not-render')
    expect(wrapper.text()).not.toContain('must-not-render@example.test')
  })

  it('renders safe limit and unavailable feedback without private diagnostics', () => {
    const wrapper = mount(AccountLifecycleActions, {
      props: {
        eligibility: { blocked: false, canDeliverPassword: true },
        deliveryError: {
          type: 'rate-limited',
          code: 'password_delivery_rate_limited',
          provider: 'private-provider',
        },
      },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.text()).toContain('Password delivery is temporarily limited')
    expect(wrapper.text()).not.toContain('private-provider')
  })

  it('restores keyboard focus after password delivery finishes', async () => {
    const wrapper = mount(AccountLifecycleActions, {
      attachTo: document.body,
      props: {
        eligibility: { blocked: false, canDeliverPassword: true },
      },
      global: { plugins: lifecyclePlugins() },
    })
    const button = wrapper.get('[data-test="password-delivery-action"]')

    button.element.focus()
    await wrapper.setProps({ deliveryPending: true })
    button.element.blur()
    await wrapper.setProps({ deliveryPending: false })

    expect(document.activeElement).toBe(button.element)
    wrapper.unmount()
  })

  it('unmounts when blocked', () => {
    const wrapper = mount(AccountLifecycleActions, {
      props: { eligibility: { blocked: true } },
      global: { plugins: lifecyclePlugins() },
    })
    expect(wrapper.find('section').exists()).toBe(false)
  })
})
