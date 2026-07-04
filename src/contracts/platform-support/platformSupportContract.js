export const PLATFORM_SUPPORT_ROUTE_NAMES = Object.freeze({
  workspace: 'platformSupportWorkspace',
  oversight: 'platformSupportOversight',
  decisions: 'platformSupportDecisions',
  decisionDetail: 'platformSupportDecisionDetail',
  diagnostics: 'platformSupportDiagnostics',
  audit: 'platformSupportAudit',
})

export const PLATFORM_SUPPORT_OPERATIONS = Object.freeze({
  listPlatformSchoolSummaries: 'listPlatformSchoolSummaries',
  getPlatformReportingOverview: 'getPlatformReportingOverview',
  requestSupportAccess: 'requestSupportAccess',
  getSupportAccessDecision: 'getSupportAccessDecision',
  approveSupportAccess: 'approveSupportAccess',
  revokeSupportAccess: 'revokeSupportAccess',
  getSupportSchoolDiagnostics: 'getSupportSchoolDiagnostics',
  listSupportAuditEvents: 'listSupportAuditEvents',
})

export const PLATFORM_SUPPORT_ENDPOINTS = Object.freeze({
  schools: '/api/v1/platform/schools',
  reportingOverview: '/api/v1/platform/reporting/overview',
  supportAccess: '/api/v1/platform/support-access',
  supportAccessDecision: (supportAccessId) =>
    `/api/v1/platform/support-access/${encodeURIComponent(supportAccessId)}`,
  approveSupportAccess: (supportAccessId) =>
    `/api/v1/platform/support-access/${encodeURIComponent(supportAccessId)}/approve`,
  revokeSupportAccess: (supportAccessId) =>
    `/api/v1/platform/support-access/${encodeURIComponent(supportAccessId)}/revoke`,
  diagnostics: (schoolId) => `/api/v1/platform/support/schools/${encodeURIComponent(schoolId)}/diagnostics`,
  auditEvents: '/api/v1/platform/support-audit-events',
})

export const PLATFORM_SUPPORT_PERMISSIONS = Object.freeze({
  operationalOversight: 'platform.operational-oversight',
  reportingOverview: 'platform.reporting-overview',
  supportAccess: 'platform.support-access',
  supportApproval: 'platform.support-approval',
  supportRevocation: 'platform.support-revocation',
  supportDrillDown: 'platform.support-drill-down',
  supportAuditReview: 'platform.support-audit-review',
})

export const PLATFORM_SUPPORT_PERMISSION_CANDIDATES = Object.freeze({
  operationalOversight: [
    PLATFORM_SUPPORT_PERMISSIONS.operationalOversight,
    'platform.schools.view',
    'platform.support.oversight',
  ],
  reportingOverview: [
    PLATFORM_SUPPORT_PERMISSIONS.reportingOverview,
    'platform.reporting.view',
    'platform.reports.view',
  ],
  supportAccess: [
    PLATFORM_SUPPORT_PERMISSIONS.supportAccess,
    'platform.support.access',
    'platform.support-access.request',
  ],
  supportApproval: [
    PLATFORM_SUPPORT_PERMISSIONS.supportApproval,
    'platform.support.approve',
    'platform.support-access.approve',
  ],
  supportRevocation: [
    PLATFORM_SUPPORT_PERMISSIONS.supportRevocation,
    'platform.support.revoke',
    'platform.support-access.revoke',
  ],
  supportDrillDown: [
    PLATFORM_SUPPORT_PERMISSIONS.supportDrillDown,
    'platform.support.diagnostics',
    'platform.support.drill-down',
  ],
  supportAuditReview: [
    PLATFORM_SUPPORT_PERMISSIONS.supportAuditReview,
    'platform.support.audit',
    'platform.support-audit.view',
  ],
})

export const PLATFORM_SUPPORT_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  empty: 'empty',
  noResults: 'no-results',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  validation: 'validation',
  notFound: 'not-found',
  conflict: 'conflict',
  expired: 'expired',
  revoked: 'revoked',
  denied: 'denied',
  staleResponse: 'stale-response',
  suppressed: 'suppressed',
  redacted: 'redacted',
  temporaryUnavailable: 'temporary-unavailable',
  contractUnavailable: 'contract-unavailable',
  diagnosticsUnavailable: 'diagnostics-unavailable',
  unsupportedAction: 'unsupported-action',
})

export const SUPPORT_ACCESS_DECISION_STATES = Object.freeze({
  requested: 'requested',
  pending: 'pending',
  approved: 'approved',
  denied: 'denied',
  expired: 'expired',
  revoked: 'revoked',
})

export const SUPPORT_ACTIVE_GATE_STATES = Object.freeze(['active', 'approved', 'valid'])

export const PLATFORM_SUPPORT_BLOCKED_CAPABILITIES = Object.freeze({
  schoolOptInCreate: 'school-opt-in-create',
  schoolOptInRevoke: 'school-opt-in-revoke',
  generatedReportDownload: 'generated-report-download',
  rawReportOutput: 'raw-report-output',
  privateFileMetadata: 'private-file-metadata',
  emergencyAccess: 'emergency-access',
  unrestrictedImpersonation: 'unrestricted-impersonation',
  unrestrictedSearch: 'unrestricted-search',
  supportWrites: 'support-writes',
  accountReactivation: 'account-reactivation',
  reportRetryCancel: 'report-retry-cancel',
  schoolStatusChange: 'school-status-change',
  schoolOwnedMutation: 'school-owned-mutation',
  undocumentedApi: 'undocumented-api',
})

const SCHOOL_SUMMARY_KEYS = new Set([
  'id',
  'name',
  'status',
  'indicators',
  'reporting_health',
  'lifecycle',
  'diagnostics',
  'suppressed',
  'unavailable_groups',
])

const REPORTING_OVERVIEW_KEYS = new Set(['health', 'lifecycle', 'suppressed', 'unavailable_groups'])

const DECISION_KEYS = new Set([
  'id',
  'target_school_id',
  'target_school_label',
  'support_actor_id',
  'state',
  'reason_code',
  'purpose',
  'correlation_id',
  'opt_in_state',
  'target_school_opt_in_state',
  'platform_approval_state',
  'internal_platform_approval_state',
  'target_school_match',
  'approved_at',
  'expires_at',
  'revoked_at',
  'revocation_reason_code',
])

const DIAGNOSTICS_KEYS = new Set([
  'target_school_id',
  'target_school_status',
  'support_access_id',
  'decision_id',
  'decision_expires_at',
  'groups',
  'reporting_health_summary',
  'lifecycle_summary',
  'redacted_fields',
  'suppressed',
])

const AUDIT_EVENT_KEYS = new Set([
  'id',
  'actor_user_id',
  'actor_label',
  'action',
  'outcome',
  'target_school_id',
  'target_school_label',
  'correlation_id',
  'reason_code',
  'metadata_summary',
  'occurred_at',
])

export function compactPlatformSupportParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function mapPlatformSupportListQuery(query = {}) {
  return compactPlatformSupportParams({
    page: query.page,
    per_page: query.perPage,
    sort: query.sort,
    status: query.status,
    search: query.search,
    action: query.action,
    outcome: query.outcome,
    correlation_id: query.correlationId,
  })
}

export function safeDroppedPlatformSupportFields(record = {}, allowedKeys = new Set()) {
  return Object.keys(record ?? {}).filter((key) => !allowedKeys.has(key))
}

export function unwrapPlatformSupportData(response) {
  return response?.data?.data ?? response?.data ?? response
}

export function mapPlatformSupportPaginatedEnvelope(envelope = {}, mapRecord = (record) => record) {
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

export function mapPlatformSchoolSummary(record = {}) {
  return {
    id: record.id ?? null,
    name: record.name ?? '',
    status: record.status ?? 'inactive',
    indicators: record.indicators ?? {},
    reportingHealth: record.reporting_health ?? {},
    lifecycle: record.lifecycle ?? {},
    diagnostics: record.diagnostics ?? {},
    suppressed: Array.isArray(record.suppressed) ? record.suppressed : [],
    unavailableGroups: Array.isArray(record.unavailable_groups) ? record.unavailable_groups : [],
    droppedFields: safeDroppedPlatformSupportFields(record, SCHOOL_SUMMARY_KEYS),
  }
}

export function mapPlatformReportingOverview(record = {}) {
  return {
    health: record.health ?? {},
    lifecycle: record.lifecycle ?? {},
    suppressed: Array.isArray(record.suppressed) ? record.suppressed : [],
    unavailableGroups: Array.isArray(record.unavailable_groups) ? record.unavailable_groups : [],
    droppedFields: safeDroppedPlatformSupportFields(record, REPORTING_OVERVIEW_KEYS),
  }
}

export function mapSupportAccessRequest(input = {}) {
  return compactPlatformSupportParams({
    target_school_id: input.targetSchoolId,
    reason_code: input.reasonCode,
    purpose: input.purpose,
    correlation_id: input.correlationId,
  })
}

export function mapSupportAccessTransitionRequest(input = {}) {
  return compactPlatformSupportParams({
    reason_code: input.reasonCode,
  })
}

function isFuture(value) {
  if (!value) return false
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && timestamp > Date.now()
}

function isActiveGate(value) {
  return SUPPORT_ACTIVE_GATE_STATES.includes(String(value ?? '').toLowerCase())
}

export function mapSupportAccessDecision(record = {}) {
  const optInState = record.target_school_opt_in_state ?? record.opt_in_state ?? 'unknown'
  const platformApprovalState = record.internal_platform_approval_state ?? record.platform_approval_state ?? 'unknown'
  const state = Object.values(SUPPORT_ACCESS_DECISION_STATES).includes(record.state)
    ? record.state
    : SUPPORT_ACCESS_DECISION_STATES.pending
  const targetSchoolMatch = record.target_school_match !== false
  const diagnosticsAvailable =
    state === SUPPORT_ACCESS_DECISION_STATES.approved &&
    targetSchoolMatch &&
    isActiveGate(optInState) &&
    isActiveGate(platformApprovalState) &&
    isFuture(record.expires_at)

  return {
    id: record.id ?? null,
    targetSchoolId: record.target_school_id ?? null,
    targetSchoolLabel: record.target_school_label ?? '',
    supportActorId: record.support_actor_id ?? null,
    state,
    reasonCode: record.reason_code ?? '',
    purpose: record.purpose ?? '',
    correlationId: record.correlation_id ?? '',
    optInState,
    platformApprovalState,
    targetSchoolMatch,
    approvedAt: record.approved_at ?? null,
    expiresAt: record.expires_at ?? null,
    revokedAt: record.revoked_at ?? null,
    revocationReasonCode: record.revocation_reason_code ?? '',
    diagnosticsAvailable,
    droppedFields: safeDroppedPlatformSupportFields(record, DECISION_KEYS),
  }
}

export function mapSupportSchoolDiagnostics(record = {}) {
  return {
    targetSchoolId: record.target_school_id ?? null,
    targetSchoolStatus: record.target_school_status ?? '',
    supportAccessId: record.support_access_id ?? record.decision_id ?? null,
    decisionId: record.decision_id ?? record.support_access_id ?? null,
    decisionExpiresAt: record.decision_expires_at ?? null,
    groups: Array.isArray(record.groups) ? record.groups : [],
    reportingHealthSummary: record.reporting_health_summary ?? {},
    lifecycleSummary: record.lifecycle_summary ?? {},
    redactedFields: Array.isArray(record.redacted_fields) ? record.redacted_fields : [],
    suppressed: Array.isArray(record.suppressed) ? record.suppressed : [],
    droppedFields: safeDroppedPlatformSupportFields(record, DIAGNOSTICS_KEYS),
  }
}

export function mapSupportAuditEvent(record = {}) {
  return {
    id: record.id ?? null,
    actorUserId: record.actor_user_id ?? null,
    actorLabel: record.actor_label ?? '',
    action: record.action ?? '',
    outcome: record.outcome ?? '',
    targetSchoolId: record.target_school_id ?? null,
    targetSchoolLabel: record.target_school_label ?? '',
    correlationId: record.correlation_id ?? '',
    reasonCode: record.reason_code ?? '',
    metadataSummary: record.metadata_summary ?? {},
    occurredAt: record.occurred_at ?? null,
    droppedFields: safeDroppedPlatformSupportFields(record, AUDIT_EVENT_KEYS),
  }
}

export function createPlatformSupportFeedbackState(type, details = {}) {
  return {
    type,
    recoverable: details.recoverable ?? ![
      PLATFORM_SUPPORT_FEEDBACK_STATES.unauthorized,
      PLATFORM_SUPPORT_FEEDBACK_STATES.forbidden,
      PLATFORM_SUPPORT_FEEDBACK_STATES.unsupportedAction,
    ].includes(type),
    safeDetails: compactPlatformSupportParams({
      operationId: details.operationId,
      requestId: details.requestId,
      field: details.field,
      routeName: details.routeName,
      decisionState: details.decisionState,
      approvalGate: details.approvalGate,
      diagnosticGroup: details.diagnosticGroup,
    }),
  }
}

