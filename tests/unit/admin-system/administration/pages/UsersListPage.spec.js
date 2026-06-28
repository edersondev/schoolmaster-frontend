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
  props: ['rows', 'canManage'],
  emits: ['edit', 'delete', 'sort'],
  template: `
    <div>
      <button
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
      { path: '/admin/users', name: 'usersList', component: UsersListPage },
      { path: '/admin/users/:userId/edit', name: 'userEdit', component: { template: '<div />' } },
      { path: '/admin/users/create', name: 'userCreate', component: { template: '<div />' } },
    ],
  })

  router.push('/admin/users?status=active')
  await router.isReady()

  const wrapper = mount(UsersListPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        UserDeleteDialog: UserDeleteDialogStub,
        UserTable: UserTableStub,
      },
    },
  })

  await flushPromises()

  return { wrapper, router }
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
    expect(router.currentRoute.value.query).toEqual({ status: 'active' })

    expect(deleteUser).not.toHaveBeenCalled()
  })
})
