import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import UsersListPage from '@/pages/admin-system/users/UsersListPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, recordId, schoolId } from '../administration.fixtures'

const listUsers = vi.fn()
const deleteUser = vi.fn()

vi.mock('@/services/admin-system/users', () => ({
  listUsers: (...args) => listUsers(...args),
  deleteUser: (...args) => deleteUser(...args),
}))

const UserDeleteDialogStub = {
  props: ['open', 'values', 'userName'],
  emits: ['submit', 'cancel', 'update:open', 'update:values'],
  setup(props, { emit }) {
    function confirmDelete() {
      props.values.reason = 'Duplicate account'
      emit('submit')
    }

    return { confirmDelete }
  },
  template: `
    <div v-if="open" data-test="delete-dialog">
      <span data-test="dialog-user">{{ userName }}</span>
      <span data-test="dialog-effective-at">{{ values.effectiveAt }}</span>
      <button data-test="confirm-delete" @click="confirmDelete">Confirm delete</button>
    </div>
  `,
}

const UserTableStub = {
  props: ['rows', 'canManage', 'canEdit'],
  emits: ['edit', 'delete', 'sort'],
  template: `
    <div>
      <button
        v-if="canEdit"
        v-for="row in rows"
        :key="row.id + '-edit'"
        data-test="edit-user"
        @click="$emit('edit', row)"
      >Edit</button>
      <button
        v-for="row in rows"
        :key="row.id + '-delete'"
        data-test="delete-user"
        @click="$emit('delete', row)"
      >Delete</button>
    </div>
  `,
}

const UserFiltersStub = {
  emits: ['update:status', 'update:sort', 'reset'],
  template: `<button data-test="set-status" @click="$emit('update:status', 'inactive')">Inactive</button>`,
}

async function mountPage({ mode = null } = {}) {
  const plugins = administrationPlugins()
  const sessionStore = useAuthSessionStore()
  sessionStore.activeSchool = { id: schoolId, name: 'Northfield Academy', status: 'active' }
  sessionStore.permissions = [
    { code: 'users.view', scope: 'school', status: 'active' },
    { code: 'users.manage', scope: 'school', status: 'active' },
    { code: 'roles.view', scope: 'school', status: 'active' },
  ]
  if (mode === 'platform') {
    sessionStore.roles = [{ name: 'System Administrator', scope: 'platform', status: 'active' }]
    sessionStore.permissions.push(
      { code: 'schools.view', scope: 'platform', status: 'active' },
      { code: 'users.view', scope: 'platform', status: 'active' },
      { code: 'users.manage', scope: 'platform', status: 'active' },
      { code: 'roles.view', scope: 'platform', status: 'active' },
    )
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/users', name: 'usersList', component: UsersListPage },
      { path: '/admin/users/:userId/edit', name: 'userEdit', component: { template: '<div />' } },
      { path: '/admin/users/create', name: 'userCreate', component: { template: '<div />' } },
    ],
  })

  router.push(`/admin/users?status=active${mode ? `&user_mode=${mode}` : ''}`)
  await router.isReady()

  const wrapper = mount(UsersListPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        UserDeleteDialog: UserDeleteDialogStub,
        UserTable: UserTableStub,
        UserFilters: UserFiltersStub,
      },
    },
  })

  await flushPromises()

  return { wrapper, router, sessionStore }
}

describe('UsersListPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('navigates to edit with the current list query', async () => {
    listUsers.mockResolvedValue({
      items: [
        {
          id: recordId,
          fullName: 'Ada Lovelace',
          email: 'ada@example.test',
          status: 'active',
          roles: [{ id: 'role', name: 'Admin' }],
        },
      ],
      meta: { page: 1, perPage: 25, total: 1 },
    })
    const { wrapper, router } = await mountPage()

    await wrapper.get('[data-test="edit-user"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('userEdit')
    expect(router.currentRoute.value.params.userId).toBe(recordId)
    expect(router.currentRoute.value.query).toEqual({ status: 'active', user_mode: 'school' })

    expect(deleteUser).not.toHaveBeenCalled()
  })

  it('preserves platform lookup mode when list filters change', async () => {
    listUsers.mockResolvedValue({
      items: [],
      meta: { page: 1, perPage: 25, total: 0 },
    })
    const { wrapper, router } = await mountPage({ mode: 'platform' })

    await wrapper.get('[data-test="set-status"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      page: '1',
      per_page: '25',
      status: 'inactive',
      user_mode: 'platform',
    })
  })

  it('does not expose the school-only editor in platform mode', async () => {
    listUsers.mockResolvedValue({
      items: [
        {
          id: recordId,
          fullName: 'Platform Operator',
          email: 'operator@example.test',
          status: 'active',
          roles: [{ id: 'role', name: 'System Administrator' }],
        },
      ],
      meta: { page: 1, perPage: 25, total: 1 },
    })
    const { wrapper } = await mountPage({ mode: 'platform' })

    expect(wrapper.find('[data-test="edit-user"]').exists()).toBe(false)
  })

  it('clears loaded users when lookup mode becomes unauthorized', async () => {
    listUsers.mockResolvedValue({
      items: [
        {
          id: recordId,
          fullName: 'Platform Operator',
          email: 'operator@example.test',
          status: 'active',
          roles: [{ id: 'role', name: 'System Administrator' }],
        },
      ],
      meta: { page: 1, perPage: 25, total: 1 },
    })
    const { wrapper, sessionStore } = await mountPage({ mode: 'platform' })

    expect(wrapper.find('[data-test="delete-user"]').exists()).toBe(true)

    sessionStore.roles = []
    sessionStore.permissions = []
    await flushPromises()

    expect(wrapper.find('[data-test="delete-user"]').exists()).toBe(false)
    expect(listUsers).toHaveBeenCalledTimes(1)
  })
})
