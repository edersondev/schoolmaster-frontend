import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import SchoolsListPage from '@/pages/admin-system/schools/SchoolsListPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins, recordId } from '../administration.fixtures'

const listSchools = vi.fn()
const deleteSchool = vi.fn()

vi.mock('@/services/admin-system/schools', () => ({
  listSchools: (...args) => listSchools(...args),
  deleteSchool: (...args) => deleteSchool(...args),
}))

const SchoolDeleteDialogStub = {
  props: ['open', 'values', 'schoolName'],
  emits: ['submit', 'cancel', 'update:open', 'update:values'],
  setup(props, { emit }) {
    function confirmDelete() {
      props.values.reason = 'Duplicate tenant'
      emit('submit')
    }

    return { confirmDelete }
  },
  template: `
    <div v-if="open" data-test="delete-dialog">
      <span data-test="dialog-school">{{ schoolName }}</span>
      <span data-test="dialog-effective-at">{{ values.effectiveAt }}</span>
      <button data-test="confirm-delete" @click="confirmDelete">Confirm delete</button>
    </div>
  `,
}

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/schools', name: 'schoolsList', component: SchoolsListPage },
      { path: '/admin/schools/:schoolId/edit', name: 'schoolEdit', component: { template: '<div />' } },
      { path: '/admin/schools/create', name: 'schoolCreate', component: { template: '<div />' } },
    ],
  })

  router.push('/admin/schools?status=active')
  await router.isReady()

  const wrapper = mount(SchoolsListPage, {
    global: {
      plugins: [...administrationPlugins(), router],
      stubs: {
        SchoolDeleteDialog: SchoolDeleteDialogStub,
      },
    },
  })

  const sessionStore = useAuthSessionStore()
  sessionStore.permissions = [
    { code: 'schools.view', status: 'active' },
    { code: 'schools.manage', status: 'active' },
  ]

  await flushPromises()

  return { wrapper, router }
}

describe('SchoolsListPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('navigates to edit with the current list query', async () => {
    listSchools.mockResolvedValue({
      items: [
        {
          id: recordId,
          name: 'Northfield Academy',
          code: 'NORTH',
          status: 'active',
          contactEmail: 'office@northfield.test',
        },
      ],
      meta: { page: 1, perPage: 25, total: 1 },
    })
    const { wrapper, router } = await mountPage()

    await wrapper.get('[data-test="edit-school"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('schoolEdit')
    expect(router.currentRoute.value.params.schoolId).toBe(recordId)
    expect(router.currentRoute.value.query).toEqual({ status: 'active' })

    expect(deleteSchool).not.toHaveBeenCalled()
  })
})
