import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import LoginPage from '@/pages/auth/LoginPage.vue'
import { authGlobalPlugins } from './auth.fixtures'

describe('LoginPage', () => {
  it('validates fields before calling the store', async () => {
    const wrapper = mount(LoginPage, { global: { plugins: authGlobalPlugins() } })

    await wrapper.get('button').trigger('click')

    expect(wrapper.text()).toContain('Enter a valid email address')
    expect(wrapper.text()).toContain('Use at least 8 characters')
    expect(wrapper.text().match(/Enter a valid email address/g)).toHaveLength(1)
    expect(wrapper.text().match(/Use at least 8 characters/g)).toHaveLength(1)
  })

  it('renders contract-safe denial feedback', async () => {
    const login = vi.fn().mockRejectedValue({
      feedback: { state: 'invalid-credentials', messageKey: 'feedback.invalidCredentials' },
    })
    const wrapper = mount(LoginPage, {
      global: { plugins: authGlobalPlugins(), provide: { authLoginAction: login } },
    })

    await wrapper.get('input[name="email"]').setValue('avery@example.com')
    await wrapper.get('input[name="password"]').setValue('password123')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('The email or password could not be accepted')
    expect(wrapper.text()).not.toContain('Unsafe backend message')
  })
})
