import { administrationHttpClient } from '@/services/admin-system/administration-service'
import { authService } from '@/services/auth/authService'
import {
  PLATFORM_SUPPORT_ENDPOINTS,
  PLATFORM_SUPPORT_OPERATIONS,
  compactPlatformSupportParams,
  mapPlatformReportingOverview,
  mapPlatformSchoolSummary,
  mapPlatformSupportListQuery,
  mapPlatformSupportPaginatedEnvelope,
  mapSupportAccessDecision,
  mapSupportAccessRequest,
  mapSupportAccessTransitionRequest,
  mapSupportAuditEvent,
  mapSupportSchoolDiagnostics,
  unwrapPlatformSupportData,
} from '@/contracts/platform-support/platformSupportContract'
import { normalizePlatformSupportError } from './platformSupportErrorMapper'

export function createPlatformSupportConfig(options = {}, params = {}, getAccessToken = () => authService.getAccessToken()) {
  const accessToken = getAccessToken?.()
  return {
    params: compactPlatformSupportParams(params),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
  }
}

export function createPlatformSupportService({
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
} = {}) {
  async function get(path, { params = {}, options = {}, operationId, map = unwrapPlatformSupportData } = {}) {
    try {
      return map(await client.get(path, createPlatformSupportConfig(options, params, getAccessToken)))
    } catch (error) {
      throw normalizePlatformSupportError(error, { operationId })
    }
  }

  async function post(path, payload = {}, { options = {}, operationId, map = (response) => mapSupportAccessDecision(unwrapPlatformSupportData(response)) } = {}) {
    try {
      return map(await client.post(path, payload, createPlatformSupportConfig(options, {}, getAccessToken)))
    } catch (error) {
      throw normalizePlatformSupportError(error, { operationId })
    }
  }

  return {
    listPlatformSchoolSummaries(query = {}, options = {}) {
      return get(PLATFORM_SUPPORT_ENDPOINTS.schools, {
        params: mapPlatformSupportListQuery(query),
        options,
        operationId: PLATFORM_SUPPORT_OPERATIONS.listPlatformSchoolSummaries,
        map: (response) => mapPlatformSupportPaginatedEnvelope(response?.data ?? response, mapPlatformSchoolSummary),
      })
    },
    getPlatformReportingOverview(query = {}, options = {}) {
      return get(PLATFORM_SUPPORT_ENDPOINTS.reportingOverview, {
        params: mapPlatformSupportListQuery(query),
        options,
        operationId: PLATFORM_SUPPORT_OPERATIONS.getPlatformReportingOverview,
        map: (response) => mapPlatformReportingOverview(unwrapPlatformSupportData(response)),
      })
    },
    requestSupportAccess(input = {}, options = {}) {
      return post(PLATFORM_SUPPORT_ENDPOINTS.supportAccess, mapSupportAccessRequest(input), {
        options,
        operationId: PLATFORM_SUPPORT_OPERATIONS.requestSupportAccess,
      })
    },
    getSupportAccessDecision({ supportAccessId } = {}, options = {}) {
      return get(PLATFORM_SUPPORT_ENDPOINTS.supportAccessDecision(supportAccessId), {
        options,
        operationId: PLATFORM_SUPPORT_OPERATIONS.getSupportAccessDecision,
        map: (response) => mapSupportAccessDecision(unwrapPlatformSupportData(response)),
      })
    },
    approveSupportAccess({ supportAccessId, reasonCode } = {}, options = {}) {
      return post(
        PLATFORM_SUPPORT_ENDPOINTS.approveSupportAccess(supportAccessId),
        mapSupportAccessTransitionRequest({ reasonCode }),
        {
          options,
          operationId: PLATFORM_SUPPORT_OPERATIONS.approveSupportAccess,
        },
      )
    },
    revokeSupportAccess({ supportAccessId, reasonCode } = {}, options = {}) {
      return post(
        PLATFORM_SUPPORT_ENDPOINTS.revokeSupportAccess(supportAccessId),
        mapSupportAccessTransitionRequest({ reasonCode }),
        {
          options,
          operationId: PLATFORM_SUPPORT_OPERATIONS.revokeSupportAccess,
        },
      )
    },
    getSupportSchoolDiagnostics({ schoolId, supportAccessId } = {}, options = {}) {
      return get(PLATFORM_SUPPORT_ENDPOINTS.diagnostics(schoolId), {
        params: { support_access_id: supportAccessId },
        options,
        operationId: PLATFORM_SUPPORT_OPERATIONS.getSupportSchoolDiagnostics,
        map: (response) => mapSupportSchoolDiagnostics(unwrapPlatformSupportData(response)),
      })
    },
    listSupportAuditEvents(query = {}, options = {}) {
      return get(PLATFORM_SUPPORT_ENDPOINTS.auditEvents, {
        params: mapPlatformSupportListQuery(query),
        options,
        operationId: PLATFORM_SUPPORT_OPERATIONS.listSupportAuditEvents,
        map: (response) => mapPlatformSupportPaginatedEnvelope(response?.data ?? response, mapSupportAuditEvent),
      })
    },
  }
}

export const platformSupportService = createPlatformSupportService()

