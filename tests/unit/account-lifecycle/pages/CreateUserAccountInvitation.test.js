import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import CreateUserPage from '@/pages/admin-system/users/CreateUserPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { lifecyclePlugins, schoolId } from '../fixtures'

const createUser = vi.fn()
const getUser = vi.fn()
const restoreUser = vi.fn()
const listRoles = vi.fn().mockResolvedValue({
  items: [{ id: 'role-1', name: 'Teacher', status: 'active' }],
  meta: { page: 1, perPage: 25, total: 1 },
})

vi.mock('@/services/admin-system/users', () => ({
  createUser: (...args) => createUser(...args),
  getUser: (...args) => getUser(...args),
  restoreUser: (...args) => restoreUser(...args),
}))
vi.mock('@/services/admin-system/roles', () => ({
  listRoles: (...args) => listRoles(...args),
}))
vi.mock('@/composables/admin-system/useAdministrationCreatePage', async () => {
  const { reactive, shallowRef } = await import('vue')

  return {
    useAdministrationCreatePage: (options) => {
      const result = shallowRef(null)
      const values = reactive(structuredClone(options.initialValues))
      const form = {
        values,
        pending: shallowRef(false),
        fieldErrors: shallowRef({}),
        formError: shallowRef(null),
        clearErrors: vi.fn(),
        invalidate: vi.fn(),
        reset: vi.fn(),
      }

      return {
        form,
        result,
        tenantId: shallowRef('20000000-0000-4000-8000-000000000001'),
        async submit() {
          result.value = await options.submitter(form.values, {
            schoolId: '20000000-0000-4000-8000-000000000001',
          })
          return result.value
        },
        cancel: vi.fn(),
        finish: vi.fn(),
        setResult(value) {
          result.value = value
        },
      }
    },
  }
})

const invitedUser = {
  id: 'invited-1',
  schoolId,
  fullName: 'Invited User',
  email: 'invited@example.test',
  status: 'invited',
  roles: [{ id: 'role-1' }],
}

async function mountPage(query = '') {
  const plugins = lifecyclePlugins()
  const session = useAuthSessionStore()
  session.status = 'authenticated'
  session.currentUser = { id: 'admin-1', status: 'active' }
  session.activeSchool = { id: schoolId, status: 'active' }
  session.roles = []
  session.permissions = [
    { code: 'users.view', scope: 'school', status: 'active' },
    { code: 'users.manage', scope: 'school', status: 'active' },
    { code: 'roles.view', scope: 'school', status: 'active' },
    { code: 'account_lifecycle.manage', scope: 'school', status: 'active' },
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/users/create', name: 'userCreate', component: { template: '<div />' } },
      { path: '/admin/users', name: 'usersList', component: { template: '<div />' } },
    ],
  })
  await router.push(`/admin/users/create${query}`)
  await router.isReady()

  const wrapper = mount(CreateUserPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        AdminFormPage: {
          name: 'AdminFormPage',
          template:
            '<section data-test="create-form"><slot/><button data-test="submit" @click="$emit(\'submit\')">Create</button></section>',
        },
        UserForm: {
          name: 'UserForm',
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template:
            "<button data-test=\"fill\" @click=\"$emit('update:modelValue', { fullName: 'Invited User', email: 'invited@example.test', roleIds: ['role-1'] })\">Fill</button>",
        },
        UserInvitationPanel: { template: '<section data-test="invitation-panel" />' },
      },
    },
  })
  await flushPromises()

  return { wrapper, router }
}

describe('CreateUser account invitation flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listRoles.mockResolvedValue({
      items: [{ id: 'role-1', name: 'Teacher', status: 'active' }],
      meta: { page: 1, perPage: 25, total: 1 },
    })
  })

  it('keeps draft separate, persists once, and enters explicit invitation phase', async () => {
    createUser.mockResolvedValue(invitedUser)
    const { wrapper, router } = await mountPage()

    expect(wrapper.find('[data-test="invitation-panel"]').exists()).toBe(false)
    wrapper.findComponent({ name: 'UserForm' }).vm.$emit('update:modelValue', {
      fullName: 'Invited User',
      email: 'invited@example.test',
      roleIds: ['role-1'],
    })
    await wrapper.vm.$nextTick()
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()

    expect(createUser).toHaveBeenCalledTimes(1)
    expect(restoreUser).not.toHaveBeenCalled()
    expect(createUser.mock.calls[0][0]).toMatchObject({ email: 'invited@example.test' })
    expect(createUser.mock.calls[0][0]).not.toHaveProperty('accountSetupMode')
    expect(router.currentRoute.value.name).toBe('userCreate')
    expect(router.currentRoute.value.query).toEqual({ created_user_id: 'invited-1' })
    expect(wrapper.find('[data-test="invitation-panel"]').exists()).toBe(true)
  })

  it('restores only an authorized exact-tenant invited user from UUID route intent', async () => {
    getUser.mockResolvedValue(invitedUser)
    const { wrapper } = await mountPage('?created_user_id=invited-1&email=ignored@example.test')

    expect(getUser).toHaveBeenCalledWith('invited-1', { schoolId })
    expect(createUser).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="invitation-panel"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('ignored@example.test')
  })
})
