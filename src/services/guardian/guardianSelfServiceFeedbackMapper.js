import { GUARDIAN_FEEDBACK_STATES } from '@/contracts/guardian/guardianSelfServiceContract'
import { createSafeGuardianSelfServiceDiagnostic } from './guardianSelfServiceDiagnostics'

const CODE_STATE_MAP = Object.freeze({
  VALIDATION_ERROR: GUARDIAN_FEEDBACK_STATES.validation,
  UNAUTHORIZED: GUARDIAN_FEEDBACK_STATES.unauthorized,
  FORBIDDEN: GUARDIAN_FEEDBACK_STATES.forbidden,
  TENANT_MISMATCH: GUARDIAN_FEEDBACK_STATES.tenantMismatch,
  INACTIVE_SCHOOL: GUARDIAN_FEEDBACK_STATES.inactiveSchool,
  NO_ACTIVE_SCHOOL: GUARDIAN_FEEDBACK_STATES.noActiveSchool,
  NO_GUARDIAN_LINK: GUARDIAN_FEEDBACK_STATES.noGuardianLink,
  NO_LINKED_STUDENTS: GUARDIAN_FEEDBACK_STATES.noLinkedStudents,
  NO_ACADEMIC_PERIOD: GUARDIAN_FEEDBACK_STATES.noAcademicPeriod,
  UNAVAILABLE_SUMMARY: GUARDIAN_FEEDBACK_STATES.unavailableSummary,
  NOT_FOUND: GUARDIAN_FEEDBACK_STATES.notFound,
  UNSUPPORTED_PAGE_SIZE: GUARDIAN_FEEDBACK_STATES.unsupportedPageSize,
  TEMPORARY_UNAVAILABLE: GUARDIAN_FEEDBACK_STATES.temporaryUnavailable,
})

const STATUS_STATE_MAP = Object.freeze({
  400: GUARDIAN_FEEDBACK_STATES.validation,
  401: GUARDIAN_FEEDBACK_STATES.unauthorized,
  403: GUARDIAN_FEEDBACK_STATES.forbidden,
  404: GUARDIAN_FEEDBACK_STATES.notFound,
  422: GUARDIAN_FEEDBACK_STATES.validation,
  503: GUARDIAN_FEEDBACK_STATES.temporaryUnavailable,
})

export function createGuardianFeedbackState(type, options = {}) {
  return {
    type,
    code: options.code ?? null,
    message: options.message ?? '',
    fields: options.fields ?? {},
    diagnostic: options.diagnostic ?? null,
  }
}

export function normalizeGuardianSelfServiceError(error, context = {}) {
  if (error?.feedbackState) {
    return createGuardianFeedbackState(error.feedbackState, {
      code: error.gate ?? null,
      message: error.message,
      diagnostic: createSafeGuardianSelfServiceDiagnostic(error, context),
    })
  }

  const status = error?.response?.status ?? 0
  const payload = error?.response?.data ?? {}
  const code = payload?.error?.code ?? payload?.code ?? null
  const fields = payload?.errors ?? payload?.error?.fields ?? {}
  const type =
    CODE_STATE_MAP[code] ??
    STATUS_STATE_MAP[status] ??
    GUARDIAN_FEEDBACK_STATES.temporaryUnavailable

  return createGuardianFeedbackState(type, {
    code,
    message: payload?.message ?? payload?.error?.message ?? '',
    fields,
    diagnostic: createSafeGuardianSelfServiceDiagnostic(error, context),
  })
}

export function isGuardianFeedbackBlocking(feedback) {
  return [
    GUARDIAN_FEEDBACK_STATES.validation,
    GUARDIAN_FEEDBACK_STATES.unauthorized,
    GUARDIAN_FEEDBACK_STATES.forbidden,
    GUARDIAN_FEEDBACK_STATES.tenantMismatch,
    GUARDIAN_FEEDBACK_STATES.inactiveSchool,
    GUARDIAN_FEEDBACK_STATES.noActiveSchool,
    GUARDIAN_FEEDBACK_STATES.noGuardianLink,
    GUARDIAN_FEEDBACK_STATES.noAcademicPeriod,
    GUARDIAN_FEEDBACK_STATES.unavailableSummary,
    GUARDIAN_FEEDBACK_STATES.notFound,
    GUARDIAN_FEEDBACK_STATES.contractUnavailable,
  ].includes(feedback?.type ?? feedback)
}
