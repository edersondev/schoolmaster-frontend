import { defineStore } from 'pinia'
import {
  AUTH_ALL_PERMISSIONS,
  AUTH_FEEDBACK_STATES,
  AUTH_SESSION_STATUSES,
  createAuthFeedbackState,
  hasPrivilegedAccess,
  mapRequestedRoute,
} from '@/contracts/auth/authSession.contract'
import { authService, SCHOOL_SELECTION_SOURCE_APPROVED } from '@/services/auth/authService'

const lastApprovedSchoolKey = 'schoolmaster.auth.lastApprovedSchoolId'

function readLastApprovedSchoolId() {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(lastApprovedSchoolKey)
}

function persistLastApprovedSchoolId(schoolId) {
  if (typeof window === 'undefined') {
    return
  }
  if (schoolId) {
    window.localStorage.setItem(lastApprovedSchoolKey, schoolId)
  } else {
    window.localStorage.removeItem(lastApprovedSchoolKey)
  }
}

export const useAuthSessionStore = defineStore('auth-session', {
  state: () => ({
    status: AUTH_SESSION_STATUSES.signedOut,
    hasBootstrapped: false,
    tokenExpiresAt: null,
    currentUser: null,
    roles: [],
    permissions: [],
    activeSchool: null,
    lastApprovedSchoolId: readLastApprovedSchoolId(),
    requestedRoute: null,
    feedbackState: null,
    authorizedSchools: [],
    schoolSelectionSourceApproved: SCHOOL_SELECTION_SOURCE_APPROVED,
    passwordResetPending: false,
  }),

  getters: {
    isAuthenticated: (state) => state.status === AUTH_SESSION_STATUSES.authenticated,
    isProtectedContentReady: (state) => state.status === AUTH_SESSION_STATUSES.authenticated,
    isBootstrapping: (state) => state.status === AUTH_SESSION_STATUSES.bootstrapping,
    permissionCodes: (state) => {
      const codes = state.permissions
        .filter((permission) => permission.status === 'active')
        .map((permission) => permission.code)

      return hasPrivilegedAccess(state) ? [AUTH_ALL_PERMISSIONS, ...codes] : codes
    },
    hasPermission() {
      return (permissionCode) =>
        this.permissionCodes.includes(AUTH_ALL_PERMISSIONS) ||
        this.permissionCodes.includes(permissionCode)
    },
    tenantReady: (state) =>
      state.status === AUTH_SESSION_STATUSES.authenticated &&
      (state.activeSchool !== null || !state.roles.some((role) => role.scope === 'school')),
  },

  actions: {
    clearIdentity() {
      this.tokenExpiresAt = null
      this.currentUser = null
      this.roles = []
      this.permissions = []
      this.activeSchool = null
      this.authorizedSchools = []
    },

    clearTenantContext({ clearPersisted = false } = {}) {
      this.activeSchool = null
      this.authorizedSchools = []
      if (clearPersisted) {
        this.lastApprovedSchoolId = null
        persistLastApprovedSchoolId(null)
      }
    },

    applySession(session, { requiresSchoolContext = false } = {}) {
      this.tokenExpiresAt = session.tokenExpiresAt
      this.currentUser = session.currentUser
      this.roles = session.roles
      this.permissions = session.permissions
      this.activeSchool = session.activeSchool
      this.feedbackState = null

      if (session.activeSchool) {
        this.lastApprovedSchoolId = session.activeSchool.id
        persistLastApprovedSchoolId(session.activeSchool.id)
      }

      const needsSchool =
        requiresSchoolContext &&
        !session.activeSchool &&
        session.tenantContext.requiresSchoolSelection
      this.status = needsSchool
        ? AUTH_SESSION_STATUSES.selectingSchool
        : AUTH_SESSION_STATUSES.authenticated
    },

    applyDeniedState(error) {
      this.clearIdentity()
      this.feedbackState =
        error?.feedback ?? createAuthFeedbackState(AUTH_FEEDBACK_STATES.temporaryUnavailable)
      this.status = this.feedbackState.state

      if (
        [AUTH_FEEDBACK_STATES.tenantMismatch, AUTH_FEEDBACK_STATES.inactiveSchool].includes(
          this.feedbackState.state,
        )
      ) {
        this.clearTenantContext({ clearPersisted: true })
      }
    },

    async login(credentials, service = authService) {
      this.status = AUTH_SESSION_STATUSES.bootstrapping
      this.feedbackState = null
      try {
        const session = await service.login({
          ...credentials,
          schoolId: this.lastApprovedSchoolId ?? undefined,
        })
        this.applySession(session, {
          requiresSchoolContext: session.tenantContext.requiresSchoolSelection,
        })
        this.hasBootstrapped = true
        return session
      } catch (error) {
        this.applyDeniedState(error)
        this.hasBootstrapped = true
        throw error
      }
    },

    async bootstrap({ service = authService, requiresSchoolContext = false } = {}) {
      this.status = AUTH_SESSION_STATUSES.bootstrapping
      this.feedbackState = null
      try {
        const session = await service.getCurrentUser({
          schoolId: this.lastApprovedSchoolId ?? undefined,
        })
        this.applySession(session, { requiresSchoolContext })
        return session
      } catch (error) {
        this.applyDeniedState(error)
        throw error
      } finally {
        this.hasBootstrapped = true
      }
    },

    async logout(service = authService) {
      try {
        await service.logout()
      } finally {
        this.clearIdentity()
        this.status = AUTH_SESSION_STATUSES.signedOut
        this.feedbackState = null
        this.hasBootstrapped = true
      }
    },

    async requestPasswordReset(input, service = authService) {
      this.passwordResetPending = true
      this.feedbackState = null
      try {
        const result = await service.requestPasswordReset(input)
        this.feedbackState = createAuthFeedbackState(AUTH_FEEDBACK_STATES.neutralConfirmation)
        return result
      } catch (error) {
        this.feedbackState = error.feedback
        throw error
      } finally {
        this.passwordResetPending = false
      }
    },

    captureRequestedRoute(route, createdFrom) {
      this.requestedRoute = mapRequestedRoute(route, createdFrom)
    },

    clearRequestedRoute() {
      this.requestedRoute = null
    },

    markSessionExpired() {
      authService.clearAccessToken()
      this.clearIdentity()
      this.feedbackState = createAuthFeedbackState(AUTH_FEEDBACK_STATES.expiredSession)
      this.status = AUTH_SESSION_STATUSES.expired
      this.hasBootstrapped = true
    },

    setFeedbackState(state) {
      this.feedbackState = state ? createAuthFeedbackState(state) : null
      if (state) {
        this.status = state
      }
    },
  },
})
