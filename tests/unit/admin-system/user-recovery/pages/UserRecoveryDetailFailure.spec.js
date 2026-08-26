import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, shallowRef } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import UserDetailPage from '@/pages/admin-system/users/UserDetailPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { administrationPlugins } from '../../administration/administration.fixtures'
import { recoverySchoolId, recoveryUserId, restoreFailure } from '../fixtures/recoveryFeedback'

const getUser = vi.fn()
const restoreUser = vi.fn()

vi.mock('@/services/admin-system/users', () => ({
  getUser: (...args) => getUser(...args),
  restoreUser: (...args) => restoreUser(...args),
  activateUser: vi.fn(),
  deactivateUser: vi.fn(),
  deleteUser: vi.fn(),
}))

vi.mock('@/composables/admin-system/useAccountLifecycleActions', () => ({
  useAccountLifecycleActions: () => ({
    eligibility: computed(() => ({ blocked: true })),
    lock: shallowRef(null),
    loading: shallowRef(false),
    error: shallowRef(null),
    pending: shallowRef(false),
    open: shallowRef(false),
    reason: shallowRef(''),
    action: shallowRef(null),
    fieldErrors: shallowRef({}),
    submit: vi.fn(),
    close: vi.fn(),
    launch: vi.fn(),
    loadLock: vi.fn(),
  }),
}))

async function mountPage() {
  const plugins = administrationPlugins()
  const session = useAuthSessionStore()
  session.status = 'authenticated'
  session.currentUser = { id: 'admin-1', status: 'active' }
  session.activeSchool = { id: recoverySchoolId, status: 'active' }
  session.roles = [{ id: 'role-1', scope: 'school', status: 'active' }]
  session.permissions = [
    { code: 'users.view', scope: 'school', status: 'active' },
    { code: 'users.manage', scope: 'school', status: 'active' },
    { code: 'roles.view', scope: 'school', status: 'active' },
  ]

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/admin/users/:userId',
        name: 'userDetail',
        component: { template: '<div />' },
      },
      { path: '/admin/users', name: 'usersList', component: { template: '<div />' } },
      { path: '/admin/users/:userId/edit', name: 'userEdit', component: { template: '<div />' } },
    ],
  })
  await router.push(`/admin/users/${recoveryUserId}?user_mode=school`)
  await router.isReady()

  const wrapper = mount(UserDetailPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        AdminDetailPage: {
          name: 'AdminDetailPage',
          props: ['status', 'feedback', 'returnTo'],
          emits: ['retry'],
          template:
            '<section :data-status="status"><button data-test="retry" @click="$emit(\'retry\')">Retry</button><slot/><slot name="actions"/></section>',
        },
        AdminLifecycleDialog: { template: '<div />' },
        AdminAccountLifecycleDialog: { template: '<div />' },
        AdminRowActions: { template: '<div />' },
        UserDetailSections: { template: '<div />' },
        UserInvitationPanel: { template: '<div />' },
        AccountLockPanel: { template: '<div />' },
        AccountLifecycleActions: { template: '<div />' },
      },
    },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('post-restore user detail failure', () => {
  beforeEach(() => vi.clearAllMocks())

  it('stays on detail and retries only getUser without restoring again', async () => {
    getUser
      .mockRejectedValueOnce(restoreFailure(503, 'service_unavailable'))
      .mockResolvedValueOnce({
        id: recoveryUserId,
        schoolId: recoverySchoolId,
        fullName: 'Restored User',
        status: 'active',
        roles: [],
      })
    const { wrapper, router } = await mountPage()
    const detailPage = wrapper.findComponent({ name: 'AdminDetailPage' })

    expect(router.currentRoute.value.name).toBe('userDetail')
    expect(detailPage.props('status')).toBe('unavailable')
    expect(detailPage.props('feedback')).toMatchObject({
      operationId: 'getUser',
      messageKey: 'common.unavailable',
    })
    expect(detailPage.props('returnTo')).toMatchObject({ name: 'usersList' })
    await wrapper.get('[data-test="retry"]').trigger('click')
    await flushPromises()

    expect(getUser).toHaveBeenCalledTimes(2)
    expect(restoreUser).not.toHaveBeenCalled()
    expect(detailPage.props('status')).toBe('ready')
    expect(router.currentRoute.value).toMatchObject({
      name: 'userDetail',
      params: { userId: recoveryUserId },
      query: { user_mode: 'school' },
    })
  })
})
