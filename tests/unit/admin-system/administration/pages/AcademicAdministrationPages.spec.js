import { describe, expect, it } from 'vitest'
import { academicRoutes } from '@/router/modules/academics.routes'

describe('academic administration page flows', () => {
  it('requires year lookup permission for period create', () => {
    expect(
      academicRoutes.find((route) => route.name === 'academicPeriodCreate').meta.permissions,
    ).toEqual(['academic_periods.view', 'academic_periods.manage', 'academic_years.view'])
  })
})
