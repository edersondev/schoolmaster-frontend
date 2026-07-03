import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'
import { createSafeReportingDiagnostic } from './reportingDiagnostics'

const CODE_STATE_MAP = Object.freeze({
  VALIDATION_ERROR: REPORTING_FEEDBACK_STATES.validation,
  UNAUTHORIZED: REPORTING_FEEDBACK_STATES.unauthorized,
  FORBIDDEN: REPORTING_FEEDBACK_STATES.forbidden,
  TENANT_MISMATCH: REPORTING_FEEDBACK_STATES.tenantMismatch,
  INACTIVE_SCHOOL: REPORTING_FEEDBACK_STATES.inactiveSchool,
  NO_ACTIVE_SCHOOL: REPORTING_FEEDBACK_STATES.noActiveSchool,
  UNAVAILABLE_CATALOG: REPORTING_FEEDBACK_STATES.unavailableCatalog,
  NOT_FOUND: REPORTING_FEEDBACK_STATES.notFound,
  CONFLICT: REPORTING_FEEDBACK_STATES.conflict,
  OUTPUT_EXPIRED: REPORTING_FEEDBACK_STATES.outputExpired,
  UNSUPPORTED_PAGE_SIZE: REPORTING_FEEDBACK_STATES.unsupportedPageSize,
  TEMPORARY_UNAVAILABLE: REPORTING_FEEDBACK_STATES.temporaryUnavailable,
})

const STATUS_STATE_MAP = Object.freeze({
  400: REPORTING_FEEDBACK_STATES.validation,
  401: REPORTING_FEEDBACK_STATES.unauthorized,
  403: REPORTING_FEEDBACK_STATES.forbidden,
  404: REPORTING_FEEDBACK_STATES.notFound,
  409: REPORTING_FEEDBACK_STATES.conflict,
  410: REPORTING_FEEDBACK_STATES.outputExpired,
  422: REPORTING_FEEDBACK_STATES.validation,
  503: REPORTING_FEEDBACK_STATES.temporaryUnavailable,
})

export function createReportingFeedbackState(type, options = {}) {
  return {
    type,
    code: options.code ?? null,
    message: options.message ?? '',
    fields: options.fields ?? {},
    diagnostic: options.diagnostic ?? null,
  }
}

export function normalizeReportingError(error, context = {}) {
  if (error?.feedbackState) {
    return createReportingFeedbackState(error.feedbackState, {
      code: error.gate ?? null,
      message: error.message,
      diagnostic: createSafeReportingDiagnostic(error, context),
    })
  }

  const status = error?.response?.status ?? 0
  const payload = error?.response?.data ?? {}
  const code = payload?.error?.code ?? payload?.code ?? null
  const fields = payload?.errors ?? payload?.error?.fields ?? {}
  const type =
    CODE_STATE_MAP[code] ??
    STATUS_STATE_MAP[status] ??
    REPORTING_FEEDBACK_STATES.temporaryUnavailable

  return createReportingFeedbackState(type, {
    code,
    message: payload?.message ?? payload?.error?.message ?? '',
    fields,
    diagnostic: createSafeReportingDiagnostic(error, context),
  })
}

export function isReportingFeedbackBlocking(feedback) {
  return [
    REPORTING_FEEDBACK_STATES.validation,
    REPORTING_FEEDBACK_STATES.unauthorized,
    REPORTING_FEEDBACK_STATES.forbidden,
    REPORTING_FEEDBACK_STATES.tenantMismatch,
    REPORTING_FEEDBACK_STATES.inactiveSchool,
    REPORTING_FEEDBACK_STATES.noActiveSchool,
    REPORTING_FEEDBACK_STATES.unavailableCatalog,
    REPORTING_FEEDBACK_STATES.notFound,
    REPORTING_FEEDBACK_STATES.conflict,
    REPORTING_FEEDBACK_STATES.outputExpired,
    REPORTING_FEEDBACK_STATES.contractUnavailable,
  ].includes(feedback?.type ?? feedback)
}
