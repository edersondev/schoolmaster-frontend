import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import UserDetailPage from '@/pages/admin-system/users/UserDetailPage.vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

const detail = vi.hoisted(() => ({
  record: { value: null },
  status: { value: 'ready' },
  error: { value: null },
  load: vi.fn(),
  retry: vi.fn(),
  reset: vi.fn(),
}))
const accountLifecycle = vi.hoisted(() => ({
  lock: { value: { status: 'none' } },
  loading: { value: false },
  pending: { value: false },
  error: { value: null },
  fieldErrors: { value: {} },
  open: { value: false },
  action: { value: '' },
  reason: { value: '' },
  eligibility: { value: { blocked: false, canLock: true } },
  loadLock: vi.fn(),
  launch: vi.fn(),
  close: vi.fn(),
  submit: vi.fn(),
}))

vi.mock('@/composables/admin-system/useAdminDetail', () => ({ useAdminDetail: () => detail }))
vi.mock('@/composables/admin-system/useAccountLifecycleActions', () => ({
  useAccountLifecycleActions: () => accountLifecycle,
}))
vi.mock('@/composables/admin-system/useAdminActionEligibility', () => ({
  deriveLifecycleActions: () => [],
}))
vi.mock('@/composables/admin-system/useAdminLifecycleAction', () => ({
  useAdminLifecycleAction: () => ({
    target: { value: null },
    open: { value: false },
    form: {},
    action: { value: '' },
    pending: { value: false },
    fieldErrors: { value: {} },
    formError: { value: null },
    launch: vi.fn(),
    submit: vi.fn(),
    close: vi.fn(),
  }),
}))
vi.mock('@/services/admin-system/users', () => ({
  activateUser: vi.fn(),
  deactivateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUser: vi.fn(),
  restoreUser: vi.fn(),
}))

async function mountPage(blocked = false, mode = 'school') {
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
  if (mode === 'platform') {
    session.roles = [{ name: 'System Administrator', scope: 'platform', status: 'active' }]
    session.permissions.push(
      { code: 'schools.view', scope: 'platform', status: 'active' },
      { code: 'users.view', scope: 'platform', status: 'active' },
      { code: 'users.manage', scope: 'platform', status: 'active' },
      { code: 'roles.view', scope: 'platform', status: 'active' },
      { code: 'account_lifecycle.manage', scope: 'platform', status: 'active' },
    )
  }
  detail.record.value = {
    ...userRecord,
    schoolId: mode === 'platform' ? null : userRecord.schoolId,
  }
  accountLifecycle.eligibility.value = { blocked, canLock: !blocked }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/admin/users/:userId', name: 'userDetail', component: { template: '<div />' } },
      { path: '/admin/users', name: 'usersList', component: { template: '<div />' } },
      { path: '/admin/users/:userId/edit', name: 'userEdit', component: { template: '<div />' } },
    ],
  })
  await router.push(`/admin/users/${userRecord.id}?user_mode=${mode}`)
  await router.isReady()

  return mount(UserDetailPage, {
    global: {
      plugins: [...plugins, router],
      stubs: {
        AdminDetailPage: {
          props: ['canEdit'],
          template:
            '<main><button v-if="canEdit" data-test="detail-edit">Edit</button><slot name="actions"/><slot/></main>',
        },
        AdminRowActions: true,
        UserDetailSections: true,
        UserInvitationPanel: { template: '<section data-test="invitation-panel" />' },
        AccountLockPanel: {
          props: ['hidden'],
          template: '<section v-if="!hidden" data-test="lock-panel" />',
        },
        AccountLifecycleActions: {
          template: '<button data-test="lifecycle-action" @click="$emit(\'action\', \'lock\')" />',
        },
        AdminLifecycleDialog: true,
        AdminAccountLifecycleDialog: true,
      },
    },
  })
}

describe('UserDetail account lifecycle integration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mounts authorized panels and delegates action intent', async () => {
    const wrapper = await mountPage(false)

    expect(wrapper.find('[data-test="invitation-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="lock-panel"]').exists()).toBe(true)
    await wrapper.get('[data-test="lifecycle-action"]').trigger('click')
    expect(accountLifecycle.launch).toHaveBeenCalledWith('lock')
  })

  it('unmounts all lifecycle panels when denied', async () => {
    const wrapper = await mountPage(true)

    expect(wrapper.find('[data-test="invitation-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="lock-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="lifecycle-action"]').exists()).toBe(false)
  })

  it('does not expose the school-only editor for a platform user', async () => {
    const wrapper = await mountPage(false, 'platform')

    expect(wrapper.find('[data-test="detail-edit"]').exists()).toBe(false)
  })
})
