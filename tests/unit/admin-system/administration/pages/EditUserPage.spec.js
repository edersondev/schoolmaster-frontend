import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import EditUserPage from '@/pages/admin-system/users/EditUserPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, recordId, schoolId } from '../administration.fixtures'

const getUser = vi.fn()
const updateUser = vi.fn()
const listRoles = vi.fn()

vi.mock('@/services/admin-system/users', () => ({
  getUser: (...args) => getUser(...args),
  updateUser: (...args) => updateUser(...args),
}))

vi.mock('@/services/admin-system/roles', () => ({
  listRoles: (...args) => listRoles(...args),
}))

async function mountPage() {
  const plugins = administrationPlugins()
  const sessionStore = useAuthSessionStore()
  sessionStore.activeSchool = { id: schoolId, name: 'Northfield Academy' }
  sessionStore.permissions = [
    { code: 'users.view', status: 'active' },
    { code: 'users.manage', status: 'active' },
    { code: 'roles.view', status: 'active' },
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/users', name: 'usersList', component: { template: '<div>Users</div>' } },
      {
        path: '/admin/users/:userId/edit',
        name: 'userEdit',
        component: EditUserPage,
      },
    ],
  })

  router.push(`/admin/users/${recordId}/edit?status=active`)
  await router.isReady()

  const wrapper = mount(EditUserPage, {
    global: {
      plugins: [...plugins, router],
    },
  })

  await flushPromises()

  return { wrapper, router }
}

describe('EditUserPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads the user, shows status, updates tenant user, and returns to the list', async () => {
    getUser.mockResolvedValue({
      id: recordId,
      fullName: 'Ada Lovelace',
      email: 'ada@example.test',
      status: 'active',
      roles: [{ id: 'role-admin', name: 'Admin' }],
    })
    updateUser.mockResolvedValue({ id: recordId })
    listRoles.mockResolvedValue({
      items: [{ id: 'role-admin', name: 'Admin' }],
      meta: { page: 1, perPage: 25, total: 1 },
    })

    const { wrapper, router } = await mountPage()

    expect(getUser).toHaveBeenCalledWith(
      recordId,
      expect.objectContaining({ schoolId, signal: expect.any(AbortSignal) }),
    )
    expect(listRoles).toHaveBeenCalledWith(
      { page: 1, perPage: 25, status: 'active' },
      { schoolId },
    )
    expect(wrapper.text()).toContain('Edit user')
    expect(wrapper.text()).not.toContain('Status')

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith(
      recordId,
      expect.any(Object),
      expect.objectContaining({ schoolId }),
    )
    expect(router.currentRoute.value.name).toBe('usersList')
    expect(router.currentRoute.value.query).toEqual({ status: 'active' })
  })
})
