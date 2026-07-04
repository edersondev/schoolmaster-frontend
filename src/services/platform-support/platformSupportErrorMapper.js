import {
  PLATFORM_SUPPORT_FEEDBACK_STATES,
  createPlatformSupportFeedbackState,
} from '@/contracts/platform-support/platformSupportContract'

const CODE_MAP = Object.freeze({
  TENANT_MISMATCH: PLATFORM_SUPPORT_FEEDBACK_STATES.tenantMismatch,
  SUPPORT_ACCESS_EXPIRED: PLATFORM_SUPPORT_FEEDBACK_STATES.expired,
  SUPPORT_ACCESS_REVOKED: PLATFORM_SUPPORT_FEEDBACK_STATES.revoked,
  SUPPORT_ACCESS_DENIED: PLATFORM_SUPPORT_FEEDBACK_STATES.denied,
  SUPPORT_ACCESS_STALE: PLATFORM_SUPPORT_FEEDBACK_STATES.staleResponse,
  DIAGNOSTICS_UNAVAILABLE: PLATFORM_SUPPORT_FEEDBACK_STATES.diagnosticsUnavailable,
  CONTRACT_UNAVAILABLE: PLATFORM_SUPPORT_FEEDBACK_STATES.contractUnavailable,
  TEMPORARY_UNAVAILABLE: PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable,
})

const STATUS_MAP = Object.freeze({
  401: PLATFORM_SUPPORT_FEEDBACK_STATES.unauthorized,
  403: PLATFORM_SUPPORT_FEEDBACK_STATES.forbidden,
  404: PLATFORM_SUPPORT_FEEDBACK_STATES.notFound,
  409: PLATFORM_SUPPORT_FEEDBACK_STATES.conflict,
  422: PLATFORM_SUPPORT_FEEDBACK_STATES.validation,
  423: PLATFORM_SUPPORT_FEEDBACK_STATES.revoked,
  410: PLATFORM_SUPPORT_FEEDBACK_STATES.expired,
  503: PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable,
})

export function normalizePlatformSupportError(error, { operationId } = {}) {
  const response = error?.response ?? error
  const status = response?.status ?? 0
  const payload = response?.data ?? error?.data ?? {}
  const code = payload?.error?.code ?? payload?.code ?? ''
  const type = CODE_MAP[code] ?? STATUS_MAP[status] ?? PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable

  return {
    type,
    status,
    code,
    feedback: createPlatformSupportFeedbackState(type, {
      operationId,
      requestId: payload?.meta?.request_id ?? payload?.request_id,
      field: Object.keys(payload?.errors ?? {})[0],
    }),
    diagnostic: {
      operationId,
      requestId: payload?.meta?.request_id ?? payload?.request_id ?? null,
      status,
      code: code || null,
    },
  }
}

