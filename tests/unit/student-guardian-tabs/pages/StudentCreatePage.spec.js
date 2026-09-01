import { mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi } from 'vitest'
import StudentProfileCreatePage from '@/pages/admin-system/students/StudentProfileCreatePage.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/composables/admin-system/useStudentCreateWorkflow', () => ({
  useStudentCreateWorkflow: () => ({
    activeTab: ref('student'),
    tabErrors: computed(() => ({ student: false, guardians: false })),
    canManageGuardians: computed(() => true),
    canAddGuardian: computed(() => true),
    maximumReached: computed(() => false),
    guardianEntries: computed(() => []),
    addGuardian: vi.fn(),
    removeGuardian: vi.fn(),
    updateGuardian: vi.fn(),
    lookupGuardians: vi.fn(),
    page: {
      form: {
        values: reactive({ guardianAssociations: [] }),
        pending: ref(false),
        fieldErrors: ref({}),
        formError: ref(null),
      },
      submit: vi.fn().mockResolvedValue({ id: 'student-1' }),
      cancel: vi.fn(),
    },
  }),
}))

describe('StudentProfileCreatePage guardian tabs', () => {
  it('renders Student and Guardians tabs', () => {
    const wrapper = mount(StudentProfileCreatePage, {
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'en',
            messages: {
              en: {
                studentEnrollmentRoster: { students: { create: 'Create student' } },
                studentGuardianTabs: { tabs: { student: 'Student', guardians: 'Guardians' } },
                administration: {
                  common: {
                    cancel: 'Cancel',
                    submit: 'Create',
                    validationSummary: 'Correct fields',
                  },
                },
              },
            },
          }),
        ],
        stubs: {
          AdminFormPage: { template: '<form><slot /></form>' },
          ElTabs: { template: '<div><slot /></div>' },
          ElTabPane: { template: '<section><slot name="label" /><slot /></section>' },
          ElBadge: true,
          StudentCreateStudentTab: true,
          StudentCreateGuardiansTab: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Student')
    expect(wrapper.text()).toContain('Guardians')
  })
})
