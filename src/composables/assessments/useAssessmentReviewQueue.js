import { reactive } from 'vue'
import { assessmentReviewQueueService } from '@/services/assessments/assessmentReviewQueueService'
import { useAdvancedAssessmentRequestGuards } from './useAdvancedAssessmentRequestGuards'

export function useAssessmentReviewQueue({ service = assessmentReviewQueueService, options = {} } = {}) {
  const guard = useAdvancedAssessmentRequestGuards()
  const state = reactive({
    loading: false,
    feedback: null,
    items: [],
    filters: { questionnaireId: '', learningSetId: '', gradingStatus: '' },
    pagination: { page: 1, perPage: 15, total: 0 },
  })

  async function load(query = {}) {
    state.loading = true
    const nextQuery = { ...state.pagination, ...query, filters: { ...state.filters, ...(query.filters ?? {}) } }
    const captured = guard.capture(['review-queue', options.schoolId, JSON.stringify(nextQuery)])
    try {
      const response = await service.list(nextQuery, options)
      if (!guard.isCurrent(captured)) return
      state.items = response.items
      state.pagination = response.pagination
      state.feedback = response.items.length ? null : { type: 'empty' }
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  return { state, load }
}
