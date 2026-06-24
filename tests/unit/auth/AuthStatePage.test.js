import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import AuthStatePage from '@/pages/auth/AuthStatePage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { authGlobalPlugins } from './auth.fixtures'

vi.mock('vue-router', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    useRouter: vi.fn(),
  }
})

describe('AuthStatePage', () => {
  const replace = vi.fn()

  beforeEach(() => {
    replace.mockReset()
    useRouter.mockReturnValue({ replace })
  })

  it('retries bootstrap and restores the captured route', async () => {
    const plugins = authGlobalPlugins()
    const store = useAuthSessionStore()
    store.feedbackState = {
      state: 'temporary-unavailable',
      severity: 'error',
      recoveryAction: 'retry',
    }
    store.status = 'temporary-unavailable'
    store.requestedRoute = {
      routeName: 'reports',
      routeParams: { section: 'attendance' },
      routeQuery: { range: 'week' },
      requiresSchoolContext: false,
      requiredPermissions: ['reports.view'],
    }
    store.bootstrap = vi.fn(async () => {
      store.status = 'authenticated'
      store.permissions = [{ code: 'reports.view', status: 'active' }]
    })
    const wrapper = mount(AuthStatePage, { global: { plugins } })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(store.bootstrap).toHaveBeenCalledWith({ requiresSchoolContext: false })
    expect(replace).toHaveBeenCalledWith({
      name: 'reports',
      params: { section: 'attendance' },
      query: { range: 'week' },
    })
    expect(store.requestedRoute).toBeNull()
  })
})
