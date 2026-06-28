import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('academic lifecycle detail/edit pages', () => {
  it('registers tenant-scoped academic detail and edit routes', () => {
    expect(administrationRoutes.find((route) => route.name === 'academicYearDetail').meta.requiresSchoolContext).toBe(true)
    expect(administrationRoutes.find((route) => route.name === 'academicPeriodEdit').meta.resource).toBe('academicPeriods')
  })
})
