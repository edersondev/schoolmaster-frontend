import { mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi } from 'vitest'
import StudentProfileDetailPage from '@/pages/admin-system/students/StudentProfileDetailPage.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { studentProfileId: 'student-1' }, query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/stores/auth/sessionStore', () => ({
  useAuthSessionStore: () => ({ activeSchool: { id: 'school-1' } }),
}))

vi.mock('@/composables/admin-system/useStudentProfiles', () => ({
  useStudentProfiles: () => ({
    detail: ref({
      fullName: 'Ana Souza',
      status: 'active',
      guardianAssociations: [
        {
          id: 'guardian-1',
          fullName: 'Maria Souza',
          relationshipType: 'mother',
          contactEmail: 'maria@example.com',
          contactPhone: '11999999999',
          status: 'active',
        },
      ],
    }),
    status: ref('ready'),
    error: ref(null),
    loadDetail: vi.fn(),
  }),
}))

vi.mock('@/composables/admin-system/useStudentProfileLifecycle', () => ({
  useStudentProfileLifecycle: () => ({
    form: reactive({ status: 'active' }),
    pending: ref(false),
    fieldErrors: ref({}),
    feedback: ref(null),
    submit: vi.fn(),
  }),
}))

vi.mock('@/composables/admin-system/useStudentTransfer', () => ({
  useStudentTransfer: () => ({
    form: reactive({}),
    pending: ref(false),
    fieldErrors: ref({}),
    feedback: ref(null),
    submit: vi.fn(),
  }),
}))

vi.mock('@/composables/admin-system/useStudentEnrollmentRosterPermissions', () => ({
  useStudentEnrollmentRosterPermissions: () => ({
    canManageStudents: computed(() => true),
  }),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      studentEnrollmentRoster: {
        students: { transfer: 'Transfer' },
      },
      studentGuardianTabs: {
        tabs: { student: 'Student', guardians: 'Guardians' },
        guardians: {
          empty: 'No guardians added.',
          relationship: 'Relationship',
          email: 'Email',
          phone: 'Phone',
        },
      },
    },
  },
})

const stubs = {
  AdminDetailPage: {
    props: ['title'],
    template: '<div><span class="detail-title">{{ title }}</span><slot name="actions" /><slot /></div>',
  },
  ElTabs: { template: '<div><slot /></div>' },
  ElTabPane: {
    props: ['label'],
    template: '<section><span class="tab-label">{{ label }}</span><slot name="label" /><slot /></section>',
  },
  ElButton: true,
  StudentProfileSummaryPanel: true,
  StudentEnrollmentStatusPanel: true,
  StudentTransferDialog: true,
  AdminStatusTag: {
    props: ['status'],
    template: '<span class="status-tag">{{ status }}</span>',
  },
}

describe('StudentProfileDetailPage guardian tabs', () => {
  it('renders Student and Guardians tabs with guardian associations', () => {
    const wrapper = mount(StudentProfileDetailPage, {
      global: { plugins: [i18n], stubs },
    })

    expect(wrapper.text()).toContain('Student')
    expect(wrapper.text()).toContain('Guardians')
    expect(wrapper.text()).toContain('Ana Souza')
    expect(wrapper.text()).toContain('Maria Souza')
    expect(wrapper.text()).toContain('mother')
    expect(wrapper.text()).toContain('(11) 99999-9999')
  })
})
