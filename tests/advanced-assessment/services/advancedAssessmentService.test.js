import { describe, expect, it } from 'vitest'
import {
  mapQuestionnairePayload,
  mapResponseAttempt,
  mapReviewFilters,
} from '@/contracts/assessments/advancedAssessmentContract'
import { normalizeAdvancedAssessmentError } from '@/services/assessments/advancedAssessmentErrorMapper'

describe('advanced assessment service mappers', () => {
  it('keeps approved operations and drops undocumented questionnaire fields', () => {
    const payload = mapQuestionnairePayload({
      title: 'Quiz',
      questions: [
        { type: 'long_text', prompt: 'Explain', answerSchema: { maxLength: 10000 } },
        { type: 'rating', prompt: 'Unsupported' },
      ],
    })
    expect(payload.questions).toHaveLength(1)
    expect(payload.questions[0].type).toBe('long_text')
  })

  it('keeps only documented review filters', () => {
    expect(mapReviewFilters({ questionnaireId: 'q1', scanStatus: 'clean', gradingStatus: 'pending' })).toEqual({
      questionnaire_id: 'q1',
      grading_status: 'pending',
    })
  })

  it('maps safe response fields and excludes private data', () => {
    const mapped = mapResponseAttempt({
      response_attempt_id: 'r1',
      private_note: 'hide',
      answers: [{ answer_id: 'a1', text_answer: 'Visible' }],
      files: [{ file_id: 'f1', display_name: 'safe.pdf', storage_path: '/secret' }],
    })
    expect(mapped.files[0]).not.toHaveProperty('storagePath')
    expect(mapped.answers[0].text).toBe('Visible')
  })

  it('normalizes contract-unavailable errors safely', () => {
    const error = normalizeAdvancedAssessmentError({ response: { status: 503, data: { error: { code: 'CONTRACT_UNAVAILABLE' } } } })
    expect(error.type).toBe('contract-unavailable')
    expect(error.diagnostic).toEqual(expect.objectContaining({ status: 503 }))
  })
})
