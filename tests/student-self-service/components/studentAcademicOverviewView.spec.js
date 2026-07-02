import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StudentAcademicOverviewCards from '@/components/student/StudentAcademicOverviewCards.vue'
import { createStudentI18n } from '../test-utils'

describe('student academic overview view', () => {
  it('renders counts and statuses only', () => {
    const wrapper = mount(StudentAcademicOverviewCards, {
      props: {
        summary: {
          assignedLearningSetCount: 2,
          downloadableContentCount: 1,
          unavailableContentCount: 1,
          gradeStatusCounts: { active: 2 },
          attendanceStatusCounts: { present: 3 },
        },
      },
      global: { plugins: [createStudentI18n()] },
    })
    expect(wrapper.text()).toContain('Assigned learning sets')
    expect(wrapper.text()).toContain('active')
    expect(wrapper.text()).toContain('present')
    expect(wrapper.text()).not.toMatch(/GPA|Attendance rate|Ranking|Trend|Transcript|Report run/)
  })
})
