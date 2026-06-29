import { computed, toValue } from 'vue'
import {
  getLifecycleCapability,
  getStatusCategory,
  LIFECYCLE_ACTIONS,
} from '@/contracts/admin-system/lifecycle'
import { AUTH_ALL_PERMISSIONS } from '@/contracts/auth/authSession.contract'

function hasPermission(permissions, permission) {
  return permissions.includes(AUTH_ALL_PERMISSIONS) || permissions.includes(permission)
}

export function deriveLifecycleActions({ resource, status, permissions = [], schoolReady = true } = {}) {
  const capability = getLifecycleCapability(resource)
  if (!capability || capability.actions.length === 0) return []
  if (capability.schoolContext && !schoolReady) return []
  if (!capability.managePermissions.every((permission) => hasPermission(permissions, permission))) return []

  const category = getStatusCategory(status)
  const actions = []
  if (category !== 'active' && category !== 'deleted') actions.push(LIFECYCLE_ACTIONS.activate)
  if (category === 'active') actions.push(LIFECYCLE_ACTIONS.deactivate)
  if (category !== 'deleted') actions.push(LIFECYCLE_ACTIONS.delete)
  if (category === 'deleted') actions.push(LIFECYCLE_ACTIONS.restore)

  return actions.filter((action) => capability.actions.includes(action))
}

export function deriveBulkLifecycleActions({
  resource,
  selectedSummaries = [],
  permissions = [],
  schoolReady = true,
} = {}) {
  if (!selectedSummaries.length) return []

  const [firstSummary, ...remainingSummaries] = selectedSummaries
  const firstActions = deriveLifecycleActions({
    resource,
    status: firstSummary.status,
    permissions,
    schoolReady,
  })

  return remainingSummaries.reduce(
    (availableActions, summary) => {
      const rowActions = deriveLifecycleActions({
        resource,
        status: summary.status,
        permissions,
        schoolReady,
      })
      return availableActions.filter((action) => rowActions.includes(action))
    },
    firstActions,
  )
}

export function useAdminActionEligibility(options = {}) {
  const actions = computed(() =>
    deriveLifecycleActions({
      resource: toValue(options.resource),
      status: toValue(options.status),
      permissions: toValue(options.permissions) ?? [],
      schoolReady: toValue(options.schoolReady) ?? true,
    }),
  )
  const canBulk = computed(() => {
    const capability = getLifecycleCapability(toValue(options.resource))
    return Boolean(capability?.bulk && actions.value.length > 0)
  })

  return {
    actions,
    canBulk,
    can: (action) => actions.value.includes(action),
  }
}
