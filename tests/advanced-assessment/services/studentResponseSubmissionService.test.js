import { describe, expect, it } from 'vitest'
import { buildStudentResponsePayload, validateFileSelection, validateLongTextAnswer } from '@/services/assessments/studentResponseSubmissionService'

describe('student response submission service', () => {
  it('validates final-submit long-text and file selections', () => {
    expect(validateLongTextAnswer('   ').reason).toBe('blank')
    expect(validateLongTextAnswer('abc', { minLength: 5 }).reason).toBe('too-short')
    expect(validateLongTextAnswer('valid').valid).toBe(true)
    const file = new File(['x'], 'answer.pdf', { type: 'application/pdf' })
    expect(validateFileSelection([file]).valid).toBe(true)
  })

  it('builds payload without staged upload state when only text exists', () => {
    const payload = buildStudentResponsePayload({
      questionnaireId: 'q1',
      learningSetId: 'ls1',
      textAnswers: [{ questionId: 'a1', value: 'Answer' }],
    })
    expect(payload.answers[0]).toEqual({ question_id: 'a1', text_answer: 'Answer' })
  })
})
