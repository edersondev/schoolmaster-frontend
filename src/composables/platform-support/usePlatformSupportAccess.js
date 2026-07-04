import { computed, reactive, readonly } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  PLATFORM_SUPPORT_FEEDBACK_STATES,
  PLATFORM_SUPPORT_PERMISSION_CANDIDATES,
  PLATFORM_SUPPORT_ROUTE_NAMES,
} from '@/contracts/platform-support/platformSupportContract'

function activePermissionCodes(session = {}) {
  if (typeof session.hasPermission === 'function') return null
  return (session.permissions ?? [])
    .filter((permission) => permission.status === 'active' || permission.active === true || typeof permission === 'string')
    .map((permission) => permission.code ?? permission)
}

function hasAnyPermission(session = {}, candidates = []) {
  if (typeof session.hasPermission === 'function') {
    return candidates.some((candidate) => session.hasPermission(candidate))
  }
  const codes = activePermissionCodes(session)
  return candidates.some((candidate) => codes.includes(candidate))
}

function authenticated(session = {}) {
  return Boolean(session.isAuthenticated ?? session.currentUser ?? session.actorId)
}

export function createPlatformSupportAccessState(session = {}) {
  const isAuthenticated = computed(() => authenticated(session))
  const actorId = computed(() => session.currentUser?.id ?? session.actorId ?? null)
  const hasOperationalOversightAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.operationalOversight),
  )
  const hasReportingOverviewAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.reportingOverview),
  )
  const hasSupportAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.supportAccess),
  )
  const hasSupportApprovalAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.supportApproval),
  )
  const hasSupportRevocationAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.supportRevocation),
  )
  const hasSupportDrillDownAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.supportDrillDown),
  )
  const hasSupportAuditReviewAccess = computed(() =>
    hasAnyPermission(session, PLATFORM_SUPPORT_PERMISSION_CANDIDATES.supportAuditReview),
  )
  const hasAnyPlatformSupportAccess = computed(() =>
    [
      hasOperationalOversightAccess,
      hasReportingOverviewAccess,
      hasSupportAccess,
      hasSupportApprovalAccess,
      hasSupportRevocationAccess,
      hasSupportDrillDownAccess,
      hasSupportAuditReviewAccess,
    ].some((entry) => entry.value),
  )
  const workspaceStatus = computed(() => {
    if (!isAuthenticated.value) return PLATFORM_SUPPORT_FEEDBACK_STATES.unauthorized
    if (!hasAnyPlatformSupportAccess.value) return PLATFORM_SUPPORT_FEEDBACK_STATES.forbidden
    return 'ready'
  })
  const feedbackState = computed(() =>
    workspaceStatus.value === 'ready' ? null : { type: workspaceStatus.value },
  )

  return {
    actorId,
    isAuthenticated,
    hasOperationalOversightAccess,
    hasReportingOverviewAccess,
    hasSupportAccess,
    hasSupportApprovalAccess,
    hasSupportRevocationAccess,
    hasSupportDrillDownAccess,
    hasSupportAuditReviewAccess,
    hasAnyPlatformSupportAccess,
    workspaceStatus,
    feedbackState,
    defaultRoute: { name: PLATFORM_SUPPORT_ROUTE_NAMES.oversight },
    isReady: computed(() => workspaceStatus.value === 'ready'),
  }
}

export function hasPlatformSupportAccessFlag(access, key) {
  if (!access) return true
  const flag = access[key]
  return Boolean(flag?.value ?? flag)
}

export function usePlatformSupportAccess({ session = null } = {}) {
  const store = session ?? useAuthSessionStore()
  const state = reactive(createPlatformSupportAccessState(store))
  return readonly(state)
}
