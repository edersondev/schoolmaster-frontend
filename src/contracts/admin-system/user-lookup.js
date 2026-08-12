import {
  isActiveSchoolContext,
  isSystemAdministratorRole,
} from '@/contracts/auth/authSession.contract'

function hasScopedPermission(permissions, code, scope) {
  return permissions.some(
    (permission) =>
      permission?.code === code && permission?.scope === scope && permission?.status === 'active',
  )
}

export function resolveUserLookupMode({
  requestedMode = null,
  activeSchool = null,
  permissions = [],
  roles = [],
} = {}) {
  const isMaster = roles.some(isSystemAdministratorRole)
  const canUseSchool =
    isActiveSchoolContext(activeSchool) &&
    (isMaster || hasScopedPermission(permissions, 'users.view', 'school'))
  const canUsePlatform = isMaster || hasScopedPermission(permissions, 'schools.view', 'platform')

  if (requestedMode) {
    if (requestedMode === 'school' && canUseSchool) {
      return { scope: 'school', schoolId: activeSchool.id }
    }
    if (requestedMode === 'platform' && canUsePlatform) {
      return { scope: 'platform', schoolId: null }
    }
    return null
  }

  if (canUseSchool) return { scope: 'school', schoolId: activeSchool.id }
  if (canUsePlatform) return { scope: 'platform', schoolId: null }
  return null
}

export function userLookupRouteQuery(mode, query = {}) {
  const next = { ...query }
  if (mode?.scope) next.user_mode = mode.scope
  else delete next.user_mode
  return next
}
