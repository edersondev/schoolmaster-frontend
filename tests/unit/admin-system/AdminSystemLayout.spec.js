import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { SHELL_FEEDBACK_STATES } from '@/contracts/admin-system/shell'
import AdminSystemLayout from '@/layouts/admin-system/AdminSystemLayout.vue'
import { useAdminShellStore } from '@/stores/admin-system/shell.store'
import { adminGlobalPlugins, allowedAdminPermissions, deniedAdminPermissions } from './shell.fixtures'

async function mountLayout(userPermissions = allowedAdminPermissions) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/admin',
        name: 'adminDashboard',
        component: {
          props: {
            userPermissions: {
              type: Array,
              default: () => [],
            },
          },
          template:
            '<section data-test="route-content">{{ userPermissions.length ? userPermissions.join(",") : "none" }}</section>',
        },
        meta: {
          title: 'dashboard.title',
          breadcrumb: [{ label: 'dashboard.title', routeName: 'adminDashboard' }],
        },
      },
    ],
  })
  router.push('/admin')
  await router.isReady()

  return mount(AdminSystemLayout, {
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
}

describe('AdminSystemLayout', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps dashboard content and navigation reachable inside the shell', async () => {
    const wrapper = await mountLayout()

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('System Administration')
    expect(wrapper.find('[data-test="route-content"]').exists()).toBe(true)
  })

  it('forwards shell permissions to the routed dashboard component', async () => {
    const wrapper = await mountLayout(deniedAdminPermissions)

    expect(wrapper.find('[data-test="route-content"]').text()).toBe('none')

    await wrapper.setProps({ userPermissions: allowedAdminPermissions })
    expect(wrapper.find('[data-test="route-content"]').text()).toBe('admin.dashboard.view')
  })

  it('reacts when shell permissions are refreshed after mount', async () => {
    const wrapper = await mountLayout(allowedAdminPermissions)

    expect(wrapper.find('nav').text()).toContain('Dashboard')

    await wrapper.setProps({ userPermissions: deniedAdminPermissions })
    expect(wrapper.find('nav').text()).not.toContain('Dashboard')
  })

  it('renders shell-level unauthorized, forbidden, and session-expired states', async () => {
    const wrapper = await mountLayout()
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
})
