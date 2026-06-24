import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue'
import { authGlobalPlugins } from './auth.fixtures'

describe('ForgotPasswordPage', () => {
  it('validates email locally', async () => {
    const wrapper = mount(ForgotPasswordPage, { global: { plugins: authGlobalPlugins() } })
    await wrapper.get('input[name="email"]').setValue('invalid')
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Enter a valid email address')
    expect(wrapper.text().match(/Enter a valid email address/g)).toHaveLength(1)
  })

  it('shows neutral confirmation', async () => {
    const request = vi.fn().mockResolvedValue({ accepted: true })
    const wrapper = mount(ForgotPasswordPage, {
      global: { plugins: authGlobalPlugins(), provide: { passwordResetAction: request } },
    })
    await wrapper.get('input[name="email"]').setValue('avery@example.com')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('If the address can receive recovery email')
  })
})
