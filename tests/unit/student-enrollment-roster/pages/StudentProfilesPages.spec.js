import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import StudentProfilesPage from '@/pages/admin-system/students/StudentProfilesPage.vue'
import StudentProfileCreatePage from '@/pages/admin-system/students/StudentProfileCreatePage.vue'
import StudentProfileDetailPage from '@/pages/admin-system/students/StudentProfileDetailPage.vue'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import StudentFilters from '@/components/admin-system/students/StudentFilters.vue'
import StudentTable from '@/components/admin-system/students/StudentTable.vue'
import { studentEnrollmentRosterI18n } from '../fixtures/studentEnrollmentRoster.fixtures'

const mocks = vi.hoisted(() => ({
  updateQuery: vi.fn(),
  load: vi.fn(),
  resetFilters: vi.fn(),
  push: vi.fn(),
  loadDetail: vi.fn(),
  createSubmit: vi.fn(),
  createCancel: vi.fn(),
  lifecycleSubmit: vi.fn(),
  transferSubmit: vi.fn(),
}))

vi.mock('@/composables/admin-system/useStudentProfiles', () => ({
  useStudentProfiles: () => ({
    items: { value: [] },
    detail: {
      value: {
        id: 'student-1',
        fullName: 'Ana Silva',
        registrationNumber: 'STU-001',
        status: 'active',
        activeEligible: true,
      },
    },
    meta: { value: { page: 1, perPage: 25, total: 0 } },
    status: { value: 'ready' },
    error: { value: null },
    query: { value: { search: 'Ana', status: 'active' } },
    updateQuery: mocks.updateQuery,
    load: mocks.load,
    loadDetail: mocks.loadDetail,
    resetFilters: mocks.resetFilters,
  }),
}))
vi.mock('@/composables/admin-system/useAdministrationCreatePage', () => ({
  useAdministrationCreatePage: () => ({
    form: {
      values: {},
      pending: { value: false },
      fieldErrors: { value: {} },
      formError: { value: null },
    },
    submit: mocks.createSubmit,
    cancel: mocks.createCancel,
  }),
}))
vi.mock('@/composables/admin-system/useStudentProfileLifecycle', () => ({
  useStudentProfileLifecycle: () => ({
    form: {},
    pending: { value: false },
    fieldErrors: { value: {} },
    feedback: { value: null },
    submit: mocks.lifecycleSubmit,
  }),
}))
vi.mock('@/composables/admin-system/useStudentTransfer', () => ({
  useStudentTransfer: () => ({
    form: {},
    pending: { value: false },
    fieldErrors: { value: {} },
    feedback: { value: null },
    submit: mocks.transferSubmit,
  }),
}))
vi.mock('@/composables/admin-system/useStudentEnrollmentRosterPermissions', () => ({
  useStudentEnrollmentRosterPermissions: () => ({ canManageStudents: { value: true } }),
}))
vi.mock('@/stores/auth/sessionStore', () => ({
  useAuthSessionStore: () => ({ activeSchool: { id: 'school-1' } }),
}))
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { studentProfileId: 'student-1' },
    query: { search: 'Ana', status: 'active' },
    meta: { returnListRoute: 'studentProfilesList' },
  }),
  useRouter: () => ({ push: mocks.push }),
}))

describe('StudentProfilesPage', () => {
  it('composes the shared list shell, filters, table, and pagination', async () => {
    const wrapper = mount(StudentProfilesPage, {
      global: {
        plugins: [studentEnrollmentRosterI18n(), ElementPlus],
        stubs: { RouterLink: true },
      },
    })

    expect(wrapper.findComponent(AdminListPage).props()).toMatchObject({
      title: 'Student profiles',
      state: 'ready',
      canCreate: true,
    })
    expect(wrapper.findComponent(StudentFilters).props()).toMatchObject({
      search: 'Ana',
      status: 'active',
    })
    expect(wrapper.findComponent(StudentTable).exists()).toBe(true)
    expect(wrapper.findComponent(AdminPagination).props()).toMatchObject({
      page: 1,
      perPage: 25,
      total: 0,
    })

    await wrapper.findComponent(StudentFilters).vm.$emit('submit', {
      search: 'Jo',
      status: 'inactive',
    })
    expect(mocks.updateQuery).toHaveBeenCalledWith({ search: 'Jo', status: 'inactive' })
  })

  it('preserves list query when opening a student', async () => {
    const wrapper = mount(StudentProfilesPage, {
      global: {
        plugins: [studentEnrollmentRosterI18n(), ElementPlus],
        stubs: { RouterLink: true },
      },
    })

    await wrapper.findComponent(StudentTable).vm.$emit('view', { id: 'student-1' })
    expect(mocks.push).toHaveBeenCalledWith({
      name: 'studentProfileDetail',
      params: { studentProfileId: 'student-1' },
      query: { search: 'Ana', status: 'active' },
    })
  })

  it('uses the shared form shell without nesting forms', async () => {
    mocks.createSubmit.mockResolvedValueOnce({ id: 'student-2' })
    const wrapper = mount(StudentProfileCreatePage, {
      global: {
        plugins: [studentEnrollmentRosterI18n(), ElementPlus],
        stubs: { RouterLink: true },
      },
    })

    expect(wrapper.findComponent(AdminFormPage).props('title')).toBe('Create student')
    expect(wrapper.findAll('form')).toHaveLength(1)

    await wrapper.get('form').trigger('submit')
    await Promise.resolve()

    expect(mocks.createSubmit).toHaveBeenCalled()
    expect(mocks.push).toHaveBeenCalledWith({
      name: 'studentProfileDetail',
      params: { studentProfileId: 'student-2' },
      query: { search: 'Ana', status: 'active' },
    })
  })

  it('uses the shared detail shell and keeps student lifecycle actions', () => {
    const wrapper = mount(StudentProfileDetailPage, {
      global: {
        plugins: [studentEnrollmentRosterI18n(), ElementPlus],
        stubs: { RouterLink: true },
      },
    })

    expect(wrapper.findComponent(AdminDetailPage).props()).toMatchObject({
      title: 'Ana Silva',
      status: 'ready',
      recordStatus: 'active',
    })
    expect(wrapper.text()).toContain('Enrollment status')
    expect(wrapper.text()).toContain('Transfer')
    expect(wrapper.text()).not.toContain('Edit')
    expect(mocks.loadDetail).toHaveBeenCalledWith('student-1')
  })
})
