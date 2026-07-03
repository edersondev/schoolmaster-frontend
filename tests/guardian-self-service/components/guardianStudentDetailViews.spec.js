import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GuardianStudentDetailSummary from '@/components/guardian/GuardianStudentDetailSummary.vue'
import GuardianStudentDetailView from '@/pages/guardian/GuardianStudentDetailView.vue'
import { createGuardianI18n } from '../test-utils'

describe('guardian student detail views', () => {
  it('renders limited profile and omits restricted fields', () => {
    const wrapper = mount(GuardianStudentDetailSummary, {
      props: {
        student: {
          fullName: 'Ada Student',
          status: 'active',
          relationshipLabel: 'Mother',
          dateOfBirth: '2012-03-04',
          registrationNumber: 'R-001',
          enrollmentSummary: { gradeLevel: '7', academicYearLabel: '2026' },
          schoolOnlyNotes: 'hidden',
        },
      },
      global: {
        plugins: [createGuardianI18n()],
        stubs: { ElTag: { template: '<span><slot /></span>' } },
      },
    })
    expect(wrapper.text()).toContain('Ada Student')
    expect(wrapper.text()).toContain('Limited guardian-visible profile')
    expect(wrapper.text()).not.toContain('hidden')
  })

  it('exposes dedicated route component', () => {
    expect(GuardianStudentDetailView).toBeTruthy()
  })
})
