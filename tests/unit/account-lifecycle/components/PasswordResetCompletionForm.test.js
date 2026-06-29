import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordResetCompletionForm from '@/components/auth/PasswordResetCompletionForm.vue'
import { lifecyclePlugins } from '../fixtures'

describe('PasswordResetCompletionForm', () => {
  it('validates password and emits submit', async () => {
    const wrapper = mount(PasswordResetCompletionForm, { global: { plugins: lifecyclePlugins() } })

    await wrapper.get('input[name="password"]').setValue('short')
    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Use at least 12 characters')

    await wrapper.get('input[name="password"]').setValue('valid-password')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('submit')[0][0]).toEqual({ password: 'valid-password' })
  })
})

