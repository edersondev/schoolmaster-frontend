import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'
import { createSafeStudentSelfServiceDiagnostic } from './studentSelfServiceDiagnostics'

const CODE_STATE_MAP = Object.freeze({
  VALIDATION_ERROR: STUDENT_FEEDBACK_STATES.validation,
  UNAUTHORIZED: STUDENT_FEEDBACK_STATES.unauthorized,
  FORBIDDEN: STUDENT_FEEDBACK_STATES.forbidden,
  TENANT_MISMATCH: STUDENT_FEEDBACK_STATES.tenantMismatch,
  INACTIVE_SCHOOL: STUDENT_FEEDBACK_STATES.inactiveSchool,
  NO_ACTIVE_SCHOOL: STUDENT_FEEDBACK_STATES.noActiveSchool,
  NO_STUDENT_PROFILE: STUDENT_FEEDBACK_STATES.noStudentProfile,
  NO_CURRENT_PERIOD: STUDENT_FEEDBACK_STATES.noCurrentPeriod,
  UNAVAILABLE_CONTENT: STUDENT_FEEDBACK_STATES.unavailableContent,
  NOT_FOUND: STUDENT_FEEDBACK_STATES.notFound,
  UNSUPPORTED_PAGE_SIZE: STUDENT_FEEDBACK_STATES.unsupportedPageSize,
  TEMPORARY_UNAVAILABLE: STUDENT_FEEDBACK_STATES.temporaryUnavailable,
})

const STATUS_STATE_MAP = Object.freeze({
  400: STUDENT_FEEDBACK_STATES.validation,
  401: STUDENT_FEEDBACK_STATES.unauthorized,
  403: STUDENT_FEEDBACK_STATES.forbidden,
  404: STUDENT_FEEDBACK_STATES.notFound,
  422: STUDENT_FEEDBACK_STATES.validation,
  503: STUDENT_FEEDBACK_STATES.temporaryUnavailable,
})

export function createStudentFeedbackState(type, options = {}) {
  return {
    type,
    code: options.code ?? null,
    message: options.message ?? '',
    fields: options.fields ?? {},
    diagnostic: options.diagnostic ?? null,
  }
}

export function normalizeStudentSelfServiceError(error, context = {}) {
  if (error?.feedbackState) {
    return createStudentFeedbackState(error.feedbackState, {
      code: error.gate ?? null,
      message: error.message,
      diagnostic: createSafeStudentSelfServiceDiagnostic(error, context),
    })
  }

  const status = error?.response?.status ?? 0
  const payload = error?.response?.data ?? {}
  const code = payload?.error?.code ?? payload?.code ?? null
  const fields = payload?.errors ?? payload?.error?.fields ?? {}
  const type =
    CODE_STATE_MAP[code] ??
    STATUS_STATE_MAP[status] ??
    STUDENT_FEEDBACK_STATES.temporaryUnavailable

  return createStudentFeedbackState(type, {
    code,
    message: payload?.message ?? payload?.error?.message ?? '',
    fields,
    diagnostic: createSafeStudentSelfServiceDiagnostic(error, context),
  })
}

export function isStudentFeedbackBlocking(feedback) {
  return [
    STUDENT_FEEDBACK_STATES.validation,
    STUDENT_FEEDBACK_STATES.unauthorized,
    STUDENT_FEEDBACK_STATES.forbidden,
    STUDENT_FEEDBACK_STATES.tenantMismatch,
    STUDENT_FEEDBACK_STATES.inactiveSchool,
    STUDENT_FEEDBACK_STATES.noActiveSchool,
    STUDENT_FEEDBACK_STATES.noStudentProfile,
    STUDENT_FEEDBACK_STATES.noCurrentPeriod,
    STUDENT_FEEDBACK_STATES.unavailableContent,
    STUDENT_FEEDBACK_STATES.notFound,
    STUDENT_FEEDBACK_STATES.contractUnavailable,
  ].includes(feedback?.type ?? feedback)
}
