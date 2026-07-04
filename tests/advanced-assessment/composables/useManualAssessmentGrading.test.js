import { describe, expect, it } from 'vitest'
import { useManualAssessmentGrading } from '@/composables/assessments/useManualAssessmentGrading'

describe('useManualAssessmentGrading', () => {
  it('stores conflict or returned-state authority from service', async () => {
    const grading = useManualAssessmentGrading({ service: { grade: async () => ({ id: 'r1', gradingStatus: 'graded' }) } })
    await grading.grade('r1', { answerId: 'a1', score: 90 })
    expect(grading.state.lastResult.gradingStatus).toBe('graded')
  })
})
