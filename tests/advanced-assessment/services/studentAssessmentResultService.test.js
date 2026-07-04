import { describe, expect, it } from 'vitest'
import { mapStudentResult } from '@/services/assessments/studentAssessmentResultService'

describe('student assessment result service', () => {
  it('exposes own safe summary and file metadata only', () => {
    const result = mapStudentResult({
      response_attempt_id: 'r1',
      score_summary: { earned: 8, possible: 10 },
      private_grading_note: 'hidden',
      files: [{ file_id: 'f1', display_name: 'answer.pdf', storage_path: '/private' }],
    })
    expect(result.scoreSummary.earned).toBe(8)
    expect(result.fileAvailabilityMetadata[0]).not.toHaveProperty('storage_path')
  })
})
