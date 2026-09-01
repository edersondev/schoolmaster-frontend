import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi } from 'vitest'
import StudentCreateGuardiansTab from '@/components/admin-system/students/StudentCreateGuardiansTab.vue'
import StudentCreateStudentTab from '@/components/admin-system/students/StudentCreateStudentTab.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      studentGuardianTabs: {
        guardians: {
          add: 'Add guardian',
          empty: 'No guardians added.',
          maximumTwo: 'Maximum two guardians per student.',
          permissionRequired: 'Permission required.',
        },
      },
      studentEnrollmentRoster: { students: {} },
      administration: { common: {} },
    },
  },
})

describe('student create tab components', () => {
  it('renders student tab through existing student form boundary', () => {
    const wrapper = mount(StudentCreateStudentTab, {
      global: {
        plugins: [i18n],
        stubs: { StudentProfileForm: { template: '<div>student form</div>' } },
      },
      props: { modelValue: {} },
    })

    expect(wrapper.text()).toContain('student form')
  })

  it('emits add and shows maximum-two feedback in guardians tab', async () => {
    const wrapper = mount(StudentCreateGuardiansTab, {
      global: {
        plugins: [i18n],
        stubs: {
          ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
          ElButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          GuardianEntryEditor: true,
        },
      },
      props: {
        entries: [],
        canManage: true,
        canAdd: true,
        lookup: vi.fn(),
      },
    })

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('add')?.length).toBeGreaterThanOrEqual(1)

    await wrapper.setProps({ maximumReached: true, canAdd: false })
    expect(wrapper.text()).toContain('Maximum two guardians per student.')
  })
})
