import { describe, expect, it } from 'vitest'
import { mapQuestionnairePayload, validateQuestionnaireDraft } from '@/services/assessments/questionnaireAuthoringService'

describe('questionnaire authoring service', () => {
  it('maps advanced schemas and validation without unsupported controls', () => {
    const payload = mapQuestionnairePayload({
      title: 'Quiz',
      questions: [{ type: 'file_response', prompt: 'Upload', fileRule: { allowedCategories: ['pdf'] } }],
    })
    expect(payload.questions[0].file_rule.allowedCategories).toEqual(['pdf'])
    expect(validateQuestionnaireDraft({ title: '', questions: [{ type: 'media', prompt: '' }] })).toEqual(
      expect.objectContaining({ title: ['Title is required.'], 'questions.0.type': ['Unsupported question type.'] }),
    )
  })
})
