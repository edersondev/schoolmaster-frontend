import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PasswordResetRequestPage from '@/pages/auth/PasswordResetRequestPage.vue'
import { lifecyclePlugins } from '../fixtures'

vi.mock('@/services/auth/accountLifecycle', () => ({
  authAccountLifecycleService: {
    requestPasswordReset: vi.fn().mockResolvedValue({
      accepted: true,
      feedback: { state: 'neutral-confirmation', severity: 'info', recoveryAction: null },
    }),
  },
}))

describe('PasswordResetRequestPage', () => {
  it('shows neutral reset confirmation without school selector', async () => {
    const wrapper = mount(PasswordResetRequestPage, {
      global: { plugins: lifecyclePlugins(), stubs: { RouterLink: true } },
    })

    expect(wrapper.find('select').exists()).toBe(false)
    await wrapper.get('input[name="email"]').setValue('avery@example.com')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('If the address can receive recovery email')
  })

  it.each(['missing@example.com', 'inactive@example.com', 'locked@example.com', 'deleted@example.com'])(
    'uses same confirmation copy for %s',
    () => {
      const wrapper = mount(PasswordResetRequestPage, {
        global: { plugins: lifecyclePlugins(), stubs: { RouterLink: true } },
      })
      expect(wrapper.text()).not.toContain('not found')
    },
  )
})
