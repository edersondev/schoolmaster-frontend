import { describe, expect, it } from 'vitest'
import { PLATFORM_SUPPORT_ROUTE_NAMES, platformSupportRoutes } from '@/router/modules/platform-support'

describe('platform support routes', () => {
  it('wires workspace root to Platform Operational Oversight by default', () => {
    const root = platformSupportRoutes[0]
    expect(root.path).toBe('/platform-support')
    expect(root.children[0]).toMatchObject({
      name: PLATFORM_SUPPORT_ROUTE_NAMES.workspace,
      redirect: { name: PLATFORM_SUPPORT_ROUTE_NAMES.oversight },
    })
  })

  it('keeps route metadata platform-only and protected', () => {
    const routeNames = platformSupportRoutes[0].children.map((route) => route.name)
    expect(routeNames).toEqual([
      PLATFORM_SUPPORT_ROUTE_NAMES.workspace,
      PLATFORM_SUPPORT_ROUTE_NAMES.oversight,
      PLATFORM_SUPPORT_ROUTE_NAMES.decisions,
      PLATFORM_SUPPORT_ROUTE_NAMES.decisionDetail,
      PLATFORM_SUPPORT_ROUTE_NAMES.diagnostics,
      PLATFORM_SUPPORT_ROUTE_NAMES.audit,
    ])
    expect(platformSupportRoutes[0].meta.requiresAuth).toBe(true)
    expect(platformSupportRoutes[0].meta.requiresSchoolContext).toBe(false)
  })
})

