import { describe, expect, it } from 'vitest'
import { useStudentAssessmentResult } from '@/composables/assessments/useStudentAssessmentResult'

describe('useStudentAssessmentResult', () => {
  it('loads student-owned result summary', async () => {
    const result = useStudentAssessmentResult({ service: { get: async () => ({ responseAttemptId: 'r1', gradingStatus: 'graded' }) } })
    await result.load('r1')
    expect(result.state.result.gradingStatus).toBe('graded')
  })
})
