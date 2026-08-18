import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import RolesListPage from '@/pages/admin-system/roles/RolesListPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, recordId, schoolId } from '../administration.fixtures'

const listRoles = vi.fn()

vi.mock('@/services/admin-system/roles', () => ({
  listRoles: (...args) => listRoles(...args),
  activateRole: vi.fn(),
  bulkLifecycleRoles: vi.fn(),
  deactivateRole: vi.fn(),
  deleteRole: vi.fn(),
  restoreRole: vi.fn(),
}))

const RoleTableStub = {
  props: ['rows'],
  emits: ['permissions'],
  template: `
    <button
      v-for="row in rows"
      :key="row.id"
      data-test="list-permissions"
      @click="$emit('permissions', row)"
    >List permissions</button>
  `,
}

const RolePermissionsDialogStub = {
  props: ['open', 'role'],
  emits: ['update:open', 'closed'],
  template: `
    <section v-if="open" data-test="permissions-dialog">
      <span data-test="dialog-role">{{ role.name }}</span>
      <span v-for="permission in role.permissions" :key="permission.id">
        {{ permission.code }} — {{ permission.name }}
      </span>
    </section>
  `,
}

async function mountPage() {
  const plugins = administrationPlugins()
  const sessionStore = useAuthSessionStore()
  sessionStore.activeSchool = { id: schoolId, name: 'Northfield Academy', status: 'active' }
  sessionStore.permissions = [{ code: 'roles.view', scope: 'school', status: 'active' }]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/roles', name: 'rolesList', component: RolesListPage },
      { path: '/admin/roles/create', name: 'roleCreate', component: { template: '<div />' } },
    ],
  })
  await router.push('/admin/roles')
  await router.isReady()

  const wrapper = mount(RolesListPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        RoleFilters: true,
        RoleTable: RoleTableStub,
        RolePermissionsDialog: RolePermissionsDialogStub,
        AdminLifecycleDialog: true,
        AdminBulkActionBar: true,
      },
    },
  })
  await flushPromises()

  return wrapper
}

describe('RolesListPage permission dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listRoles.mockResolvedValue({
      items: [
        {
          id: recordId,
          name: 'Director',
          scope: 'school',
          status: 'active',
          permissions: [{ id: 'permission-1', code: 'users.view', name: 'View users' }],
        },
      ],
      meta: { page: 1, perPage: 25, total: 1 },
    })
  })

  it('opens embedded permissions without another request', async () => {
    const wrapper = await mountPage()

    await wrapper.get('[data-test="list-permissions"]').trigger('click')

    expect(wrapper.get('[data-test="permissions-dialog"]').text()).toContain('Director')
    expect(wrapper.get('[data-test="permissions-dialog"]').text()).toContain(
      'users.view — View users',
    )
    expect(listRoles).toHaveBeenCalledTimes(1)
  })
})
