import { ADMIN_PERMISSIONS, ADMIN_ROUTE_NAMES } from '@/contracts/admin-system/navigation'
import { AUTH_ROUTE_NAMES } from './modules/auth.routes'

export function getAdminFallbackRoute(store) {
  if (store.hasPermission(ADMIN_PERMISSIONS.viewDashboard)) {
    return { name: ADMIN_ROUTE_NAMES.dashboard }
  }

  if (store.hasPermission(ADMIN_PERMISSIONS.viewSchools)) {
    return { name: ADMIN_ROUTE_NAMES.schools }
  }

  return { name: AUTH_ROUTE_NAMES.state }
}
