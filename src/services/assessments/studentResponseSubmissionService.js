import { buildStudentResponsePayload, validateFileSelection, validateLongTextAnswer } from '@/contracts/assessments/studentResponsePayloadMapper'
import { advancedAssessmentService } from './advancedAssessmentService'

export { buildStudentResponsePayload, validateFileSelection, validateLongTextAnswer }

export function createStudentResponseSubmissionService(service = advancedAssessmentService) {
  return {
    submit(input, options) {
      return service.submitStudentQuestionnaireResponse(buildStudentResponsePayload(input), options)
    },
  }
}

export const studentResponseSubmissionService = createStudentResponseSubmissionService()
