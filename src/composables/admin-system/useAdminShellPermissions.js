import { computed, toValue } from 'vue'
import { AUTH_ALL_PERMISSIONS } from '@/contracts/auth/authSession.contract'

function normalizePermissions(permissions) {
  return new Set(Array.isArray(permissions) ? permissions : [])
}

export function hasRequiredPermissions(requiredPermissions = [], userPermissions = []) {
  const permissionSet = normalizePermissions(userPermissions)
  if (permissionSet.has(AUTH_ALL_PERMISSIONS)) return true
  return requiredPermissions.every((permission) => permissionSet.has(permission))
}

export function isNavigationItemVisible(item, userPermissions = []) {
  return Boolean(item.approved) && hasRequiredPermissions(item.permissions, userPermissions)
}

export function getVisibleNavigationItems(items = [], userPermissions = []) {
  return [...items]
    .filter((item) => isNavigationItemVisible(item, userPermissions))
    .sort((left, right) => left.order - right.order)
}

export function useAdminShellPermissions(items, userPermissions) {
  const visibleNavigationItems = computed(() =>
    getVisibleNavigationItems(toValue(items), toValue(userPermissions)),
  )

  return {
    visibleNavigationItems,
  }
}
