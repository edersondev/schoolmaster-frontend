import { administrationHttpClient } from '@/services/admin-system/administration-service'
import { authService } from '@/services/auth/authService'
import {
  STUDENT_SELF_SERVICE_ENDPOINTS,
  STUDENT_SELF_SERVICE_OPERATIONS,
} from '@/contracts/student/studentSelfServiceContract'
import {
  compactStudentSelfServiceParams,
  mapStudentAttendanceRecord,
  mapStudentGradeRecord,
  mapStudentLearningSet,
  mapStudentPaginatedEnvelope,
  mapStudentPaginationQuery,
} from '@/contracts/student/studentSelfServiceMappers'
import { normalizeStudentSelfServiceError } from './studentSelfServiceFeedbackMapper'

export function createStudentSelfServiceConfig(
  options = {},
  params = {},
  getAccessToken = () => authService.getAccessToken(),
) {
  const accessToken = getAccessToken?.()
  return {
    params: compactStudentSelfServiceParams(params),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.responseType ? { responseType: options.responseType } : {}),
  }
}

export function createStudentSelfServiceService({
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
} = {}) {
  async function get(path, { params = {}, options = {}, operationId, map = (response) => response?.data ?? response } = {}) {
    try {
      return map(await client.get(path, createStudentSelfServiceConfig(options, params, getAccessToken)))
    } catch (error) {
      throw normalizeStudentSelfServiceError(error, { operationId })
    }
  }

  function listAssignedLearningSets(query = {}, options = {}) {
    return get(STUDENT_SELF_SERVICE_ENDPOINTS.learningSets, {
      params: mapStudentPaginationQuery(query),
      options,
      operationId: STUDENT_SELF_SERVICE_OPERATIONS.listStudentLearningSets,
      map: (response) => mapStudentPaginatedEnvelope(response, mapStudentLearningSet),
    })
  }

  async function downloadAssignedContent({ contentItemId } = {}, options = {}) {
    try {
      const response = await client.get(STUDENT_SELF_SERVICE_ENDPOINTS.teacherContentDownload(contentItemId), {
        ...createStudentSelfServiceConfig(
          { ...options, responseType: options.responseType ?? 'blob' },
          {},
          getAccessToken,
        ),
      })
      return {
        data: response?.data ?? response,
        contentType: response?.headers?.['content-type'] ?? 'application/octet-stream',
        disposition: response?.headers?.['content-disposition'] ?? null,
      }
    } catch (error) {
      throw normalizeStudentSelfServiceError(error, {
        operationId: STUDENT_SELF_SERVICE_OPERATIONS.downloadStudentTeacherContent,
      })
    }
  }

  function listStudentGrades(query = {}, options = {}) {
    return get(STUDENT_SELF_SERVICE_ENDPOINTS.grades, {
      params: mapStudentPaginationQuery(query),
      options,
      operationId: STUDENT_SELF_SERVICE_OPERATIONS.listStudentGrades,
      map: (response) => mapStudentPaginatedEnvelope(response, mapStudentGradeRecord),
    })
  }

  function listStudentAttendance(query = {}, options = {}) {
    return get(STUDENT_SELF_SERVICE_ENDPOINTS.attendance, {
      params: mapStudentPaginationQuery(query),
      options,
      operationId: STUDENT_SELF_SERVICE_OPERATIONS.listStudentAttendance,
      map: (response) => mapStudentPaginatedEnvelope(response, mapStudentAttendanceRecord),
    })
  }

  return {
    listAssignedLearningSets,
    listStudentLearningSets: listAssignedLearningSets,
    downloadAssignedContent,
    downloadStudentTeacherContent: downloadAssignedContent,
    listStudentGrades,
    listStudentAttendance,
  }
}

export const studentSelfServiceService = createStudentSelfServiceService()
