import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import GuardiansListPage from '@/pages/admin-system/guardians/GuardiansListPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, schoolId } from '../administration.fixtures'

const mocks = vi.hoisted(() => ({
  listGuardians: vi.fn(),
  lifecycle: vi.fn(),
  bulkLifecycle: vi.fn(),
}))

vi.mock('@/services/admin-system/guardians', () => ({
  listGuardians: (...args) => mocks.listGuardians(...args),
  activateGuardian: (...args) => mocks.lifecycle(...args),
  deactivateGuardian: (...args) => mocks.lifecycle(...args),
  deleteGuardian: (...args) => mocks.lifecycle(...args),
  restoreGuardian: (...args) => mocks.lifecycle(...args),
  bulkLifecycleGuardians: (...args) => mocks.bulkLifecycle(...args),
}))

async function mountGuardiansList(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/guardians', name: 'guardiansList', component: GuardiansListPage },
      {
        path: '/admin/guardians/create',
        name: 'guardianCreate',
        component: { template: '<div />' },
      },
      {
        path: '/admin/guardians/:guardianId',
        name: 'guardianDetail',
        component: { template: '<div />' },
      },
      {
        path: '/admin/guardians/:guardianId/edit',
        name: 'guardianEdit',
        component: { template: '<div />' },
      },
    ],
  })
  const plugins = administrationPlugins()
  const sessionStore = useAuthSessionStore()
  sessionStore.status = 'authenticated'
  sessionStore.activeSchool = { id: schoolId, name: 'Northfield Academy', status: 'active' }
  sessionStore.permissions = [{ code: 'guardians.view', status: 'active' }]
  mocks.listGuardians.mockResolvedValue({
    items: [],
    meta: { page: 1, perPage: 25, total: 0 },
  })

  router.push(path)
  await router.isReady()

  const wrapper = mount(GuardiansListPage, {
    global: { plugins: [...plugins, router] },
  })
  await flushPromises()

  return { router, wrapper }
}

describe('GuardiansListPage filters', () => {
  it('restores and submits the approved Guardian filters', async () => {
    const { router, wrapper } = await mountGuardiansList(
      '/admin/guardians?page=3&full_name=Maria&contact_email=guardian%40example&status=active',
    )

    expect(mocks.listGuardians).toHaveBeenCalledWith(
      {
        page: 3,
        perPage: 25,
        fullName: 'Maria',
        contactEmail: 'guardian@example',
        status: 'active',
      },
      { schoolId },
    )
    expect(wrapper.findComponent({ name: 'GuardianFilters' }).props()).toMatchObject({
      fullName: 'Maria',
      contactEmail: 'guardian@example',
      status: 'active',
    })

    await wrapper.findComponent({ name: 'GuardianFilters' }).vm.$emit('submit', {
      fullName: 'Joana',
      contactEmail: 'joana@example',
      status: 'inactive',
    })
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      page: '1',
      per_page: '25',
      full_name: 'Joana',
      contact_email: 'joana@example',
      status: 'inactive',
    })
  })

  it('clears every Guardian filter and resets pagination', async () => {
    const { router, wrapper } = await mountGuardiansList(
      '/admin/guardians?page=2&full_name=Maria&contact_email=guardian%40example&status=active',
    )

    await wrapper.findComponent({ name: 'GuardianFilters' }).vm.$emit('reset')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ page: '1', per_page: '25' })
  })
})
