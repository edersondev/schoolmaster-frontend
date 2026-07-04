import { describe, expect, it } from 'vitest'
import { useAdvancedQuestionnaireAuthoring } from '@/composables/assessments/useAdvancedQuestionnaireAuthoring'
import { advancedQuestionnaire } from '../fixtures/advancedAssessmentFixtures'

describe('useAdvancedQuestionnaireAuthoring', () => {
  it('loads schema controls and maps validation state', async () => {
    const service = { get: async () => advancedQuestionnaire, create: async (draft) => ({ id: 'q2', ...draft }) }
    const authoring = useAdvancedQuestionnaireAuthoring({ service })
    await authoring.load('questionnaire-1')
    expect(authoring.state.draft.questions.map((question) => question.type)).toContain('file_response')
    authoring.state.draft.title = ''
    expect(await authoring.save()).toBeNull()
    expect(authoring.state.feedback.type).toBe('validation')
  })
})
