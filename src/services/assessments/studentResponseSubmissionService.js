import { buildStudentResponsePayload, validateFileSelection, validateLongTextAnswer } from '@/contracts/assessments/studentResponsePayloadMapper'
import { advancedAssessmentService } from './advancedAssessmentService'

export { buildStudentResponsePayload, validateFileSelection, validateLongTextAnswer }

export function createStudentResponseSubmissionService(service = advancedAssessmentService) {
  return {
    get(questionnaireId, options) {
      return service.getQuestionnaire({ questionnaireId }, options)
    },
    submit(input, options) {
      return service.submitStudentQuestionnaireResponse(buildStudentResponsePayload(input), options)
    },
  }
}

export const studentResponseSubmissionService = createStudentResponseSubmissionService()
