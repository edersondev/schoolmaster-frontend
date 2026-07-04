import {
  ADVANCED_ASSESSMENT_FEEDBACK_STATES,
  createAdvancedAssessmentFeedbackState,
} from '@/contracts/assessments/advancedAssessmentContract'

const CODE_STATE_MAP = Object.freeze({
  VALIDATION_ERROR: ADVANCED_ASSESSMENT_FEEDBACK_STATES.validation,
  UNAUTHORIZED: ADVANCED_ASSESSMENT_FEEDBACK_STATES.unauthorized,
  FORBIDDEN: ADVANCED_ASSESSMENT_FEEDBACK_STATES.forbidden,
  TENANT_MISMATCH: ADVANCED_ASSESSMENT_FEEDBACK_STATES.tenantMismatch,
  NOT_FOUND: ADVANCED_ASSESSMENT_FEEDBACK_STATES.notFound,
  CONFLICT: ADVANCED_ASSESSMENT_FEEDBACK_STATES.conflict,
  AFTER_DUE_DATE: ADVANCED_ASSESSMENT_FEEDBACK_STATES.afterDueDate,
  DUPLICATE_ATTEMPT: ADVANCED_ASSESSMENT_FEEDBACK_STATES.duplicateAttempt,
  SCAN_PENDING: ADVANCED_ASSESSMENT_FEEDBACK_STATES.scanPending,
  SCAN_FAILED: ADVANCED_ASSESSMENT_FEEDBACK_STATES.scanFailed,
  UNAVAILABLE_FILE: ADVANCED_ASSESSMENT_FEEDBACK_STATES.unavailableFile,
  CONTRACT_UNAVAILABLE: ADVANCED_ASSESSMENT_FEEDBACK_STATES.contractUnavailable,
  UNSUPPORTED_ACTION: ADVANCED_ASSESSMENT_FEEDBACK_STATES.unsupportedAction,
})

const STATUS_STATE_MAP = Object.freeze({
  400: ADVANCED_ASSESSMENT_FEEDBACK_STATES.validation,
  401: ADVANCED_ASSESSMENT_FEEDBACK_STATES.unauthorized,
  403: ADVANCED_ASSESSMENT_FEEDBACK_STATES.forbidden,
  404: ADVANCED_ASSESSMENT_FEEDBACK_STATES.notFound,
  409: ADVANCED_ASSESSMENT_FEEDBACK_STATES.conflict,
  410: ADVANCED_ASSESSMENT_FEEDBACK_STATES.afterDueDate,
  422: ADVANCED_ASSESSMENT_FEEDBACK_STATES.validation,
  423: ADVANCED_ASSESSMENT_FEEDBACK_STATES.conflict,
  503: ADVANCED_ASSESSMENT_FEEDBACK_STATES.temporaryUnavailable,
})

const SENSITIVE_KEYS = /answer|content|path|token|secret|credential|private|note|storage|payload/i

export function createSafeAdvancedAssessmentDiagnostic(error, context = {}) {
  return {
    operationId: context.operationId ?? null,
    status: error?.response?.status ?? null,
    code: error?.response?.data?.error?.code ?? error?.response?.data?.code ?? error?.code ?? null,
  }
}

export function sanitizeAdvancedAssessmentDetails(details = {}) {
  return Object.fromEntries(
    Object.entries(details).filter(([key, value]) => !SENSITIVE_KEYS.test(key) && typeof value !== 'object'),
  )
}

export function normalizeAdvancedAssessmentError(error, context = {}) {
  if (error?.feedbackState) {
    return createAdvancedAssessmentFeedbackState(error.feedbackState, {
      code: error.gate ?? null,
      message: error.message,
      diagnostic: createSafeAdvancedAssessmentDiagnostic(error, context),
    })
  }

  const status = error?.response?.status ?? 0
  const payload = error?.response?.data ?? {}
  const code = payload?.error?.code ?? payload?.code ?? null
  const fields = payload?.errors ?? payload?.error?.fields ?? {}
  const type =
    CODE_STATE_MAP[code] ??
    STATUS_STATE_MAP[status] ??
    ADVANCED_ASSESSMENT_FEEDBACK_STATES.temporaryUnavailable

  return createAdvancedAssessmentFeedbackState(type, {
    code,
    message: payload?.message ?? payload?.error?.message ?? '',
    fields,
    safeDetails: sanitizeAdvancedAssessmentDetails(payload?.meta ?? {}),
    diagnostic: createSafeAdvancedAssessmentDiagnostic(error, context),
  })
}
