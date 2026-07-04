import { reactive } from 'vue'
import { studentAssessmentResultService } from '@/services/assessments/studentAssessmentResultService'
import { useAdvancedAssessmentRequestGuards } from './useAdvancedAssessmentRequestGuards'

export function useStudentAssessmentResult({ service = studentAssessmentResultService, options = {} } = {}) {
  const guard = useAdvancedAssessmentRequestGuards()
  const state = reactive({
    loading: false,
    feedback: null,
    result: null,
  })

  async function load(responseAttemptId) {
    state.loading = true
    const captured = guard.capture(['student-result', responseAttemptId, options.schoolId])
    try {
      const result = await service.get(responseAttemptId, options)
      if (!guard.isCurrent(captured)) return
      state.result = result
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  return { state, load }
}
