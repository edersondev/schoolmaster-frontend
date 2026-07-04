import { mapStudentResult } from '@/contracts/assessments/advancedAssessmentContract'
import { advancedAssessmentService } from './advancedAssessmentService'

export { mapStudentResult }

export function createStudentAssessmentResultService(service = advancedAssessmentService) {
  return {
    get: (responseAttemptId, options) =>
      service.getStudentQuestionnaireResponse({ responseAttemptId }, options),
  }
}

export const studentAssessmentResultService = createStudentAssessmentResultService()
