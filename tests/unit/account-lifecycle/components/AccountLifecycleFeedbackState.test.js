import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountLifecycleTokenState from '@/components/auth/AccountLifecycleTokenState.vue'
import AccountLifecycleSuccessState from '@/components/auth/AccountLifecycleSuccessState.vue'
import { lifecyclePlugins } from '../fixtures'

describe('account lifecycle feedback states', () => {
  it('renders invalid-token recovery accessibly', () => {
    const wrapper = mount(AccountLifecycleTokenState, {
      props: {
        feedback: {
          state: 'invalid-token',
          messageKey: 'feedback.invalidToken',
          recoveryAction: 'request-reset',
        },
      },
      global: { plugins: lifecyclePlugins() },
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.text()).toContain('This link cannot be used')
    expect(wrapper.text()).toContain('Request a new link')
  })

  it('renders success without automatic sign-in', () => {
    const wrapper = mount(AccountLifecycleSuccessState, {
      global: {
        plugins: lifecyclePlugins(),
        stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } },
      },
    })
    expect(wrapper.text()).toContain('Password setup complete')
    expect(wrapper.text()).toContain('Go to sign in')
  })
})
