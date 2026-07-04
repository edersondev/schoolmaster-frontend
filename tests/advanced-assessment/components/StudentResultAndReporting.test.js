import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StudentAssessmentResultSummary from '@/components/assessments/StudentAssessmentResultSummary.vue'
import StudentResultFileAvailability from '@/components/assessments/StudentResultFileAvailability.vue'
import AdvancedAssessmentReportingPanel from '@/components/assessments/AdvancedAssessmentReportingPanel.vue'
import { componentGlobal } from '../fixtures/advancedAssessmentFixtures'

describe('student result and reporting components', () => {
  it('renders safe summaries and aggregate-only fields', () => {
    const result = { gradingStatus: 'graded', scoreSummary: '8/10', teacherFeedbackSummary: 'Good', fileAvailabilityMetadata: [{ id: 'f1', displayName: 'answer.pdf', availabilityState: 'clean' }] }
    expect(mount(StudentAssessmentResultSummary, { props: { result }, global: componentGlobal }).text()).toContain('Good')
    expect(mount(StudentResultFileAvailability, { props: { files: result.fileAvailabilityMetadata }, global: componentGlobal }).text()).toContain('clean')
    const reporting = mount(AdvancedAssessmentReportingPanel, { props: { fields: ['assessment_counts', 'score_summary'] }, global: componentGlobal })
    expect(reporting.text()).not.toContain('raw_answer')
  })
})
