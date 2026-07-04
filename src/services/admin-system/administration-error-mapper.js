import { ADMIN_RECOVERY_ACTIONS } from '@/contracts/admin-system/administration'

const CODE_TYPES = Object.freeze({
  token_expired: 'unauthorized',
  token_revoked: 'unauthorized',
  unauthenticated: 'unauthorized',
  forbidden: 'forbidden',
  conflict: 'conflict',
  tenant_mismatch: 'tenant-mismatch',
  inactive_school: 'inactive-context',
  not_found: 'not-found',
  validation_failed: 'validation',
  unavailable: 'unavailable',
  service_unavailable: 'unavailable',
  stale_record: 'conflict',
  dependency_conflict: 'conflict',
  ineligible_transition: 'conflict',
  batch_conflict: 'conflict',
})

const TYPE_MESSAGES = Object.freeze({
  validation: 'common.validationSummary',
  unauthorized: 'common.sessionExpired',
  forbidden: 'common.forbidden',
  conflict: 'common.conflict',
  'tenant-mismatch': 'common.tenantMismatch',
  'inactive-context': 'common.inactiveContext',
  'not-found': 'common.notFound',
  unavailable: 'common.unavailable',
  unknown: 'common.unknownError',
})

const TYPE_RECOVERY = Object.freeze({
  unauthorized: ADMIN_RECOVERY_ACTIONS.signIn,
  'tenant-mismatch': ADMIN_RECOVERY_ACTIONS.chooseSchool,
  unavailable: ADMIN_RECOVERY_ACTIONS.retry,
  unknown: ADMIN_RECOVERY_ACTIONS.retry,
  'not-found': ADMIN_RECOVERY_ACTIONS.return,
})

export function normalizeAdministrationError(error, context = {}) {
  if (error?.type && error?.messageKey) {
    return {
      ...error,
      operationId: error.operationId ?? context.operationId ?? null,
      routeName: error.routeName ?? context.routeName ?? null,
    }
  }

  const status = error?.response?.status ?? 0
  const payload = error?.response?.data?.error ?? {}
  const code = typeof payload.code === 'string' ? payload.code : 'unknown'
  let type = CODE_TYPES[code]
  if (!type) {
    if (status === 401) type = 'unauthorized'
    else if (status === 403) type = 'forbidden'
    else if (status === 409) type = 'conflict'
    else if (status === 404) type = 'not-found'
    else if (status === 422) type = 'validation'
    else if (status >= 500) type = 'unavailable'
    else type = 'unknown'
  }

  const errors = payload.details?.fields ?? payload.details?.errors
  const fieldErrors = normalizeFieldErrors(errors)

  return {
    type,
    code,
    status,
    messageKey: TYPE_MESSAGES[type] ?? TYPE_MESSAGES.unknown,
    recoveryAction: TYPE_RECOVERY[type] ?? ADMIN_RECOVERY_ACTIONS.none,
    fieldErrors,
    conflictKind: mapConflictKind(code),
    operationId: context.operationId ?? null,
    routeName: context.routeName ?? null,
    requestId:
      error?.response?.headers?.['x-request-id'] ??
      error?.response?.headers?.['X-Request-Id'] ??
      null,
  }
}

function normalizeFieldErrors(errors) {
  if (!errors || typeof errors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ]),
  )
}

function mapConflictKind(code) {
  if (code === 'stale_record') return 'stale'
  if (code === 'dependency_conflict') return 'dependency'
  if (code === 'ineligible_transition') return 'ineligible'
  if (code === 'batch_conflict') return 'batch'
  return null
}
