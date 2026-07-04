import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AdvancedAssessmentFeedbackState from '@/components/assessments/AdvancedAssessmentFeedbackState.vue'
import AdvancedAssessmentStatusBadges from '@/components/assessments/AdvancedAssessmentStatusBadges.vue'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import { componentGlobal } from '../fixtures/advancedAssessmentFixtures'

describe('advanced assessment shared states', () => {
  it('renders safe feedback, badges, and status regions', () => {
    expect(mount(AdvancedAssessmentFeedbackState, { props: { feedback: { type: 'contract-unavailable' } }, global: componentGlobal }).text()).toContain('contract')
    expect(mount(AdvancedAssessmentStatusBadges, { props: { questionType: 'long_text', scanStatus: 'failed' }, global: componentGlobal }).text()).toContain('long text')
    expect(mount(AdvancedAssessmentStatusRegion, { props: { feedback: { type: 'stale-response' } }, global: componentGlobal }).text()).toContain('Older')
  })
})
