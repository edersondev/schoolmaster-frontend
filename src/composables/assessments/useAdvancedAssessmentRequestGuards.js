import { shallowRef } from 'vue'
import { ADVANCED_ASSESSMENT_FEEDBACK_STATES } from '@/contracts/assessments/advancedAssessmentContract'
import { createSafeAdvancedAssessmentDiagnostic } from '@/services/assessments/advancedAssessmentErrorMapper'

export function createAdvancedAssessmentRequestKey(parts = []) {
  return parts
    .map((part) => (part === null || part === undefined || part === '' ? 'none' : String(part)))
    .join(':')
}

export function useAdvancedAssessmentRequestGuards() {
  const currentKey = shallowRef('')

  function capture(parts = []) {
    const key = createAdvancedAssessmentRequestKey(parts)
    currentKey.value = key
    return key
  }

  function isCurrent(key) {
    return key === currentKey.value
  }

  function staleFeedback() {
    return { type: ADVANCED_ASSESSMENT_FEEDBACK_STATES.staleResponse }
  }

  return {
    currentKey,
    capture,
    isCurrent,
    staleFeedback,
    safeDiagnostic: createSafeAdvancedAssessmentDiagnostic,
  }
}
