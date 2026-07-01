import { describe, expect, it } from 'vitest'
import { useLearningSets } from '@/modules/teacher-workflow/composables/useLearningSets'

describe('useLearningSets', () => {
  it('keeps scoped list blocked when contract gate is false', async () => {
    const composable = useLearningSets()
    await composable.loadList()
    expect(composable.state.feedback).toMatchObject({
      type: 'unsupported-contract',
      code: 'scopedLearningSetList',
    })
  })
})
