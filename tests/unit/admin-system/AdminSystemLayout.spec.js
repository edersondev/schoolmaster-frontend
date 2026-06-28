import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { SHELL_FEEDBACK_STATES } from '@/contracts/admin-system/shell'
import { ADMIN_ROUTE_NAMES } from '@/contracts/admin-system/navigation'
import AdminShellHeader from '@/components/admin-system/shell/AdminShellHeader.vue'
import AdminSystemLayout from '@/layouts/admin-system/AdminSystemLayout.vue'
import { useAdminShellStore } from '@/stores/admin-system/shell.store'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  adminGlobalPlugins,
  allowedAdminPermissions,
  deniedAdminPermissions,
  privilegedAdminPermissions,
} from './shell.fixtures'

async function mountLayout(
  userPermissions = allowedAdminPermissions,
  {
    routeName = ADMIN_ROUTE_NAMES.dashboard,
    routePath = '/admin',
    routeComponent = {
      props: {
        userPermissions: {
          type: Array,
          default: () => [],
        },
      },
      template:
        '<section data-test="route-content">{{ userPermissions.length ? userPermissions.join(",") : "none" }}</section>',
    },
  } = {},
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: routePath,
        name: routeName,
        component: routeComponent,
        meta: {
          title: 'dashboard.title',
          breadcrumb: [{ label: 'dashboard.title', routeName }],
        },
      },
      {
        path: '/auth/login',
        name: 'authLogin',
        component: {
          template: '<section data-test="login-page">Login</section>',
        },
      },
    ],
  })
  router.push(routePath)
  await router.isReady()

  const wrapper = mount(AdminSystemLayout, {
    props: {
      userPermissions,
    },
    global: {
      plugins: adminGlobalPlugins([router]),
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a href="#" @click="$emit(\'click\')"><slot /></a>',
        },
      },
    },
  })

  return { wrapper, router }
}

describe('AdminSystemLayout', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps dashboard content and navigation reachable inside the shell', async () => {
    const { wrapper } = await mountLayout()

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('System Administration')
    expect(wrapper.find('[data-test="route-content"]').exists()).toBe(true)
  })

  it('forwards shell permissions to the routed dashboard component', async () => {
    const { wrapper } = await mountLayout(deniedAdminPermissions)

    expect(wrapper.find('[data-test="route-content"]').text()).toBe('none')

    await wrapper.setProps({ userPermissions: allowedAdminPermissions })
    expect(wrapper.find('[data-test="route-content"]').text()).toBe('admin.dashboard.view')
  })

  it('reacts when shell permissions are refreshed after mount', async () => {
    const { wrapper } = await mountLayout(allowedAdminPermissions)

    expect(wrapper.find('nav').text()).toContain('Dashboard')

    await wrapper.setProps({ userPermissions: deniedAdminPermissions })
    expect(wrapper.find('nav').text()).not.toContain('Dashboard')
  })

  it('shows users navigation for privileged system administrators', async () => {
    const { wrapper } = await mountLayout(privilegedAdminPermissions)

    expect(wrapper.find('nav').text()).toContain('Users')
  })

  it('does not pass user-permissions into routed pages that do not declare the prop', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fragmentRoute = {
      template:
        '<section data-test="fragment-a">alpha</section><section data-test="fragment-b">beta</section>',
    }
    const { wrapper } = await mountLayout(allowedAdminPermissions, {
      routeName: 'schoolsList',
      routePath: '/admin/schools',
      routeComponent: fragmentRoute,
    })

    expect(wrapper.find('[data-test="fragment-a"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="fragment-b"]').exists()).toBe(true)
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Extraneous non-props attributes (user-permissions)'),
    )
  })

  it('renders shell-level unauthorized, forbidden, and session-expired states', async () => {
    const { wrapper } = await mountLayout()
    const store = useAdminShellStore()

    store.setFeedbackState(SHELL_FEEDBACK_STATES.unauthorized)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Unauthorized access')

    store.setFeedbackState(SHELL_FEEDBACK_STATES.forbidden)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Access forbidden')

    store.setFeedbackState(SHELL_FEEDBACK_STATES.sessionExpired)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Session expired')
  })

  it('logs out and redirects to login when the header requests it', async () => {
    const { wrapper, router } = await mountLayout()
    const sessionStore = useAuthSessionStore()
    const logoutSpy = vi.spyOn(sessionStore, 'logout').mockResolvedValue(undefined)

    wrapper.findComponent(AdminShellHeader).vm.$emit('account-command', 'logout')
    await flushPromises()

    expect(logoutSpy).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.name).toBe('authLogin')
  })
})
