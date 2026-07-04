import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AssessmentResponseDetail from '@/components/assessments/AssessmentResponseDetail.vue'
import AnswerFileDownloadControl from '@/components/assessments/AnswerFileDownloadControl.vue'
import FailedScanGradingActions from '@/components/assessments/FailedScanGradingActions.vue'
import { componentGlobal, responseAttempt } from '../fixtures/advancedAssessmentFixtures'

describe('assessment review and grading components', () => {
  it('renders long-text answers, clean downloads, and failed-scan actions without preview', () => {
    expect(mount(AssessmentResponseDetail, { props: { response: responseAttempt }, global: componentGlobal }).text()).toContain('Safe student answer')
    expect(mount(AnswerFileDownloadControl, { props: { file: { displayName: 'answer.pdf', scanStatus: 'clean', downloadAllowed: true } }, global: componentGlobal }).text()).toContain('Download')
    expect(mount(FailedScanGradingActions, { props: { answer: { id: 'a2', scanStatus: 'failed' } }, global: componentGlobal }).text()).toContain('Exempt')
  })
})
