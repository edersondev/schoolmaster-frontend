import { reactive } from 'vue'
import { assessmentReviewDetailService } from '@/services/assessments/assessmentReviewDetailService'
import { useAdvancedAssessmentRequestGuards } from './useAdvancedAssessmentRequestGuards'

export function useAssessmentReviewDetail({ service = assessmentReviewDetailService, options = {} } = {}) {
  const guard = useAdvancedAssessmentRequestGuards()
  const state = reactive({
    loading: false,
    pendingDownload: false,
    feedback: null,
    response: null,
  })

  async function load(responseAttemptId) {
    state.loading = true
    const captured = guard.capture(['review-detail', responseAttemptId, options.schoolId])
    try {
      const response = await service.get(responseAttemptId, options)
      if (!guard.isCurrent(captured)) return
      state.response = response
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function downloadFile(fileId) {
    if (!state.response?.id || !fileId) return null
    state.pendingDownload = true
    try {
      return await service.downloadFile({ responseAttemptId: state.response.id, fileId }, options)
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pendingDownload = false
    }
  }

  return { state, load, downloadFile }
}
