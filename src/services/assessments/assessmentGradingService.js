import { mapFailedScanActionPayload, mapManualGradingPayload } from '@/contracts/assessments/assessmentGradingMapper'
import { advancedAssessmentService } from './advancedAssessmentService'

export { mapFailedScanActionPayload, mapManualGradingPayload }

export function createAssessmentGradingService(service = advancedAssessmentService) {
  return {
    grade(responseAttemptId, input, options) {
      const mapped = input.failedScanAction
        ? mapFailedScanActionPayload({ answerId: input.answerId, action: input.failedScanAction })
        : mapManualGradingPayload(input)
      if (!mapped.valid) return Promise.reject({ feedbackState: 'validation', gate: mapped.reason })
      return service.gradeQuestionnaireResponse({ responseAttemptId, payload: mapped.payload }, options)
    },
  }
}

export const assessmentGradingService = createAssessmentGradingService()
