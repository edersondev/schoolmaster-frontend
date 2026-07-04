export const REPORTING_ROUTE_NAMES = Object.freeze({
  workspace: 'reportingWorkspace',
  history: 'reportingHistory',
  catalog: 'reportingCatalog',
  runDetail: 'reportingRunDetail',
  definitions: 'reportingDefinitions',
  definitionDetail: 'reportingDefinitionDetail',
})

export const REPORTING_OPERATIONS = Object.freeze({
  getReportCatalog: 'getReportCatalog',
  listReports: 'listReports',
  requestReport: 'requestReport',
  retryReport: 'retryReport',
  cancelReport: 'cancelReport',
  deleteReport: 'deleteReport',
  restoreReport: 'restoreReport',
  downloadReport: 'downloadReport',
  listReportDefinitions: 'listReportDefinitions',
  createReportDefinition: 'createReportDefinition',
  getReportDefinition: 'getReportDefinition',
  updateReportDefinition: 'updateReportDefinition',
  deleteReportDefinition: 'deleteReportDefinition',
  activateReportDefinition: 'activateReportDefinition',
  deactivateReportDefinition: 'deactivateReportDefinition',
  restoreReportDefinition: 'restoreReportDefinition',
})

export const REPORTING_ENDPOINTS = Object.freeze({
  catalog: '/api/v1/report-catalog',
  reports: '/api/v1/reports',
  report: (reportRunId) => `/api/v1/reports/${encodeURIComponent(reportRunId)}`,
  retry: (reportRunId) => `/api/v1/reports/${encodeURIComponent(reportRunId)}/retry`,
  cancel: (reportRunId) => `/api/v1/reports/${encodeURIComponent(reportRunId)}/cancel`,
  download: (reportRunId) => `/api/v1/reports/${encodeURIComponent(reportRunId)}/download`,
  restore: (reportRunId) => `/api/v1/reports/${encodeURIComponent(reportRunId)}/restore`,
  definitions: '/api/v1/report-definitions',
  definition: (reportDefinitionId) =>
    `/api/v1/report-definitions/${encodeURIComponent(reportDefinitionId)}`,
  activateDefinition: (reportDefinitionId) =>
    `/api/v1/report-definitions/${encodeURIComponent(reportDefinitionId)}/activate`,
  deactivateDefinition: (reportDefinitionId) =>
    `/api/v1/report-definitions/${encodeURIComponent(reportDefinitionId)}/deactivate`,
  restoreDefinition: (reportDefinitionId) =>
    `/api/v1/report-definitions/${encodeURIComponent(reportDefinitionId)}/restore`,
})

export const REPORTING_PERMISSIONS = Object.freeze({
  reports: 'reports.view',
  lifecycle: 'reports.lifecycle',
  definitions: 'reports.definitions',
})

export const REPORTING_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  empty: 'empty',
  noResults: 'no-results',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  inactiveSchool: 'inactive-school',
  noActiveSchool: 'no-active-school',
  unavailableCatalog: 'unavailable-catalog',
  validation: 'validation',
  notFound: 'not-found',
  conflict: 'conflict',
  outputExpired: 'output-expired',
  unsupportedPageSize: 'unsupported-page-size',
  temporaryUnavailable: 'temporary-unavailable',
  staleResponse: 'stale-response',
  downloadUnavailable: 'download-unavailable',
  contractUnavailable: 'contract-unavailable',
})

export const REPORT_GENERATION_STATUSES = Object.freeze({
  requested: 'requested',
  generating: 'generating',
  generated: 'generated',
  failed: 'failed',
  canceled: 'canceled',
})

export const REPORT_OUTPUT_AVAILABILITY = Object.freeze({
  pending: 'pending',
  available: 'available',
  failed: 'failed',
  expired: 'expired',
  unsupported: 'unsupported',
})

export const REPORT_DEFINITION_STATES = Object.freeze({
  draft: 'draft',
  active: 'active',
  inactive: 'inactive',
  deleted: 'deleted',
})

export const REPORT_FORMATS = Object.freeze(['pdf', 'csv', 'xlsx'])
export const REPORT_REASON_CODES = Object.freeze(['user-requested', 'stale-output', 'generation-failed'])

export const REPORT_DEFINITION_LIMITS = Object.freeze({
  fields: 25,
  filters: 10,
  grouping: 2,
  sorting: 3,
})

export const REPORTING_BLOCKED_CAPABILITIES = Object.freeze({
  platformWideReporting: 'platform-wide-reporting',
  manualStatusMutation: 'manual-status-mutation',
  outputDeleteRestore: 'output-delete-restore',
  retentionOverride: 'retention-override',
  permanentPurge: 'permanent-purge',
  legalHold: 'legal-hold',
  anonymization: 'anonymization',
  arbitraryQuery: 'arbitrary-query',
  customCode: 'custom-code',
  uploadedTemplates: 'uploaded-templates',
  unapprovedDomain: 'unapproved-domain',
  sharing: 'report-sharing',
  messaging: 'messaging',
  notifications: 'notifications',
  billing: 'billing',
  undocumentedApi: 'undocumented-api',
})

export function compactReportingParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function mapReportingPaginationQuery(query = {}) {
  return compactReportingParams({
    page: query.page,
    per_page: query.perPage,
    report_type: query.reportType,
    generation_status: query.generationStatus,
    report_source: query.reportSource,
    include_deleted: query.includeDeleted === true ? true : undefined,
    lifecycle_state: query.lifecycleState,
  })
}

export function safeDroppedReportingFields(record = {}, allowedKeys = new Set()) {
  return Object.keys(record ?? {}).filter((key) => !allowedKeys.has(key))
}

export function mapReportingPaginatedEnvelope(envelope = {}, mapRecord = (record) => record) {
  const payload = envelope?.data && Array.isArray(envelope.data) ? envelope : envelope?.data ?? envelope
  return {
    items: Array.isArray(payload?.data) ? payload.data.map(mapRecord) : [],
    meta: {
      page: Number(payload?.meta?.page) || 1,
      perPage: Number(payload?.meta?.per_page) || 25,
      total: Number(payload?.meta?.total) || 0,
    },
  }
}

const CATALOG_KEYS = new Set(['domains', 'fields', 'filters', 'operators', 'grouping', 'sorting', 'output_formats', 'complexity_limits'])
const REPORT_KEYS = new Set([
  'id',
  'school_id',
  'requested_by_user_id',
  'report_type',
  'report_source',
  'filter_summary',
  'output_formats',
  'generation_status',
  'source_report_run_id',
  'superseded_by_report_run_id',
  'report_definition_id',
  'report_definition_snapshot_id',
  'deleted_at',
  'cancellation_reason_code',
  'failure_reason_code',
  'generated_at',
  'output_expires_at',
  'outputs_available',
  'outputs',
  'created_at',
  'updated_at',
])
const OUTPUT_KEYS = new Set(['format', 'availability', 'expires_at', 'generated_at'])
const DEFINITION_KEYS = new Set([
  'id',
  'school_id',
  'name',
  'description',
  'domain',
  'fields',
  'filters',
  'grouping',
  'sorting',
  'output_formats',
  'lifecycle_state',
  'version',
  'created_by_user_id',
  'updated_by_user_id',
  'deleted_at',
  'created_at',
  'updated_at',
])

export function mapReportCatalog(record = {}) {
  return {
    domains: Array.isArray(record.domains) ? record.domains : [],
    fields: Array.isArray(record.fields) ? record.fields : [],
    filters: Array.isArray(record.filters) ? record.filters : [],
    operators: Array.isArray(record.operators) ? record.operators : [],
    grouping: Array.isArray(record.grouping) ? record.grouping : [],
    sorting: Array.isArray(record.sorting) ? record.sorting : [],
    outputFormats: Array.isArray(record.output_formats) ? record.output_formats : REPORT_FORMATS,
    complexityLimits: {
      fields: Number(record.complexity_limits?.fields) || REPORT_DEFINITION_LIMITS.fields,
      filters: Number(record.complexity_limits?.filters) || REPORT_DEFINITION_LIMITS.filters,
      grouping: Number(record.complexity_limits?.grouping) || REPORT_DEFINITION_LIMITS.grouping,
      sorting: Number(record.complexity_limits?.sorting) || REPORT_DEFINITION_LIMITS.sorting,
    },
    droppedFields: safeDroppedReportingFields(record, CATALOG_KEYS),
  }
}

export function mapReportOutput(record = {}) {
  return {
    format: record.format ?? '',
    availability: record.availability ?? REPORT_OUTPUT_AVAILABILITY.unsupported,
    expiresAt: record.expires_at ?? null,
    generatedAt: record.generated_at ?? null,
    droppedFields: safeDroppedReportingFields(record, OUTPUT_KEYS),
  }
}

export function mapReportRun(record = {}) {
  return {
    id: record.id ?? '',
    schoolId: record.school_id ?? null,
    requestedByUserId: record.requested_by_user_id ?? null,
    reportType: record.report_type ?? '',
    reportSource: record.report_source ?? 'built-in',
    filterSummary: record.filter_summary ?? null,
    outputFormats: Array.isArray(record.output_formats) ? record.output_formats : [],
    generationStatus: record.generation_status ?? REPORT_GENERATION_STATUSES.requested,
    sourceReportRunId: record.source_report_run_id ?? null,
    supersededByReportRunId: record.superseded_by_report_run_id ?? null,
    reportDefinitionId: record.report_definition_id ?? null,
    reportDefinitionSnapshotId: record.report_definition_snapshot_id ?? null,
    deletedAt: record.deleted_at ?? null,
    cancellationReasonCode: record.cancellation_reason_code ?? null,
    failureReasonCode: record.failure_reason_code ?? null,
    generatedAt: record.generated_at ?? null,
    outputExpiresAt: record.output_expires_at ?? null,
    outputsAvailable: record.outputs_available === true,
    outputs: Array.isArray(record.outputs) ? record.outputs.map(mapReportOutput) : [],
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
    droppedFields: safeDroppedReportingFields(record, REPORT_KEYS),
  }
}

export function mapReportDefinition(record = {}) {
  return {
    id: record.id ?? '',
    schoolId: record.school_id ?? null,
    name: record.name ?? '',
    description: record.description ?? '',
    domain: record.domain ?? '',
    fields: Array.isArray(record.fields) ? record.fields : [],
    filters: Array.isArray(record.filters) ? record.filters : [],
    grouping: Array.isArray(record.grouping) ? record.grouping : [],
    sorting: Array.isArray(record.sorting) ? record.sorting : [],
    outputFormats: Array.isArray(record.output_formats) ? record.output_formats : [],
    lifecycleState: record.lifecycle_state ?? REPORT_DEFINITION_STATES.draft,
    version: Number(record.version) || 1,
    createdByUserId: record.created_by_user_id ?? null,
    updatedByUserId: record.updated_by_user_id ?? null,
    deletedAt: record.deleted_at ?? null,
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
    droppedFields: safeDroppedReportingFields(record, DEFINITION_KEYS),
  }
}

export function mapReportRequestPayload(input = {}) {
  return compactReportingParams({
    report_type: input.reportType,
    report_definition_id: input.reportDefinitionId,
    fields: input.fields,
    filters: input.filters,
    output_formats: input.outputFormats,
  })
}

export function mapReportDefinitionPayload(input = {}) {
  return compactReportingParams({
    name: input.name,
    description: input.description,
    domain: input.domain,
    fields: input.fields,
    filters: input.filters,
    grouping: input.grouping,
    sorting: input.sorting,
    output_formats: input.outputFormats,
  })
}

export function mapReasonPayload(reasonCode) {
  return compactReportingParams({ reason_code: reasonCode })
}

export function assertReportingCapabilitySupported(capability) {
  if (Object.values(REPORTING_BLOCKED_CAPABILITIES).includes(capability)) {
    const error = new Error(`Reporting capability is blocked: ${capability}`)
    error.feedbackState = REPORTING_FEEDBACK_STATES.contractUnavailable
    error.gate = capability
    throw error
  }
}

export function isApprovedReportingOperation(operationId) {
  return Object.values(REPORTING_OPERATIONS).includes(operationId)
}

export const REPORTING_TRACEABILITY = Object.freeze([
  { surface: 'Report catalog', operationId: REPORTING_OPERATIONS.getReportCatalog, path: REPORTING_ENDPOINTS.catalog },
  { surface: 'Report history', operationId: REPORTING_OPERATIONS.listReports, path: REPORTING_ENDPOINTS.reports },
  { surface: 'Report request', operationId: REPORTING_OPERATIONS.requestReport, path: REPORTING_ENDPOINTS.reports },
  { surface: 'Report retry', operationId: REPORTING_OPERATIONS.retryReport, path: '/api/v1/reports/{reportRunId}/retry' },
  { surface: 'Report cancel', operationId: REPORTING_OPERATIONS.cancelReport, path: '/api/v1/reports/{reportRunId}/cancel' },
  { surface: 'Report delete', operationId: REPORTING_OPERATIONS.deleteReport, path: '/api/v1/reports/{reportRunId}' },
  { surface: 'Report restore', operationId: REPORTING_OPERATIONS.restoreReport, path: '/api/v1/reports/{reportRunId}/restore' },
  { surface: 'Report download', operationId: REPORTING_OPERATIONS.downloadReport, path: '/api/v1/reports/{reportRunId}/download' },
  { surface: 'Definition list', operationId: REPORTING_OPERATIONS.listReportDefinitions, path: REPORTING_ENDPOINTS.definitions },
  { surface: 'Definition create', operationId: REPORTING_OPERATIONS.createReportDefinition, path: REPORTING_ENDPOINTS.definitions },
  { surface: 'Definition detail', operationId: REPORTING_OPERATIONS.getReportDefinition, path: '/api/v1/report-definitions/{reportDefinitionId}' },
  { surface: 'Definition update', operationId: REPORTING_OPERATIONS.updateReportDefinition, path: '/api/v1/report-definitions/{reportDefinitionId}' },
  { surface: 'Definition delete', operationId: REPORTING_OPERATIONS.deleteReportDefinition, path: '/api/v1/report-definitions/{reportDefinitionId}' },
  { surface: 'Definition activate', operationId: REPORTING_OPERATIONS.activateReportDefinition, path: '/api/v1/report-definitions/{reportDefinitionId}/activate' },
  { surface: 'Definition deactivate', operationId: REPORTING_OPERATIONS.deactivateReportDefinition, path: '/api/v1/report-definitions/{reportDefinitionId}/deactivate' },
  { surface: 'Definition restore', operationId: REPORTING_OPERATIONS.restoreReportDefinition, path: '/api/v1/report-definitions/{reportDefinitionId}/restore' },
])
