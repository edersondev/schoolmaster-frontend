import { ADMIN_RECOVERY_ACTIONS } from '@/contracts/admin-system/administration'

const CODE_TYPES = Object.freeze({
  token_expired: 'unauthorized',
  token_revoked: 'unauthorized',
  unauthenticated: 'unauthorized',
  forbidden: 'forbidden',
  tenant_mismatch: 'tenant-mismatch',
  inactive_school: 'inactive-context',
  not_found: 'not-found',
  validation_failed: 'validation',
  unavailable: 'unavailable',
  service_unavailable: 'unavailable',
  conflict: 'unavailable',
})

const TYPE_MESSAGES = Object.freeze({
  validation: 'common.validationSummary',
  unauthorized: 'common.unknownError',
  forbidden: 'common.forbidden',
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
    else if (status === 404) type = 'not-found'
    else if (status === 422) type = 'validation'
    else if (status >= 500) type = 'unavailable'
    else type = 'unknown'
  }

  const errors = payload.details?.errors
  const fieldErrors =
    errors && typeof errors === 'object'
      ? Object.fromEntries(
          Object.entries(errors).map(([field, messages]) => [
            field,
            Array.isArray(messages) ? messages.map(String) : [String(messages)],
          ]),
        )
      : {}

  return {
    type,
    code,
    status,
    messageKey: TYPE_MESSAGES[type] ?? TYPE_MESSAGES.unknown,
    recoveryAction: TYPE_RECOVERY[type] ?? ADMIN_RECOVERY_ACTIONS.none,
    fieldErrors,
    operationId: context.operationId ?? null,
    routeName: context.routeName ?? null,
    requestId:
      error?.response?.headers?.['x-request-id'] ??
      error?.response?.headers?.['X-Request-Id'] ??
      null,
  }
}
