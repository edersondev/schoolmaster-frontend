import {
  AUTH_FEEDBACK_STATES,
  createAuthFeedbackState,
} from '@/contracts/auth/authSession.contract'

const errorStateByCode = Object.freeze({
  validation_failed: AUTH_FEEDBACK_STATES.validation,
  invalid_credentials: AUTH_FEEDBACK_STATES.invalidCredentials,
  auth_locked: AUTH_FEEDBACK_STATES.lockout,
  token_expired: AUTH_FEEDBACK_STATES.expiredSession,
  token_revoked: AUTH_FEEDBACK_STATES.expiredSession,
  forbidden: AUTH_FEEDBACK_STATES.forbidden,
  tenant_mismatch: AUTH_FEEDBACK_STATES.tenantMismatch,
  inactive_user: AUTH_FEEDBACK_STATES.inactiveUser,
  inactive_school: AUTH_FEEDBACK_STATES.inactiveSchool,
})

export class AuthServiceError extends Error {
  constructor({ code, status, feedback, fieldErrors = {} }) {
    super('Authentication request could not be completed.')
    this.name = 'AuthServiceError'
    this.code = code
    this.status = status
    this.feedback = feedback
    this.fieldErrors = fieldErrors
  }
}

export function normalizeAuthSuccess(response) {
  const responseData = response?.data ?? response
  return responseData?.data ?? responseData
}

export function normalizeAuthError(error, options = {}) {
  if (error instanceof AuthServiceError) {
    return error
  }

  const status = error?.response?.status ?? 0
  const envelope = error?.response?.data?.error ?? {}
  const code = envelope.code ?? (status === 401 ? 'unauthorized' : 'temporary_unavailable')
  let state = errorStateByCode[code]

  if (!state && options.operation === 'login' && status === 401) {
    state = AUTH_FEEDBACK_STATES.invalidCredentials
  }
  if (!state && status === 403) {
    state = AUTH_FEEDBACK_STATES.forbidden
  }
  if (!state && status === 422) {
    state = AUTH_FEEDBACK_STATES.validation
  }
  if (!state && status === 401) {
    state = AUTH_FEEDBACK_STATES.unauthorized
  }
  if (!state) {
    state = AUTH_FEEDBACK_STATES.temporaryUnavailable
  }

  return new AuthServiceError({
    code,
    status,
    feedback: createAuthFeedbackState(state),
    fieldErrors: envelope.details ?? {},
  })
}
