import { createSafeTeacherWorkflowDiagnostic } from './teacherWorkflowDiagnostics'

export const TEACHER_WORKFLOW_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  success: 'success',
  loading: 'loading',
  empty: 'empty',
  validation: 'validation',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  inactiveSchool: 'inactive-school',
  inactiveRecord: 'inactive-record',
  notFound: 'not-found',
  conflict: 'conflict',
  unsupportedContract: 'unsupported-contract',
  unsupportedFilter: 'unsupported-filter',
  unsupportedSort: 'unsupported-sort',
  unsupportedPageSize: 'unsupported-page-size',
  scanUnavailable: 'scan-unavailable',
  downloadDenied: 'download-denied',
  importValidation: 'import-validation',
  staleRecord: 'stale-record',
  temporaryUnavailable: 'temporary-unavailable',
})

const CODE_STATE_MAP = Object.freeze({
  VALIDATION_ERROR: TEACHER_WORKFLOW_FEEDBACK_STATES.validation,
  UNAUTHORIZED: TEACHER_WORKFLOW_FEEDBACK_STATES.unauthorized,
  FORBIDDEN: TEACHER_WORKFLOW_FEEDBACK_STATES.forbidden,
  TENANT_MISMATCH: TEACHER_WORKFLOW_FEEDBACK_STATES.tenantMismatch,
  INACTIVE_SCHOOL: TEACHER_WORKFLOW_FEEDBACK_STATES.inactiveSchool,
  INACTIVE_RECORD: TEACHER_WORKFLOW_FEEDBACK_STATES.inactiveRecord,
  NOT_FOUND: TEACHER_WORKFLOW_FEEDBACK_STATES.notFound,
  CONFLICT: TEACHER_WORKFLOW_FEEDBACK_STATES.conflict,
  UNSUPPORTED_FILTER: TEACHER_WORKFLOW_FEEDBACK_STATES.unsupportedFilter,
  UNSUPPORTED_SORT: TEACHER_WORKFLOW_FEEDBACK_STATES.unsupportedSort,
  UNSUPPORTED_PAGE_SIZE: TEACHER_WORKFLOW_FEEDBACK_STATES.unsupportedPageSize,
  SCAN_UNAVAILABLE: TEACHER_WORKFLOW_FEEDBACK_STATES.scanUnavailable,
  DOWNLOAD_DENIED: TEACHER_WORKFLOW_FEEDBACK_STATES.downloadDenied,
  IMPORT_VALIDATION: TEACHER_WORKFLOW_FEEDBACK_STATES.importValidation,
  STALE_RECORD: TEACHER_WORKFLOW_FEEDBACK_STATES.staleRecord,
  TEMPORARY_UNAVAILABLE: TEACHER_WORKFLOW_FEEDBACK_STATES.temporaryUnavailable,
})

const STATUS_STATE_MAP = Object.freeze({
  400: TEACHER_WORKFLOW_FEEDBACK_STATES.validation,
  401: TEACHER_WORKFLOW_FEEDBACK_STATES.unauthorized,
  403: TEACHER_WORKFLOW_FEEDBACK_STATES.forbidden,
  404: TEACHER_WORKFLOW_FEEDBACK_STATES.notFound,
  409: TEACHER_WORKFLOW_FEEDBACK_STATES.conflict,
  422: TEACHER_WORKFLOW_FEEDBACK_STATES.validation,
  423: TEACHER_WORKFLOW_FEEDBACK_STATES.inactiveRecord,
  503: TEACHER_WORKFLOW_FEEDBACK_STATES.temporaryUnavailable,
})

export function normalizeTeacherWorkflowError(error, context = {}) {
  if (error?.feedbackState) {
    return {
      type: error.feedbackState,
      code: error.gate ?? null,
      message: error.message,
      fields: {},
      diagnostic: createSafeTeacherWorkflowDiagnostic(error, context),
    }
  }

  const status = error?.response?.status ?? 0
  const payload = error?.response?.data ?? {}
  const code = payload?.error?.code ?? payload?.code ?? null
  const fields = payload?.errors ?? payload?.error?.fields ?? {}
  const type =
    CODE_STATE_MAP[code] ??
    STATUS_STATE_MAP[status] ??
    TEACHER_WORKFLOW_FEEDBACK_STATES.temporaryUnavailable

  return {
    type,
    code,
    message: payload?.message ?? payload?.error?.message ?? '',
    fields,
    diagnostic: createSafeTeacherWorkflowDiagnostic(error, context),
  }
}

export function isFeedbackBlocking(feedback) {
  return [
    TEACHER_WORKFLOW_FEEDBACK_STATES.validation,
    TEACHER_WORKFLOW_FEEDBACK_STATES.unauthorized,
    TEACHER_WORKFLOW_FEEDBACK_STATES.forbidden,
    TEACHER_WORKFLOW_FEEDBACK_STATES.tenantMismatch,
    TEACHER_WORKFLOW_FEEDBACK_STATES.conflict,
    TEACHER_WORKFLOW_FEEDBACK_STATES.unsupportedContract,
  ].includes(feedback?.type ?? feedback)
}
