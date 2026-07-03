import { administrationHttpClient } from '@/services/admin-system/administration-service'
import { authService } from '@/services/auth/authService'
import {
  REPORTING_ENDPOINTS,
  REPORTING_OPERATIONS,
  compactReportingParams,
  mapReasonPayload,
  mapReportCatalog,
  mapReportDefinition,
  mapReportDefinitionPayload,
  mapReportRequestPayload,
  mapReportRun,
  mapReportingPaginatedEnvelope,
  mapReportingPaginationQuery,
} from '@/contracts/reporting/reportingContract'
import { normalizeReportingError } from './reportingErrorMapper'

export function createReportingConfig(options = {}, params = {}, getAccessToken = () => authService.getAccessToken()) {
  const accessToken = getAccessToken?.()
  return {
    params: compactReportingParams(params),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
      ...(options.headers ?? {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.responseType ? { responseType: options.responseType } : {}),
    ...(options.data !== undefined ? { data: options.data } : {}),
  }
}

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? response
}

export function createReportingService({
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
} = {}) {
  async function get(path, { params = {}, options = {}, operationId, map = unwrap } = {}) {
    try {
      return map(await client.get(path, createReportingConfig(options, params, getAccessToken)))
    } catch (error) {
      throw normalizeReportingError(error, { operationId })
    }
  }

  async function post(path, payload = {}, { options = {}, operationId, map = (response) => mapReportRun(unwrap(response)) } = {}) {
    try {
      return map(await client.post(path, payload, createReportingConfig(options, {}, getAccessToken)))
    } catch (error) {
      throw normalizeReportingError(error, { operationId })
    }
  }

  async function patch(path, payload = {}, { options = {}, operationId, map = (response) => mapReportDefinition(unwrap(response)) } = {}) {
    try {
      return map(await client.patch(path, payload, createReportingConfig(options, {}, getAccessToken)))
    } catch (error) {
      throw normalizeReportingError(error, { operationId })
    }
  }

  async function deleteRequest(path, { options = {}, operationId, map = (response) => mapReportRun(unwrap(response)) } = {}) {
    try {
      return map(await client.delete(path, createReportingConfig(options, {}, getAccessToken)))
    } catch (error) {
      throw normalizeReportingError(error, { operationId })
    }
  }

  return {
    getReportCatalog(options = {}) {
      return get(REPORTING_ENDPOINTS.catalog, {
        options,
        operationId: REPORTING_OPERATIONS.getReportCatalog,
        map: (response) => mapReportCatalog(unwrap(response)),
      })
    },
    listReports(query = {}, options = {}) {
      return get(REPORTING_ENDPOINTS.reports, {
        params: mapReportingPaginationQuery(query),
        options,
        operationId: REPORTING_OPERATIONS.listReports,
        map: (response) => mapReportingPaginatedEnvelope(response?.data ?? response, mapReportRun),
      })
    },
    requestReport(input = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.reports, mapReportRequestPayload(input), {
        options,
        operationId: REPORTING_OPERATIONS.requestReport,
      })
    },
    retryReport({ reportRunId, reasonCode } = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.retry(reportRunId), mapReasonPayload(reasonCode), {
        options,
        operationId: REPORTING_OPERATIONS.retryReport,
      })
    },
    cancelReport({ reportRunId, reasonCode } = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.cancel(reportRunId), mapReasonPayload(reasonCode), {
        options,
        operationId: REPORTING_OPERATIONS.cancelReport,
      })
    },
    deleteReport({ reportRunId } = {}, options = {}) {
      return deleteRequest(REPORTING_ENDPOINTS.report(reportRunId), {
        options,
        operationId: REPORTING_OPERATIONS.deleteReport,
      })
    },
    restoreReport({ reportRunId } = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.restore(reportRunId), {}, {
        options,
        operationId: REPORTING_OPERATIONS.restoreReport,
      })
    },
    async downloadReport({ reportRunId, format } = {}, options = {}) {
      try {
        const response = await client.get(
          REPORTING_ENDPOINTS.download(reportRunId),
          createReportingConfig({ ...options, responseType: options.responseType ?? 'blob' }, { format }, getAccessToken),
        )
        return {
          data: response?.data ?? response,
          contentType: response?.headers?.['content-type'] ?? 'application/octet-stream',
          disposition: response?.headers?.['content-disposition'] ?? null,
          format,
        }
      } catch (error) {
        throw normalizeReportingError(error, { operationId: REPORTING_OPERATIONS.downloadReport })
      }
    },
    listReportDefinitions(query = {}, options = {}) {
      return get(REPORTING_ENDPOINTS.definitions, {
        params: mapReportingPaginationQuery(query),
        options,
        operationId: REPORTING_OPERATIONS.listReportDefinitions,
        map: (response) => mapReportingPaginatedEnvelope(response?.data ?? response, mapReportDefinition),
      })
    },
    getReportDefinition({ reportDefinitionId } = {}, options = {}) {
      return get(REPORTING_ENDPOINTS.definition(reportDefinitionId), {
        options,
        operationId: REPORTING_OPERATIONS.getReportDefinition,
        map: (response) => mapReportDefinition(unwrap(response)),
      })
    },
    createReportDefinition(definition = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.definitions, mapReportDefinitionPayload(definition), {
        options,
        operationId: REPORTING_OPERATIONS.createReportDefinition,
        map: (response) => mapReportDefinition(unwrap(response)),
      })
    },
    updateReportDefinition({ reportDefinitionId, definition } = {}, options = {}) {
      return patch(REPORTING_ENDPOINTS.definition(reportDefinitionId), mapReportDefinitionPayload(definition), {
        options,
        operationId: REPORTING_OPERATIONS.updateReportDefinition,
      })
    },
    deleteReportDefinition({ reportDefinitionId } = {}, options = {}) {
      return deleteRequest(REPORTING_ENDPOINTS.definition(reportDefinitionId), {
        options,
        operationId: REPORTING_OPERATIONS.deleteReportDefinition,
        map: (response) => mapReportDefinition(unwrap(response)),
      })
    },
    activateReportDefinition({ reportDefinitionId } = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.activateDefinition(reportDefinitionId), {}, {
        options,
        operationId: REPORTING_OPERATIONS.activateReportDefinition,
        map: (response) => mapReportDefinition(unwrap(response)),
      })
    },
    deactivateReportDefinition({ reportDefinitionId } = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.deactivateDefinition(reportDefinitionId), {}, {
        options,
        operationId: REPORTING_OPERATIONS.deactivateReportDefinition,
        map: (response) => mapReportDefinition(unwrap(response)),
      })
    },
    restoreReportDefinition({ reportDefinitionId } = {}, options = {}) {
      return post(REPORTING_ENDPOINTS.restoreDefinition(reportDefinitionId), {}, {
        options,
        operationId: REPORTING_OPERATIONS.restoreReportDefinition,
        map: (response) => mapReportDefinition(unwrap(response)),
      })
    },
  }
}

export const reportingService = createReportingService()
