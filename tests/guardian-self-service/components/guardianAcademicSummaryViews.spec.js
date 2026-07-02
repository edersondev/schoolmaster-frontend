import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GuardianAcademicSummaryPanels from '@/components/guardian/GuardianAcademicSummaryPanels.vue'
import GuardianLearningSetSummaryList from '@/components/guardian/GuardianLearningSetSummaryList.vue'
import GuardianAcademicSummaryView from '@/pages/guardian/GuardianAcademicSummaryView.vue'
import { createGuardianI18n } from '../test-utils'

const global = {
  plugins: [createGuardianI18n()],
  stubs: { ElTag: { template: '<span><slot /></span>' } },
}

describe('guardian academic summary views', () => {
  it('renders summary-only values and no period picker or reports', () => {
    const wrapper = mount(GuardianAcademicSummaryPanels, {
      props: {
        gradeSummary: { status: 'available', average: null, scale: '100' },
        attendanceSummary: { status: 'available', attendanceRate: 98, totalAbsences: 1 },
      },
      global,
    })
    expect(wrapper.text()).toContain('Unavailable')
    expect(wrapper.text()).toContain('Attendance rate')
    expect(wrapper.text()).not.toMatch(/period picker|report|detailed row|teacher content/i)
  })

  it('renders learning-set summary without questionnaire actions', () => {
    const wrapper = mount(GuardianLearningSetSummaryList, {
      props: {
        items: [{ learningSetId: 'set-1', title: 'Algebra', status: 'in_progress', progressPercent: 50 }],
      },
      global,
    })
    expect(wrapper.text()).toContain('Algebra')
    expect(wrapper.text()).not.toMatch(/questionnaire|download|teacher/i)
  })

  it('exposes dedicated route component', () => {
    expect(GuardianAcademicSummaryView).toBeTruthy()
  })
})
