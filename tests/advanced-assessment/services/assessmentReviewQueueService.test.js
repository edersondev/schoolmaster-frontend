import { describe, expect, it } from 'vitest'
import { mapReviewFilters } from '@/services/assessments/assessmentReviewQueueService'

describe('assessment review queue service', () => {
  it('submits documented filters only', () => {
    expect(mapReviewFilters({ questionnaireId: 'q1', learningSetId: 'l1', gradingStatus: 'pending', responseStatus: 'submitted' })).toEqual({
      questionnaire_id: 'q1',
      learning_set_id: 'l1',
      grading_status: 'pending',
    })
  })
})
