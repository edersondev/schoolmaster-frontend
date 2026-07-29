export const AUTH_SESSION_STATUSES = Object.freeze({
  signedOut: 'signed-out',
  bootstrapping: 'bootstrapping',
  authenticated: 'authenticated',
  expired: 'expired-session',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  inactiveUser: 'inactive-user',
  inactiveSchool: 'inactive-school',
  tenantMismatch: 'tenant-mismatch',
  selectingSchool: 'selecting-school',
  unavailable: 'temporary-unavailable',
})

export const AUTH_FEEDBACK_STATES = Object.freeze({
  validation: 'validation',
  invalidCredentials: 'invalid-credentials',
  lockout: 'lockout',
  expiredSession: 'expired-session',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  inactiveUser: 'inactive-user',
  inactiveSchool: 'inactive-school',
  tenantMismatch: 'tenant-mismatch',
  temporaryUnavailable: 'temporary-unavailable',
  neutralConfirmation: 'neutral-confirmation',
})

export const TENANT_STATUSES = Object.freeze({
  resolved: 'resolved',
  missing: 'missing',
  inactive: 'inactive',
  mismatch: 'mismatch',
  selecting: 'selecting',
})

export const AUTH_ALL_PERMISSIONS = '*'
export const SYSTEM_ADMINISTRATOR_ROLE_NAME = 'System Administrator'

function mapAddress(address) {
  if (!address) {
    return null
  }

  return {
    id: address.id ?? null,
    street: address.street ?? '',
    number: address.number ?? '',
    complement: address.complement ?? null,
    neighborhood: address.neighborhood ?? '',
    city: address.city ?? '',
    state: address.state ?? '',
    zipCode: address.zip_code ?? '',
    country: address.country ?? null,
  }
}

/**
 * @typedef {Object} CurrentUser
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} status
 * @property {string|null} schoolId
 * @property {Array<Object>} roles
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} accessToken
 * @property {string} tokenExpiresAt
 * @property {CurrentUser} currentUser
 * @property {Array<Object>} roles
 * @property {Array<Object>} permissions
 * @property {Object|null} activeSchool
 * @property {Object} tenantContext
 */

function mapPermission(permission = {}) {
  return {
    id: permission.id ?? '',
    code: permission.code ?? '',
    name: permission.name ?? '',
    scope: permission.scope ?? '',
    status: permission.status ?? '',
  }
}

function mapRole(role = {}) {
  return {
    id: role.id ?? '',
    code: role.code ?? role.slug ?? '',
    schoolId: role.school_id ?? null,
    scope: role.scope ?? '',
    name: role.name ?? '',
    status: role.status ?? '',
    permissions: Array.isArray(role.permissions) ? role.permissions.map(mapPermission) : [],
  }
}

export function isSystemAdministratorRole(role = {}) {
  return (
    role.status === 'active' &&
    role.scope === 'platform' &&
    role.name === SYSTEM_ADMINISTRATOR_ROLE_NAME
  )
}

export function isSystemAdministratorSession(session = {}) {
  const roles = Array.isArray(session.roles) ? session.roles : []
  return roles.some(isSystemAdministratorRole)
}

export function hasPrivilegedAccess(session = {}) {
  const permissions = Array.isArray(session.permissions) ? session.permissions : []

  return (
    isSystemAdministratorSession(session) ||
    permissions.some(
      (permission) => permission.status === 'active' && permission.code === AUTH_ALL_PERMISSIONS,
    )
  )
}

export function hasRequiredFeaturePermissions(session = {}, requiredPermissions = []) {
  if (hasPrivilegedAccess(session)) return true

  const activePermissionCodes = (session.permissions ?? [])
    .filter((permission) => permission.status === 'active')
    .map((permission) => permission.code)

  return requiredPermissions.every((permission) => activePermissionCodes.includes(permission))
}

export function isActiveSchoolContext(school) {
  if (!school?.id) return false
  return !school.status || school.status === 'active'
}

function mapSchool(school) {
  if (!school) {
    return null
  }

  return {
    id: school.id ?? '',
    name: school.name ?? '',
    code: school.code ?? school.cnpj ?? '',
    cnpj: school.cnpj ?? school.code ?? '',
    status: school.status ?? '',
    timezone: school.timezone ?? school.time_zone ?? null,
    timeZone: school.timezone ?? school.time_zone ?? null,
    contactEmail: school.contact_email ?? null,
    contactPhone: school.contact_phone ?? null,
    address: mapAddress(school.address),
  }
}

function mapCurrentUser(user = {}) {
  return {
    id: user.id ?? '',
    schoolId: user.school_id ?? null,
    fullName: user.full_name ?? '',
    email: user.email ?? '',
    status: user.status ?? '',
    roles: Array.isArray(user.roles) ? user.roles.map(mapRole) : [],
    guardianAccessState:
      user.guardian_access_state ?? user.guardian_self_service_access ?? user.guardianAccessState ?? null,
  }
}

function mapStudentProfile(profile) {
  if (!profile) return null

  return {
    id: profile.id ?? profile.student_profile_id ?? '',
    fullName: profile.full_name ?? profile.name ?? '',
    status: profile.status ?? '',
    schoolId: profile.school_id ?? null,
  }
}

function mapAcademicPeriod(period) {
  if (!period) return null

  return {
    id: period.id ?? period.academic_period_id ?? '',
    name: period.name ?? period.title ?? '',
    status: period.status ?? '',
    startDate: period.start_date ?? null,
    endDate: period.end_date ?? null,
  }
}

export function mapLoginRequest(input = {}) {
  const request = {
    email: String(input.email ?? '').trim(),
    password: String(input.password ?? ''),
  }

  return request
}

export function mapPasswordResetRequest(input = {}) {
  const request = {
    email: String(input.email ?? '').trim(),
  }

  if (input.schoolId) {
    request.school_id = input.schoolId
  }

  return request
}

export function mapPasswordResetResult(data = {}) {
  return { accepted: data.accepted === true }
}

export function mapAuthSession(data = {}) {
  const roles = Array.isArray(data.roles) ? data.roles.map(mapRole) : []
  const permissions = Array.isArray(data.permissions) ? data.permissions.map(mapPermission) : []
  const activeSchool = mapSchool(data.resolved_school)
  const activeStudentProfile = mapStudentProfile(
    data.active_student_profile ?? data.student_profile ?? data.linked_student_profile,
  )
  const currentAcademicPeriod = mapAcademicPeriod(
    data.current_academic_period ?? data.active_academic_period ?? data.academic_period,
  )
  const requiresSchoolSelection =
    !activeSchool && roles.some((role) => role.status === 'active' && role.scope === 'school')

  return {
    accessToken: data.token ?? '',
    tokenExpiresAt: data.token_expires_at ?? null,
    currentUser: mapCurrentUser(data.user),
    roles,
    permissions,
    activeSchool,
    activeStudentProfile,
    currentAcademicPeriod,
    tenantContext: {
      activeSchool,
      activeStudentProfile,
      currentAcademicPeriod,
      requestedSchoolId: null,
      requiresSchoolSelection,
      schoolSelectionSource: null,
      tenantStatus: activeSchool
        ? TENANT_STATUSES.resolved
        : requiresSchoolSelection
          ? TENANT_STATUSES.selecting
          : TENANT_STATUSES.missing,
    },
  }
}

export function createAuthFeedbackState(state, options = {}) {
  return {
    state,
    messageKey: options.messageKey ?? feedbackMessageKey(state),
    severity: options.severity ?? feedbackSeverity(state),
    recoveryAction: options.recoveryAction ?? feedbackRecoveryAction(state),
  }
}

export function mapRequestedRoute(route, createdFrom) {
  return {
    routeName: route.name ?? null,
    routeParams: { ...route.params },
    routeQuery: { ...route.query },
    requiresSchoolContext: route.meta?.requiresSchoolContext === true,
    requiredPermissions: [...(route.meta?.permissions ?? route.meta?.requiredPermissions ?? [])],
    createdFrom,
  }
}

function feedbackMessageKey(state) {
  const keys = {
    [AUTH_FEEDBACK_STATES.validation]: 'feedback.validation',
    [AUTH_FEEDBACK_STATES.invalidCredentials]: 'feedback.invalidCredentials',
    [AUTH_FEEDBACK_STATES.lockout]: 'feedback.lockout',
    [AUTH_FEEDBACK_STATES.expiredSession]: 'feedback.expiredSession',
    [AUTH_FEEDBACK_STATES.unauthorized]: 'feedback.unauthorized',
    [AUTH_FEEDBACK_STATES.forbidden]: 'feedback.forbidden',
    [AUTH_FEEDBACK_STATES.inactiveUser]: 'feedback.inactiveUser',
    [AUTH_FEEDBACK_STATES.inactiveSchool]: 'feedback.inactiveSchool',
    [AUTH_FEEDBACK_STATES.tenantMismatch]: 'feedback.tenantMismatch',
    [AUTH_FEEDBACK_STATES.temporaryUnavailable]: 'feedback.temporaryUnavailable',
    [AUTH_FEEDBACK_STATES.neutralConfirmation]: 'feedback.neutralConfirmation',
  }

  return keys[state] ?? 'feedback.temporaryUnavailable'
}

function feedbackSeverity(state) {
  if (state === AUTH_FEEDBACK_STATES.neutralConfirmation) {
    return 'info'
  }
  if ([AUTH_FEEDBACK_STATES.lockout, AUTH_FEEDBACK_STATES.expiredSession].includes(state)) {
    return 'warning'
  }
  return 'error'
}

function feedbackRecoveryAction(state) {
  if (
    [
      AUTH_FEEDBACK_STATES.expiredSession,
      AUTH_FEEDBACK_STATES.unauthorized,
      AUTH_FEEDBACK_STATES.inactiveUser,
    ].includes(state)
  ) {
    return 'sign-in'
  }
  if ([AUTH_FEEDBACK_STATES.inactiveSchool, AUTH_FEEDBACK_STATES.tenantMismatch].includes(state)) {
    return 'choose-school'
  }
  if (state === AUTH_FEEDBACK_STATES.forbidden) {
    return 'allowed-workspace'
  }
  if (state === AUTH_FEEDBACK_STATES.temporaryUnavailable) {
    return 'retry'
  }
  return null
}
