import { reactive } from 'vue'
import { assessmentGradingService } from '@/services/assessments/assessmentGradingService'

export function useManualAssessmentGrading({ service = assessmentGradingService, options = {} } = {}) {
  const state = reactive({
    pending: false,
    feedback: null,
    lastResult: null,
  })

  async function grade(responseAttemptId, input) {
    state.pending = true
    try {
      state.lastResult = await service.grade(responseAttemptId, input, options)
      state.feedback = { type: 'success' }
      return state.lastResult
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  return { state, grade }
}
