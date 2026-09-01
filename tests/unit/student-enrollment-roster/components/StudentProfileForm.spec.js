import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import StudentFilters from '@/components/admin-system/students/StudentFilters.vue'
import StudentProfileForm from '@/components/admin-system/students/StudentProfileForm.vue'
import StudentTable from '@/components/admin-system/students/StudentTable.vue'
import { studentEnrollmentRosterI18n } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student administration presentation', () => {
  it('renders approved profile fields without owning the page form', () => {
    const wrapper = mount(StudentProfileForm, {
      global: { plugins: [studentEnrollmentRosterI18n(), ElementPlus] },
      props: { modelValue: {} },
    })

    expect(wrapper.text()).toContain('Registration number')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Save')
  })

  it('submits and resets only approved list filters', async () => {
    const wrapper = mount(StudentFilters, {
      global: { plugins: [studentEnrollmentRosterI18n(), ElementPlus] },
      props: { search: 'Ana', status: 'active' },
    })

    await wrapper.find('form').trigger('submit')
    await wrapper.find('[data-test="student-filter-reset"]').trigger('click')

    expect(wrapper.find('[data-test="student-filter-search"]').attributes('maxlength')).toBe('120')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ search: 'Ana', status: 'active' }])
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

  it('renders the shared table contract and emits view actions', async () => {
    const student = {
      id: 'student-1',
      fullName: 'Ana Silva',
      registrationNumber: 'STU-001',
      enrolledAt: '2026-02-01',
      status: 'active',
    }
    const wrapper = mount(StudentTable, {
      global: {
        plugins: [studentEnrollmentRosterI18n(), ElementPlus],
        stubs: {
          AdminDataTable: {
            props: ['rows'],
            template:
              '<div><slot name="fullName" :row="rows[0]" /><slot name="status" :row="rows[0]" /><slot name="actions" :row="rows[0]" /></div>',
          },
        },
      },
      props: { rows: [student] },
    })

    expect(wrapper.text()).toContain('Ana Silva')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('View')

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('view')?.[0]).toEqual([student])
  })
})
