import { ADMIN_NAVIGATION_ITEMS } from '@/contracts/admin-system/navigation'
import { AUTH_ROUTE_NAMES } from './modules/auth.routes'

export function getAdminFallbackRoute(store) {
  const visibleNavigationItem = ADMIN_NAVIGATION_ITEMS.filter((item) => item.approved)
    .sort((first, second) => first.order - second.order)
    .find((item) => item.permissions.every((permission) => store.hasPermission(permission)))

  return visibleNavigationItem?.destination ?? { name: AUTH_ROUTE_NAMES.state }
}
