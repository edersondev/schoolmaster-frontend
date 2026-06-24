import axios from 'axios'
import {
  mapAuthSession,
  mapLoginRequest,
  mapPasswordResetRequest,
  mapPasswordResetResult,
} from '@/contracts/auth/authSession.contract'
import { normalizeAuthError, normalizeAuthSuccess } from './authErrorMapper'

export const AUTH_ENDPOINTS = Object.freeze({
  login: '/api/v1/auth/login',
  currentUser: '/api/v1/auth/me',
  logout: '/api/v1/auth/logout',
  passwordResetRequests: '/api/v1/auth/password-reset-requests',
})

export const SCHOOL_SELECTION_SOURCE_APPROVED = false

export function createAuthService(client) {
  let accessToken = null

  function requestHeaders(headers = {}) {
    return accessToken ? { ...headers, Authorization: `Bearer ${accessToken}` } : headers
  }

  return {
    setAccessToken(token) {
      accessToken = token || null
    },

    clearAccessToken() {
      accessToken = null
    },

    async login(credentials) {
      try {
        const response = await client.post(AUTH_ENDPOINTS.login, mapLoginRequest(credentials))
        const session = mapAuthSession(normalizeAuthSuccess(response))
        accessToken = session.accessToken || null
        return session
      } catch (error) {
        throw normalizeAuthError(error, { operation: 'login' })
      }
    },

    async getCurrentUser(options = {}) {
      const tenantHeaders = options.schoolId ? { 'X-School-Id': options.schoolId } : {}

      try {
        const response = await client.get(AUTH_ENDPOINTS.currentUser, {
          headers: requestHeaders(tenantHeaders),
        })
        const session = mapAuthSession(normalizeAuthSuccess(response))
        if (session.accessToken) {
          accessToken = session.accessToken
        }
        return session
      } catch (error) {
        throw normalizeAuthError(error, { operation: 'current-user' })
      }
    },

    async logout() {
      try {
        const response = await client.post(AUTH_ENDPOINTS.logout, undefined, {
          headers: requestHeaders(),
        })
        return normalizeAuthSuccess(response)
      } catch (error) {
        throw normalizeAuthError(error, { operation: 'logout' })
      } finally {
        accessToken = null
      }
    },

    async requestPasswordReset(input) {
      try {
        const response = await client.post(
          AUTH_ENDPOINTS.passwordResetRequests,
          mapPasswordResetRequest(input),
        )
        return mapPasswordResetResult(normalizeAuthSuccess(response))
      } catch (error) {
        const normalized = normalizeAuthError(error, { operation: 'password-reset-request' })
        if (normalized.feedback.state === 'validation') {
          throw normalized
        }
        if ([401, 403, 429].includes(normalized.status)) {
          return { accepted: true }
        }
        throw normalized
      }
    },

    async listAuthorizedSchools() {
      throw new Error(
        'School selection is blocked until an approved user-authorized source exists.',
      )
    },
  }
}

const authHttpClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const authService = createAuthService(authHttpClient)

export default authService
