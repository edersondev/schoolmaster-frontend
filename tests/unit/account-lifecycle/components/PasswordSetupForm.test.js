import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordSetupForm from '@/components/auth/PasswordSetupForm.vue'
import { lifecyclePlugins } from '../fixtures'

describe('PasswordSetupForm', () => {
  it('validates password and emits submit while allowing paste-compatible input', async () => {
    const wrapper = mount(PasswordSetupForm, { global: { plugins: lifecyclePlugins() } })

    await wrapper.get('input[name="password"]').setValue('short')
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Use at least 12 characters')

    await wrapper.get('input[name="password"]').setValue('valid-password')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('submit')[0][0]).toEqual({ password: 'valid-password' })
  })

  it('renders external validation errors', () => {
    const wrapper = mount(PasswordSetupForm, {
      props: { fieldErrors: { password: ['Common password rejected.'] } },
      global: { plugins: lifecyclePlugins() },
    })
    expect(wrapper.text()).toContain('Common password rejected.')
  })
})
