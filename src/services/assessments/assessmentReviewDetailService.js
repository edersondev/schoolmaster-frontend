import { advancedAssessmentService } from './advancedAssessmentService'

export function createAssessmentReviewDetailService(service = advancedAssessmentService) {
  return {
    get: (responseAttemptId, options) => service.getQuestionnaireResponse({ responseAttemptId }, options),
    downloadFile: ({ responseAttemptId, fileId } = {}, options) =>
      service.downloadQuestionnaireResponseFile({ responseAttemptId, fileId }, options),
  }
}

export const assessmentReviewDetailService = createAssessmentReviewDetailService()
