import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import InvitationSetupPage from '@/pages/auth/InvitationSetupPage.vue'
import { lifecyclePlugins, validToken } from '../fixtures'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { invitationToken: validToken }, query: {} }),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
}))

describe('InvitationSetupPage', () => {
  it('renders token setup form and sign-in recovery surface', () => {
    const wrapper = mount(InvitationSetupPage, {
      global: { plugins: lifecyclePlugins(), stubs: { RouterLink: true } },
    })

    expect(wrapper.text()).toContain('Create your password')
    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
  })
})

