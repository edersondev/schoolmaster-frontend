import { administrationHttpClient } from '@/services/admin-system/administration-service'
import { authService } from '@/services/auth/authService'
import {
  ADVANCED_ASSESSMENT_ENDPOINTS,
  ADVANCED_ASSESSMENT_OPERATIONS,
  compactAssessmentParams,
  mapAssessmentPaginatedEnvelope,
  mapAssessmentPaginationQuery,
  mapQuestionnaire,
  mapQuestionnairePayload,
  mapResponseAttempt,
  mapReviewFilters,
  mapStudentResult,
  unwrapAssessmentData,
} from '@/contracts/assessments/advancedAssessmentContract'
import { normalizeAdvancedAssessmentError } from './advancedAssessmentErrorMapper'

export function createAdvancedAssessmentConfig(options = {}, params = {}, getAccessToken = () => authService.getAccessToken()) {
  const accessToken = getAccessToken?.()
  return {
    params: compactAssessmentParams(params),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.responseType ? { responseType: options.responseType } : {}),
  }
}

export function createAdvancedAssessmentHttp({
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
} = {}) {
  async function get(path, { params = {}, options = {}, operationId, map = unwrapAssessmentData } = {}) {
    try {
      return map(await client.get(path, createAdvancedAssessmentConfig(options, params, getAccessToken)))
    } catch (error) {
      throw normalizeAdvancedAssessmentError(error, { operationId })
    }
  }

  async function post(path, payload = {}, { options = {}, operationId, map = unwrapAssessmentData } = {}) {
    try {
      return map(await client.post(path, payload, createAdvancedAssessmentConfig(options, {}, getAccessToken)))
    } catch (error) {
      throw normalizeAdvancedAssessmentError(error, { operationId })
    }
  }

  async function patch(path, payload = {}, { options = {}, operationId, map = unwrapAssessmentData } = {}) {
    try {
      return map(await client.patch(path, payload, createAdvancedAssessmentConfig(options, {}, getAccessToken)))
    } catch (error) {
      throw normalizeAdvancedAssessmentError(error, { operationId })
    }
  }

  return { get, post, patch }
}

export function createAdvancedAssessmentService(http = createAdvancedAssessmentHttp()) {
  return {
    createQuestionnaire(payload = {}, options = {}) {
      return http.post(ADVANCED_ASSESSMENT_ENDPOINTS.questionnaires, mapQuestionnairePayload(payload), {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.createQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapAssessmentData(response)),
      })
    },
    updateQuestionnaire({ questionnaireId, payload } = {}, options = {}) {
      return http.patch(ADVANCED_ASSESSMENT_ENDPOINTS.questionnaire(questionnaireId), mapQuestionnairePayload(payload), {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.updateQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapAssessmentData(response)),
      })
    },
    getQuestionnaire({ questionnaireId } = {}, options = {}) {
      return http.get(ADVANCED_ASSESSMENT_ENDPOINTS.questionnaire(questionnaireId), {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.getQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapAssessmentData(response)),
      })
    },
    submitStudentQuestionnaireResponse(payload = {}, options = {}) {
      return http.post(ADVANCED_ASSESSMENT_ENDPOINTS.studentResponses, payload, {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.submitStudentQuestionnaireResponse,
        map: (response) => mapResponseAttempt(unwrapAssessmentData(response)),
      })
    },
    getStudentQuestionnaireResponse({ responseAttemptId } = {}, options = {}) {
      return http.get(ADVANCED_ASSESSMENT_ENDPOINTS.studentResponse(responseAttemptId), {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.getStudentQuestionnaireResponse,
        map: (response) => mapStudentResult(unwrapAssessmentData(response)),
      })
    },
    listQuestionnaireResponses(query = {}, options = {}) {
      return http.get(ADVANCED_ASSESSMENT_ENDPOINTS.responses, {
        params: {
          ...mapAssessmentPaginationQuery(query),
          ...mapReviewFilters(query.filters ?? query),
        },
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.listQuestionnaireResponses,
        map: (response) => mapAssessmentPaginatedEnvelope(response?.data ?? response, mapResponseAttempt),
      })
    },
    getQuestionnaireResponse({ responseAttemptId } = {}, options = {}) {
      return http.get(ADVANCED_ASSESSMENT_ENDPOINTS.response(responseAttemptId), {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.getQuestionnaireResponse,
        map: (response) => mapResponseAttempt(unwrapAssessmentData(response)),
      })
    },
    gradeQuestionnaireResponse({ responseAttemptId, payload } = {}, options = {}) {
      return http.post(ADVANCED_ASSESSMENT_ENDPOINTS.grading(responseAttemptId), payload, {
        options,
        operationId: ADVANCED_ASSESSMENT_OPERATIONS.gradeQuestionnaireResponse,
        map: (response) => mapResponseAttempt(unwrapAssessmentData(response)),
      })
    },
    async downloadQuestionnaireResponseFile({ responseAttemptId, fileId } = {}, options = {}) {
      try {
        const response = await administrationHttpClient.get(
          ADVANCED_ASSESSMENT_ENDPOINTS.downloadFile(responseAttemptId, fileId),
          createAdvancedAssessmentConfig({ ...options, responseType: options.responseType ?? 'blob' }, {}, authService.getAccessToken),
        )
        return {
          data: response?.data ?? response,
          contentType: response?.headers?.['content-type'] ?? 'application/octet-stream',
          disposition: response?.headers?.['content-disposition'] ?? null,
        }
      } catch (error) {
        throw normalizeAdvancedAssessmentError(error, {
          operationId: ADVANCED_ASSESSMENT_OPERATIONS.downloadQuestionnaireResponseFile,
        })
      }
    },
  }
}

export const advancedAssessmentService = createAdvancedAssessmentService()
