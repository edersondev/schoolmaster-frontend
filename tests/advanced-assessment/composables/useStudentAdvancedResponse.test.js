import { describe, expect, it } from 'vitest'
import { useStudentAdvancedResponse } from '@/composables/assessments/useStudentAdvancedResponse'
import { advancedQuestionnaire } from '../fixtures/advancedAssessmentFixtures'

describe('useStudentAdvancedResponse', () => {
  it('keeps drafts local until final submit', async () => {
    let submitted = false
    const service = { submit: async () => { submitted = true; return { id: 'r1' } } }
    const composable = useStudentAdvancedResponse({ service, questionnaire: advancedQuestionnaire })
    composable.setTextAnswer('q-long', 'Answer')
    expect(submitted).toBe(false)
    await composable.submit()
    expect(submitted).toBe(false)
    expect(composable.state.feedback.type).toBe('validation')
  })

  it('loads the routed questionnaire before allowing submission', async () => {
    const calls = []
    const service = {
      get: async (questionnaireId) => ({ ...advancedQuestionnaire, id: questionnaireId }),
      submit: async (input) => {
        calls.push(input)
        return { id: 'r1' }
      },
    }
    const composable = useStudentAdvancedResponse({ service })
    await composable.submit()
    expect(composable.state.feedback.fields.questionnaire).toEqual(['missing-questionnaire'])

    await composable.load('questionnaire-routed')
    composable.setTextAnswer('q-long', 'Answer')
    const file = new File(['x'], 'answer.pdf', { type: 'application/pdf' })
    composable.setFileAnswer('q-file', [file], advancedQuestionnaire.questions[1].fileRule)
    await composable.submit()

    expect(calls[0]).toEqual(expect.objectContaining({ questionnaireId: 'questionnaire-routed' }))
  })

  it('requires authored text-like question answers before submit', () => {
    const composable = useStudentAdvancedResponse({
      questionnaire: {
        id: 'q1',
        questions: [
          { id: 'q-multiple', type: 'multiple_choice', options: [{ label: 'A', value: 'a' }] },
          { id: 'q-boolean', type: 'true_false' },
          { id: 'q-short', type: 'short_text' },
        ],
      },
    })
    expect(composable.validationErrors()).toEqual({
      'q-multiple': ['blank'],
      'q-boolean': ['blank'],
      'q-short': ['blank'],
    })

    composable.setTextAnswer('q-multiple', 'a')
    composable.setTextAnswer('q-boolean', 'false')
    composable.setTextAnswer('q-short', 'Brief answer')
    expect(composable.validationErrors()).toEqual({})
  })
})
