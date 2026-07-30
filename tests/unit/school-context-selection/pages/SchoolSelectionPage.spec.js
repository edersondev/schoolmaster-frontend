import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import SchoolSelectionPage from '@/pages/auth/SchoolSelectionPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { authGlobalPlugins } from '../../auth/auth.fixtures'

describe('SchoolSelectionPage', () => {
  it('resumes a registered authorized route only after confirmation', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/auth/school-selection',
          name: 'authSchoolSelection',
          component: SchoolSelectionPage,
        },
        { path: '/admin/users', name: 'usersList', component: { template: '<div>Users</div>' } },
        { path: '/admin', name: 'adminDashboard', component: { template: '<div>Dashboard</div>' } },
      ],
    })
    const plugins = authGlobalPlugins([router])
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'user-1' }
    store.roles = [{ name: 'System Administrator', scope: 'platform', status: 'active' }]
    store.activeSchool = { id: 'school-1', status: 'active' }
    store.requestedRoute = {
      routeName: 'usersList',
      routeParams: {},
      routeQuery: { page: '2' },
      requiresSchoolContext: true,
      requiredPermissions: [],
      schoolContextSwitch: 'retain',
      contextNeutralQueryKeys: ['page'],
    }
    await router.push({ name: 'authSchoolSelection' })
    await router.isReady()

    const wrapper = mount(SchoolSelectionPage, {
      global: {
        plugins,
        stubs: {
          SchoolContextSelector: {
            emits: ['confirmed', 'manage-schools'],
            template: '<button data-test="confirm" @click="$emit(\'confirmed\')">Confirm</button>',
          },
        },
      },
    })

    expect(router.currentRoute.value.name).toBe('authSchoolSelection')
    await wrapper.get('[data-test="confirm"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value).toMatchObject({ name: 'usersList', query: { page: '2' } })
    expect(store.requestedRoute).toBeNull()
  })
})
