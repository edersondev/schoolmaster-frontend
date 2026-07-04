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
})
