import { describe, expect, it } from 'vitest'
import { useAssessmentReviewQueue } from '@/composables/assessments/useAssessmentReviewQueue'

describe('useAssessmentReviewQueue', () => {
  it('loads paginated empty states safely', async () => {
    const queue = useAssessmentReviewQueue({ service: { list: async () => ({ items: [], pagination: { page: 1, perPage: 15, total: 0 } }) } })
    await queue.load()
    expect(queue.state.feedback.type).toBe('empty')
  })
})
