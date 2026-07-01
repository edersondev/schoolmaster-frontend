import { describe, expect, it } from 'vitest'
import { useQuestionnaires } from '@/modules/teacher-workflow/composables/useQuestionnaires'

describe('useQuestionnaires', () => {
  it('maps empty list feedback', async () => {
    const service = {
      list: async () => ({ items: [] }),
    }
    const composable = useQuestionnaires({ service })
    await composable.loadList()
    expect(composable.state.feedback.type).toBe('empty')
  })

  it('validates authoring draft before save', async () => {
    const composable = useQuestionnaires({ service: {} })
    composable.state.draft.title = ''
    composable.state.draft.questions = []
    await composable.save()
    expect(composable.state.feedback.type).toBe('validation')
  })
})
