import { describe, expect, it } from 'vitest'
import {
  mapQuestionnaireRequest,
  validateQuestionnaireDraft,
} from '@/modules/teacher-workflow/services/questionnaireService'

describe('questionnaireService mappers', () => {
  it('drops unsupported response/grading question types', () => {
    const request = mapQuestionnaireRequest({
      title: 'Quiz',
      questions: [
        { type: 'multiple_choice', prompt: 'A?', options: ['A'], answer: 'A' },
        { type: 'file_response', prompt: 'Upload' },
      ],
    })
    expect(request.questions).toHaveLength(1)
    expect(request.questions[0].type).toBe('multiple_choice')
  })

  it('validates required authoring fields', () => {
    const errors = validateQuestionnaireDraft({ title: '', questions: [] })
    expect(errors.title).toBeTruthy()
    expect(errors.questions).toBeTruthy()
  })
})
