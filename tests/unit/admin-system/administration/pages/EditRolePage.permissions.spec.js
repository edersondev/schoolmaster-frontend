import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import EditRolePage from '@/pages/admin-system/roles/EditRolePage.vue'
import RoleEditFields from '@/components/admin-system/roles/RoleEditFields.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, recordId, schoolId } from '../administration.fixtures'

const getRole = vi.fn()
const updateRole = vi.fn()
const listAllPermissions = vi.fn()

vi.mock('@/services/admin-system/roles', () => ({
  getRole: (...args) => getRole(...args),
  updateRole: (...args) => updateRole(...args),
}))

vi.mock('@/services/admin-system/permissions', () => ({
  listAllPermissions: (...args) => listAllPermissions(...args),
}))

async function mountPage() {
  const plugins = administrationPlugins()
  const sessionStore = useAuthSessionStore()
  sessionStore.activeSchool = { id: schoolId, name: 'Northfield Academy' }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/roles', name: 'rolesList', component: { template: '<div>Roles</div>' } },
      {
        path: '/admin/roles/:roleId/edit',
        name: 'roleEdit',
        component: EditRolePage,
      },
    ],
  })

  await router.push(`/admin/roles/${recordId}/edit`)
  await router.isReady()

  const wrapper = mount(EditRolePage, {
    global: { plugins: [...plugins, router] },
  })
  await flushPromises()

  return wrapper
}

describe('EditRolePage permission choices', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows only active school-scoped permissions', async () => {
    getRole.mockResolvedValue({
      id: recordId,
      name: 'Teacher',
      status: 'active',
      permissions: [{ id: 'permission-school-active', scope: 'school', status: 'active' }],
    })
    listAllPermissions.mockResolvedValue({
      items: [
        { id: 'permission-school-active', scope: 'school', status: 'active' },
        { id: 'permission-school-inactive', scope: 'school', status: 'inactive' },
        { id: 'permission-platform-active', scope: 'platform', status: 'active' },
      ],
      meta: { page: 1, perPage: 100, total: 3 },
    })

    const wrapper = await mountPage()

    expect(wrapper.findComponent(RoleEditFields).props('permissions')).toEqual([
      expect.objectContaining({ id: 'permission-school-active' }),
    ])
  })
})
