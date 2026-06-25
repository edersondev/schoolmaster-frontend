import { describe, expect, it } from 'vitest'
import router from '@/router'
import { adminSystemRoutes } from '@/router/modules/admin-system.routes'
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROUTE_NAMES,
  ADMIN_SYSTEM_LAYOUT,
} from '@/contracts/admin-system/navigation'
import { getAdminFallbackRoute } from '@/router'

describe('admin-system route metadata', () => {
  it('registers the dashboard route through the application router', () => {
    expect(router.hasRoute(ADMIN_ROUTE_NAMES.dashboard)).toBe(true)
  })

  it('defines layout, title, breadcrumb, sidebar, auth, and permissions metadata', () => {
    const adminRoute = adminSystemRoutes[1]
    const dashboardRoute = adminRoute.children[0]

    expect(adminRoute.meta.layout).toBe(ADMIN_SYSTEM_LAYOUT)
    expect(adminRoute.meta.requiresAuth).toBe(true)
    expect(dashboardRoute.meta.layout).toBe(ADMIN_SYSTEM_LAYOUT)
    expect(dashboardRoute.meta.title).toBe('dashboard.title')
    expect(dashboardRoute.meta.breadcrumb).toEqual([
      { label: 'dashboard.title', routeName: ADMIN_ROUTE_NAMES.dashboard },
    ])
    expect(dashboardRoute.meta.permissions).toEqual([ADMIN_PERMISSIONS.viewDashboard])
    expect(dashboardRoute.meta.sidebar).toMatchObject({
      section: 'workspace',
      order: 10,
      label: 'navigation.dashboard',
    })
  })

  it('falls back to schools when dashboard permission is unavailable', () => {
    expect(
      getAdminFallbackRoute({
        hasPermission: (permission) => permission === ADMIN_PERMISSIONS.viewSchools,
      }),
    ).toEqual({ name: ADMIN_ROUTE_NAMES.schools })
  })
})
