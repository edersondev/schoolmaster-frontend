import { describe, expect, it } from 'vitest'
import { reportingRoutes } from '@/router/modules/reporting'
import { REPORTING_ROUTE_NAMES } from '@/contracts/reporting/reportingContract'

describe('reporting routes', () => {
  it('opens Report History by default and protects reporting routes', () => {
    const root = reportingRoutes.find((route) => route.name === REPORTING_ROUTE_NAMES.workspace)
    expect(root.redirect).toEqual({ name: REPORTING_ROUTE_NAMES.history })
    expect(reportingRoutes.every((route) => route.meta.requiresAuth)).toBe(true)
    expect(reportingRoutes.every((route) => route.meta.requiresSchoolContext)).toBe(true)
  })
})
