import { administrationHttpClient } from '@/services/admin-system/administration-service'
import { authService } from '@/services/auth/authService'
import {
  GUARDIAN_SELF_SERVICE_ENDPOINTS,
  GUARDIAN_SELF_SERVICE_OPERATIONS,
} from '@/contracts/guardian/guardianSelfServiceContract'
import {
  compactGuardianSelfServiceParams,
  mapGuardianAcademicSummary,
  mapGuardianContactView,
  mapGuardianPaginatedEnvelope,
  mapGuardianPaginationQuery,
  mapGuardianStudentDetail,
  mapGuardianStudentSummary,
} from '@/contracts/guardian/guardianSelfServiceMappers'
import { normalizeGuardianSelfServiceError } from './guardianSelfServiceFeedbackMapper'

export function createGuardianSelfServiceConfig(
  options = {},
  params = {},
  getAccessToken = () => authService.getAccessToken(),
) {
  const accessToken = getAccessToken?.()
  return {
    params: compactGuardianSelfServiceParams(params),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
  }
}

export function createGuardianSelfServiceService({
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
} = {}) {
  async function get(path, { params = {}, options = {}, operationId, map = (response) => response?.data ?? response } = {}) {
    try {
      return map(await client.get(path, createGuardianSelfServiceConfig(options, params, getAccessToken)))
    } catch (error) {
      throw normalizeGuardianSelfServiceError(error, { operationId })
    }
  }

  function listGuardianStudents(query = {}, options = {}) {
    return get(GUARDIAN_SELF_SERVICE_ENDPOINTS.students, {
      params: mapGuardianPaginationQuery(query),
      options,
      operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.listGuardianStudents,
      map: (response) => mapGuardianPaginatedEnvelope(response, mapGuardianStudentSummary),
    })
  }

  function getGuardianStudent({ studentProfileId } = {}, options = {}) {
    return get(GUARDIAN_SELF_SERVICE_ENDPOINTS.student(studentProfileId), {
      options,
      operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.getGuardianStudent,
      map: (response) => mapGuardianStudentDetail(response?.data?.data ?? response?.data ?? response),
    })
  }

  function getGuardianStudentAcademics({ studentProfileId, academicPeriodId } = {}, options = {}) {
    return get(GUARDIAN_SELF_SERVICE_ENDPOINTS.academics(studentProfileId), {
      params: mapGuardianPaginationQuery({ academicPeriodId }),
      options,
      operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.getGuardianStudentAcademics,
      map: (response) => mapGuardianAcademicSummary(response?.data?.data ?? response?.data ?? response),
    })
  }

  function getGuardianStudentContacts({ studentProfileId } = {}, options = {}) {
    return get(GUARDIAN_SELF_SERVICE_ENDPOINTS.contacts(studentProfileId), {
      options,
      operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.getGuardianStudentContacts,
      map: (response) => mapGuardianContactView(response?.data?.data ?? response?.data ?? response),
    })
  }

  return {
    listGuardianStudents,
    getGuardianStudent,
    getGuardianStudentAcademics,
    getGuardianStudentContacts,
  }
}

export const guardianSelfServiceService = createGuardianSelfServiceService()
