import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordResetCompletionPage from '@/pages/auth/PasswordResetCompletionPage.vue'
import { lifecyclePlugins, validToken } from '../fixtures'

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/auth/password-resets',
    hash: `#token=${validToken}`,
    query: {},
  }),
  useRouter: () => ({ push: vi.fn(), replace }),
  RouterLink: { template: '<a><slot /></a>' },
}))

describe('PasswordResetCompletionPage', () => {
  it('reads the token from the fragment and clears it from the address bar', () => {
    const wrapper = mount(PasswordResetCompletionPage, {
      global: { plugins: lifecyclePlugins(), stubs: { RouterLink: true } },
    })

    expect(wrapper.find('input[name="password"]').exists()).toBe(true)
    expect(replace).toHaveBeenCalledWith({
      path: '/auth/password-resets',
      query: {},
      hash: '',
    })
  })
})
