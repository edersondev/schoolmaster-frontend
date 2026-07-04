import { mapReviewFilters } from '@/contracts/assessments/advancedAssessmentContract'
import { advancedAssessmentService } from './advancedAssessmentService'

export { mapReviewFilters }

export function createAssessmentReviewQueueService(service = advancedAssessmentService) {
  return {
    list: (query, options) => service.listQuestionnaireResponses(query, options),
  }
}

export const assessmentReviewQueueService = createAssessmentReviewQueueService()
