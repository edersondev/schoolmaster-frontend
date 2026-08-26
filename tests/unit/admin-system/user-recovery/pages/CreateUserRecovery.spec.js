import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import CreateUserPage from '@/pages/admin-system/users/CreateUserPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins } from '../../administration/administration.fixtures'
import {
  deferred,
  genericDuplicateConflict,
  malformedRecoveryConflicts,
  recoverableConflict,
  recoverySchoolId,
  recoveryUserId,
  restoreFailure,
} from '../fixtures/recoveryFeedback'

const createUser = vi.fn()
const getUser = vi.fn()
const restoreUser = vi.fn()
const listRoles = vi.fn()

vi.mock('@/services/admin-system/users', () => ({
  createUser: (...args) => createUser(...args),
  getUser: (...args) => getUser(...args),
  restoreUser: (...args) => restoreUser(...args),
}))

vi.mock('@/services/admin-system/roles', () => ({
  listRoles: (...args) => listRoles(...args),
}))

async function mountPage() {
  const plugins = administrationPlugins()
  const session = useAuthSessionStore()
  session.status = 'authenticated'
  session.currentUser = { id: 'admin-1', status: 'active' }
  session.activeSchool = { id: recoverySchoolId, status: 'active' }
  session.permissions = [
    { code: 'users.view', scope: 'school', status: 'active' },
    { code: 'users.manage', scope: 'school', status: 'active' },
    { code: 'roles.view', scope: 'school', status: 'active' },
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/users/create', name: 'userCreate', component: { template: '<div />' } },
      { path: '/admin/users', name: 'usersList', component: { template: '<div />' } },
      {
        path: '/admin/users/:userId',
        name: 'userDetail',
        component: { template: '<div />' },
      },
    ],
  })
  await router.push('/admin/users/create')
  await router.isReady()

  const wrapper = mount(CreateUserPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        AdminFormPage: {
          name: 'AdminFormPage',
          props: ['formError'],
          emits: ['submit', 'cancel'],
          template:
            '<section><p v-if="formError" data-test="generic-feedback">{{ formError.messageKey }}</p><slot/><button data-test="submit" @click="$emit(\'submit\')">Create</button></section>',
        },
        UserForm: {
          name: 'UserForm',
          props: ['modelValue'],
          emits: ['update:modelValue'],
          template: '<div />',
        },
        UserInvitationPanel: { template: '<div />' },
        AdminLifecycleDialog: {
          name: 'AdminLifecycleDialog',
          props: [
            'open',
            'values',
            'action',
            'resourceLabel',
            'pending',
            'fieldErrors',
            'formError',
          ],
          emits: ['update:open', 'update:values', 'submit', 'cancel'],
          template:
            '<section v-if="open" data-test="recovery-dialog"><button data-test="restore-cancel" @click="$emit(\'cancel\')">Cancel</button><button data-test="restore-submit" @click="$emit(\'submit\')">Confirm action</button></section>',
        },
      },
    },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('CreateUser recoverable conflict', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listRoles.mockResolvedValue({ items: [], meta: { page: 1, perPage: 25, total: 0 } })
  })

  it('shows one safe warning, suppresses generic feedback, and never restores automatically', async () => {
    createUser.mockRejectedValue(recoverableConflict())
    const { wrapper } = await mountPage()
    const draft = {
      fullName: 'New Draft Name',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    }
    Object.assign(wrapper.findComponent({ name: 'UserForm' }).props('modelValue'), draft)
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('An existing user can be restored.')
    expect(wrapper.text()).toContain('Restore existing user')
    expect(wrapper.find('[data-test="generic-feedback"]').exists()).toBe(false)
    expect(restoreUser).not.toHaveBeenCalled()
    expect(wrapper.findComponent({ name: 'UserForm' }).props('modelValue')).toMatchObject(draft)
  })

  it('clears recovery immediately after any email edit', async () => {
    createUser.mockRejectedValue(recoverableConflict())
    const { wrapper } = await mountPage()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'New Draft Name',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Restore existing user')

    userForm.props('modelValue').email = 'changed@test.com.br'
    await flushPromises()

    expect(wrapper.text()).not.toContain('Restore existing user')
    expect(createUser).toHaveBeenCalledTimes(1)
  })

  it('reuses lifecycle confirmation and navigates to authoritative school detail', async () => {
    createUser.mockRejectedValue(recoverableConflict())
    restoreUser.mockResolvedValue({ status: 'active' })
    const { wrapper, router } = await mountPage()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'Discarded Draft',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()

    await wrapper.get('button.el-button').trigger('click')
    await flushPromises()
    const dialog = wrapper.findComponent({ name: 'AdminLifecycleDialog' })
    expect(dialog.props('open')).toBe(true)
    expect(dialog.props('action')).toBe('restore')
    expect(dialog.props('resourceLabel')).toBe('existing user')
    expect(wrapper.html()).not.toContain(recoveryUserId)
    Object.assign(dialog.props('values'), {
      effectiveAt: '2026-08-23',
      reason: 'Approved recovery',
    })

    await wrapper.get('[data-test="restore-submit"]').trigger('click')
    await flushPromises()

    expect(restoreUser).toHaveBeenCalledWith(
      recoveryUserId,
      { effectiveAt: '2026-08-23', reason: 'Approved recovery' },
      { schoolId: recoverySchoolId },
    )
    expect(router.currentRoute.value).toMatchObject({
      name: 'userDetail',
      params: { userId: recoveryUserId },
      query: { user_mode: 'school' },
    })
    expect(userForm.props('modelValue')).toMatchObject({ fullName: '', email: '', roleIds: [] })
  })

  it('preserves the dialog draft for validation failures', async () => {
    createUser.mockRejectedValue(recoverableConflict())
    restoreUser.mockRejectedValue(restoreFailure(422, 'validation_failed'))
    const { wrapper } = await mountPage()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'Draft',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('button.el-button').trigger('click')
    const dialog = wrapper.findComponent({ name: 'AdminLifecycleDialog' })
    Object.assign(dialog.props('values'), {
      effectiveAt: '2026-08-23',
      reason: 'Keep this reason',
    })

    await wrapper.get('[data-test="restore-submit"]').trigger('click')
    await flushPromises()

    expect(dialog.props('open')).toBe(true)
    expect(dialog.props('values').reason).toBe('Keep this reason')
    expect(wrapper.text()).toContain('Restore existing user')
  })

  it('clears terminal restore conflicts and exposes only safe feedback', async () => {
    createUser.mockRejectedValue(recoverableConflict())
    restoreUser.mockRejectedValue(restoreFailure(403, 'forbidden'))
    const { wrapper } = await mountPage()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'Draft',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('button.el-button').trigger('click')
    const dialog = wrapper.findComponent({ name: 'AdminLifecycleDialog' })
    Object.assign(dialog.props('values'), {
      effectiveAt: '2026-08-23',
      reason: 'Sensitive reason',
    })

    await wrapper.get('[data-test="restore-submit"]').trigger('click')
    await flushPromises()
    dialog.vm.$emit('cancel')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Restore existing user')
    expect(wrapper.find('[data-test="recovery-dialog"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="generic-feedback"]').text()).toBe('common.forbidden')
    expect(wrapper.html()).not.toContain(recoveryUserId)
    expect(wrapper.html()).not.toContain('Sensitive reason')
  })

  it('keeps generic duplicate and malformed recovery payloads private', async () => {
    for (const cause of [genericDuplicateConflict(), ...malformedRecoveryConflicts]) {
      createUser.mockRejectedValueOnce(cause)
      const { wrapper } = await mountPage()
      const userForm = wrapper.findComponent({ name: 'UserForm' })
      Object.assign(userForm.props('modelValue'), {
        fullName: 'Draft',
        email: 'joao@test.com.br',
        roleIds: ['role-1'],
      })

      await wrapper.get('[data-test="submit"]').trigger('click')
      await flushPromises()

      expect(wrapper.text()).not.toContain('Restore existing user')
      expect(restoreUser).not.toHaveBeenCalled()
      expect(getUser).not.toHaveBeenCalled()
      expect(wrapper.html()).not.toContain(recoveryUserId)
      wrapper.unmount()
    }
  })

  it('invalidates a pending create result immediately after an email edit', async () => {
    const request = deferred()
    createUser.mockReturnValue(request.promise)
    const { wrapper } = await mountPage()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'Draft',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')

    userForm.props('modelValue').email = 'edited@test.com.br'
    await flushPromises()
    request.reject(recoverableConflict())
    await flushPromises()

    expect(wrapper.text()).not.toContain('Restore existing user')
    expect(restoreUser).not.toHaveBeenCalled()
  })

  it('clears recovery after permission reset, cancellation, and route departure', async () => {
    createUser.mockRejectedValue(recoverableConflict())
    const { wrapper, router } = await mountPage()
    const session = useAuthSessionStore()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'Draft',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()

    session.permissions = []
    await flushPromises()
    expect(wrapper.text()).not.toContain('Restore existing user')

    session.permissions = [
      { code: 'users.view', scope: 'school', status: 'active' },
      { code: 'users.manage', scope: 'school', status: 'active' },
      { code: 'roles.view', scope: 'school', status: 'active' },
    ]
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('button.el-button').trigger('click')
    await wrapper.get('[data-test="restore-cancel"]').trigger('click')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Restore existing user')

    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()
    await router.push('/admin/users')
    await flushPromises()
    expect(wrapper.text()).not.toContain('Restore existing user')
    expect(restoreUser).not.toHaveBeenCalled()
  })

  it('makes an in-flight restore inert after a school context change', async () => {
    const request = deferred()
    createUser.mockRejectedValue(recoverableConflict())
    restoreUser.mockReturnValue(request.promise)
    const { wrapper, router } = await mountPage()
    const session = useAuthSessionStore()
    const userForm = wrapper.findComponent({ name: 'UserForm' })
    Object.assign(userForm.props('modelValue'), {
      fullName: 'Draft',
      email: 'joao@test.com.br',
      roleIds: ['role-1'],
    })
    await wrapper.get('[data-test="submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('button.el-button').trigger('click')
    const dialog = wrapper.findComponent({ name: 'AdminLifecycleDialog' })
    Object.assign(dialog.props('values'), {
      effectiveAt: '2026-08-23',
      reason: 'Stale reason',
    })
    await wrapper.get('[data-test="restore-submit"]').trigger('click')

    session.activeSchool = { id: 'school-2', status: 'active' }
    session.schoolContextGeneration += 1
    await flushPromises()
    request.resolve({ status: 'active' })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('userCreate')
    expect(wrapper.text()).not.toContain('Restore existing user')
    expect(wrapper.html()).not.toContain('Stale reason')
  })
})
