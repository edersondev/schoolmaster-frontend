import { describe, expect, it } from 'vitest'
import { useTeacherContent } from '@/modules/teacher-workflow/composables/useTeacherContent'

describe('useTeacherContent', () => {
  it('maps empty list feedback', async () => {
    const service = {
      list: async () => ({ items: [], meta: { total: 0 } }),
    }
    const composable = useTeacherContent({ service })
    await composable.loadList()
    expect(composable.state.feedback.type).toBe('empty')
  })

  it('blocks invalid upload drafts before service call', async () => {
    const composable = useTeacherContent({ service: {} })
    await composable.upload()
    expect(composable.state.feedback.type).toBe('validation')
  })
})
