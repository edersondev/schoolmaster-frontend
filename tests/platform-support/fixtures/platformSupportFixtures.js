import { vi } from 'vitest'

export const futureIso = () => new Date(Date.now() + 60 * 60 * 1000).toISOString()
export const pastIso = () => new Date(Date.now() - 60 * 60 * 1000).toISOString()

export const platformSession = {
  currentUser: { id: 'actor-1' },
  isAuthenticated: true,
  permissions: [
    { code: 'platform.operational-oversight', status: 'active' },
    { code: 'platform.reporting-overview', status: 'active' },
    { code: 'platform.support-access', status: 'active' },
    { code: 'platform.support-approval', status: 'active' },
    { code: 'platform.support-revocation', status: 'active' },
    { code: 'platform.support-drill-down', status: 'active' },
    { code: 'platform.support-audit-review', status: 'active' },
  ],
}

export const schoolSummaryRecord = {
  id: 'school-1',
  name: 'North Campus',
  status: 'active',
  indicators: { users: 'available' },
  reporting_health: { status: 'healthy' },
  lifecycle: { active: 12 },
  diagnostics: { state: 'available' },
  suppressed: ['students_under_5'],
  private_payload: 'blocked',
}

export const reportingOverviewRecord = {
  health: { reports: 'healthy' },
  lifecycle: { generated: 4 },
  suppressed: ['failed_under_5'],
  raw_outputs: ['blocked'],
}

export const supportDecisionRecord = (overrides = {}) => ({
  id: 'support-1',
  target_school_id: 'school-1',
  target_school_label: 'North Campus',
  support_actor_id: 'actor-1',
  state: 'approved',
  reason_code: 'support-review',
  purpose: 'Investigate support ticket',
  correlation_id: 'corr-1',
  opt_in_state: 'active',
  platform_approval_state: 'active',
  target_school_match: true,
  approved_at: new Date().toISOString(),
  expires_at: futureIso(),
  hidden_actor_metadata: 'blocked',
  ...overrides,
})

export const diagnosticsRecord = {
  target_school_id: 'school-1',
  support_access_id: 'support-1',
  groups: [{ key: 'reporting', state: 'available' }],
  reporting_health_summary: { status: 'healthy' },
  lifecycle_summary: { active: 3 },
  redacted_fields: ['private_path'],
  suppressed: ['small_count'],
  raw_report_outputs: ['blocked'],
}

export const auditEventRecord = {
  id: 'audit-1',
  actor_user_id: 'actor-1',
  actor_label: 'Platform Support',
  action: 'diagnostics.viewed',
  outcome: 'allowed',
  target_school_id: 'school-1',
  correlation_id: 'corr-1',
  reason_code: 'support-review',
  metadata_summary: { source: 'support' },
  occurred_at: new Date().toISOString(),
  full_payload: 'blocked',
}

export function paginated(items = []) {
  return { data: items, meta: { page: 1, per_page: 25, total: items.length } }
}

export function success(data) {
  return { data: { data } }
}

export function errorResponse(status = 403, code = 'FORBIDDEN') {
  return {
    response: {
      status,
      data: {
        error: { code },
        meta: { request_id: 'req-1' },
      },
    },
  }
}

export function createClient(overrides = {}) {
  return {
    get: vi.fn(),
    post: vi.fn(),
    ...overrides,
  }
}
