import {
  mapQuestionnaire,
  mapQuestionnairePayload,
  validateQuestionnaireDraft,
} from '@/contracts/assessments/advancedAssessmentContract'
import { advancedAssessmentService } from './advancedAssessmentService'

export { mapQuestionnaire, mapQuestionnairePayload, validateQuestionnaireDraft }

export function createQuestionnaireAuthoringService(service = advancedAssessmentService) {
  return {
    create: (payload, options) => service.createQuestionnaire(payload, options),
    update: (questionnaireId, payload, options) =>
      service.updateQuestionnaire({ questionnaireId, payload }, options),
    get: (questionnaireId, options) => service.getQuestionnaire({ questionnaireId }, options),
  }
}

export const questionnaireAuthoringService = createQuestionnaireAuthoringService()
