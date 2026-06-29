import axios from 'axios'
import {
  ACCOUNT_LIFECYCLE_FEEDBACK_STATES,
  createAccountLifecycleFeedbackState,
  mapAccountLifecycleResult,
  mapInvitationSetupRequest,
  mapPasswordResetCompletionRequest,
  mapPasswordResetRequest,
} from '@/contracts/auth/account-lifecycle'
import { createSafeErrorDiagnostic } from '@/services/api/errorDiagnostics'
import { normalizeAuthError, normalizeAuthSuccess } from './authErrorMapper'

export const AUTH_ACCOUNT_LIFECYCLE_ENDPOINTS = Object.freeze({
  invitationSetup: (token) => `/api/v1/account-invitations/${encodeURIComponent(token)}/setup`,
  passwordResetRequests: '/api/v1/auth/password-reset-requests',
  passwordResets: '/api/v1/auth/password-resets',
})

const ERROR_CODE_STATES = Object.freeze({
  validation_failed: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.validation,
  token_expired: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken,
  token_revoked: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken,
  token_invalid: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken,
  invalid_token: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken,
  unauthorized: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.unauthorized,
  unauthenticated: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.unauthorized,
  forbidden: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.forbidden,
  tenant_mismatch: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.tenantMismatch,
  inactive_school: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.inactiveSchool,
  not_found: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.notFound,
  conflict: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.conflict,
  service_unavailable: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.temporaryUnavailable,
  unavailable: ACCOUNT_LIFECYCLE_FEEDBACK_STATES.temporaryUnavailable,
})

export class AccountLifecycleServiceError extends Error {
  constructor({ code, status, feedback, fieldErrors = {}, diagnostic = null }) {
    super('Account lifecycle request could not be completed.')
    this.name = 'AccountLifecycleServiceError'
    this.code = code
    this.status = status
    this.feedback = feedback
    this.fieldErrors = fieldErrors
    this.diagnostic = diagnostic
  }
}

function extractFieldErrors(error) {
  const details = error?.response?.data?.error?.details ?? {}
  const errors = details.errors ?? details

  if (!errors || typeof errors !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.map(String) : [String(messages)],
    ]),
  )
}

export function normalizeAccountLifecycleError(error, context = {}) {
  if (error instanceof AccountLifecycleServiceError) {
    return error
  }

  const status = error?.response?.status ?? 0
  const code = error?.response?.data?.error?.code ?? (status === 401 ? 'token_invalid' : 'unknown')
  let state = ERROR_CODE_STATES[code]

  if (!state && status === 422) state = ACCOUNT_LIFECYCLE_FEEDBACK_STATES.validation
  if (!state && status === 401) {
    state = context.tokenOperation
      ? ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken
      : ACCOUNT_LIFECYCLE_FEEDBACK_STATES.unauthorized
  }
  if (!state && status === 403) state = ACCOUNT_LIFECYCLE_FEEDBACK_STATES.forbidden
  if (!state && status === 404) state = ACCOUNT_LIFECYCLE_FEEDBACK_STATES.notFound
  if (!state && status === 409) state = ACCOUNT_LIFECYCLE_FEEDBACK_STATES.conflict
  if (!state) state = ACCOUNT_LIFECYCLE_FEEDBACK_STATES.temporaryUnavailable

  return new AccountLifecycleServiceError({
    code,
    status,
    feedback: createAccountLifecycleFeedbackState(state),
    fieldErrors: extractFieldErrors(error),
    diagnostic: createSafeErrorDiagnostic(error, context),
  })
}

export function createAuthAccountLifecycleService(client) {
  return {
    async completeAccountInvitation(input, options = {}) {
      try {
        const token = String(input.invitationToken ?? input.token ?? '').trim()
        const response = await client.post(
          AUTH_ACCOUNT_LIFECYCLE_ENDPOINTS.invitationSetup(token),
          mapInvitationSetupRequest(input),
          { signal: options.signal },
        )
        return mapAccountLifecycleResult(normalizeAuthSuccess(response))
      } catch (error) {
        throw normalizeAccountLifecycleError(error, {
          operationId: 'completeAccountInvitation',
          tokenOperation: true,
        })
      }
    },

    async requestPasswordReset(input, options = {}) {
      try {
        const response = await client.post(
          AUTH_ACCOUNT_LIFECYCLE_ENDPOINTS.passwordResetRequests,
          mapPasswordResetRequest(input),
          { signal: options.signal },
        )
        const data = normalizeAuthSuccess(response)
        return {
          accepted: data.accepted === true,
          feedback: createAccountLifecycleFeedbackState(
            ACCOUNT_LIFECYCLE_FEEDBACK_STATES.neutralConfirmation,
          ),
        }
      } catch (error) {
        const normalized = normalizeAccountLifecycleError(error, {
          operationId: 'requestPasswordReset',
        })
        if (normalized.feedback.state === ACCOUNT_LIFECYCLE_FEEDBACK_STATES.validation) {
          throw normalized
        }
        if ([401, 403, 404, 409, 429].includes(normalized.status)) {
          return {
            accepted: true,
            feedback: createAccountLifecycleFeedbackState(
              ACCOUNT_LIFECYCLE_FEEDBACK_STATES.neutralConfirmation,
            ),
          }
        }
        throw normalized
      }
    },

    async completePasswordReset(input, options = {}) {
      try {
        const response = await client.post(
          AUTH_ACCOUNT_LIFECYCLE_ENDPOINTS.passwordResets,
          mapPasswordResetCompletionRequest(input),
          { signal: options.signal },
        )
        return mapAccountLifecycleResult(normalizeAuthSuccess(response))
      } catch (error) {
        throw normalizeAccountLifecycleError(error, {
          operationId: 'completePasswordReset',
          tokenOperation: true,
        })
      }
    },
  }
}

const accountLifecycleHttpClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const authAccountLifecycleService =
  createAuthAccountLifecycleService(accountLifecycleHttpClient)

export { normalizeAuthError }

export default authAccountLifecycleService

