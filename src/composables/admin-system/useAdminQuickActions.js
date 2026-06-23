import { computed, toValue } from 'vue'
import { hasRequiredPermissions } from './useAdminShellPermissions'

export function isQuickActionVisible(action, userPermissions = []) {
  return (
    Boolean(action.routeApproved) &&
    Boolean(action.workflowApproved) &&
    hasRequiredPermissions(action.permissions, userPermissions)
  )
}

export function getVisibleQuickActions(actions = [], userPermissions = []) {
  return [...actions]
    .filter((action) => isQuickActionVisible(action, userPermissions))
    .sort((left, right) => left.order - right.order)
}

export function useAdminQuickActions(actions, userPermissions) {
  const visibleQuickActions = computed(() =>
    getVisibleQuickActions(toValue(actions), toValue(userPermissions)),
  )

  return {
    visibleQuickActions,
  }
}
