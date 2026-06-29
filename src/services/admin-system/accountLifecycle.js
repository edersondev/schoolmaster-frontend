import {
  mapAccountInvitation,
  mapAccountLifecycleResult,
} from '@/contracts/auth/account-lifecycle'
import {
  ACCOUNT_LIFECYCLE_ACTIONS,
  ACCOUNT_LIFECYCLE_OPERATION_IDS,
  BLOCKED_ADMIN_INVITATION_RESEND,
  mapAccountInvitationCreateRequest,
  mapAccountLifecycleActionRequest,
  mapAccountLock,
  mapAdminAccountLifecycleResult,
} from '@/contracts/admin-system/account-lifecycle'
import { authService } from '@/services/auth/authService'
import { createSafeErrorDiagnostic } from '@/services/api/errorDiagnostics'
import {
  administrationHttpClient,
  createAdministrationRequestConfig,
} from './administration-service'
import { normalizeAdministrationError } from './administration-error-mapper'

export const ADMIN_ACCOUNT_LIFECYCLE_ENDPOINTS = Object.freeze({
  invitations: '/api/v1/account-invitations',
  accountLock: (userId) => `/api/v1/users/${encodeURIComponent(userId)}/account-lock`,
  accountReactivation: (userId) =>
    `/api/v1/users/${encodeURIComponent(userId)}/account-reactivation`,
})

function envelopeData(response) {
  const envelope = response?.data ?? response
  return envelope.data ?? envelope
}

function operationContext(operationId) {
  return { operationId }
}

export function createAdminAccountLifecycleService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  function config(options = {}, data) {
    return createAdministrationRequestConfig({
      schoolId: options.schoolId,
      signal: options.signal,
      accessToken: getAccessToken?.(),
      data,
    })
  }

  function normalize(error, operationId) {
    return {
      ...normalizeAdministrationError(error, operationContext(operationId)),
      diagnostic: createSafeErrorDiagnostic(error, operationContext(operationId)),
    }
  }

  return {
    get blockedInvitationResend() {
      return BLOCKED_ADMIN_INVITATION_RESEND
    },

    async createAccountInvitation(form, options = {}) {
      try {
        const response = await client.post(
          ADMIN_ACCOUNT_LIFECYCLE_ENDPOINTS.invitations,
          mapAccountInvitationCreateRequest(form),
          config(options),
        )
        return mapAccountInvitation(envelopeData(response))
      } catch (error) {
        throw normalize(error, ACCOUNT_LIFECYCLE_OPERATION_IDS.createInvitation)
      }
    },

    async getAccountLock(userId, options = {}) {
      try {
        const response = await client.get(
          ADMIN_ACCOUNT_LIFECYCLE_ENDPOINTS.accountLock(userId),
          config(options),
        )
        return mapAccountLock(envelopeData(response))
      } catch (error) {
        throw normalize(error, ACCOUNT_LIFECYCLE_OPERATION_IDS.getLock)
      }
    },

    async lockAccount(userId, form, options = {}) {
      try {
        const response = await client.post(
          ADMIN_ACCOUNT_LIFECYCLE_ENDPOINTS.accountLock(userId),
          mapAccountLifecycleActionRequest({
            action: ACCOUNT_LIFECYCLE_ACTIONS.lock,
            reason: form?.reason,
          }),
          config(options),
        )
        return mapAccountLock(envelopeData(response))
      } catch (error) {
        throw normalize(error, ACCOUNT_LIFECYCLE_OPERATION_IDS.lock)
      }
    },

    async unlockAccount(userId, options = {}) {
      try {
        const response = await client.delete(
          ADMIN_ACCOUNT_LIFECYCLE_ENDPOINTS.accountLock(userId),
          config(options),
        )
        return mapAccountLifecycleResult(envelopeData(response))
      } catch (error) {
        throw normalize(error, ACCOUNT_LIFECYCLE_OPERATION_IDS.unlock)
      }
    },

    async reactivateAccount(userId, form, options = {}) {
      try {
        const response = await client.post(
          ADMIN_ACCOUNT_LIFECYCLE_ENDPOINTS.accountReactivation(userId),
          mapAccountLifecycleActionRequest(form),
          config(options),
        )
        return mapAdminAccountLifecycleResult(envelopeData(response))
      } catch (error) {
        throw normalize(error, ACCOUNT_LIFECYCLE_OPERATION_IDS.reactivate)
      }
    },
  }
}

export const adminAccountLifecycleService = createAdminAccountLifecycleService()

export const {
  createAccountInvitation,
  getAccountLock,
  lockAccount,
  unlockAccount,
  reactivateAccount,
} = adminAccountLifecycleService

