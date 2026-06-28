import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('administration lifecycle route registration', () => {
  it('registers all lifecycle detail and edit route names through the main route assembly', () => {
    const names = administrationRoutes.map((route) => route.name)

    expect(names).toEqual(
      expect.arrayContaining([
        'schoolDetail',
        'schoolEdit',
        'userDetail',
        'userEdit',
        'roleDetail',
        'roleEdit',
        'academicYearDetail',
        'academicYearEdit',
        'academicPeriodDetail',
        'academicPeriodEdit',
        'guardianDetail',
        'guardianEdit',
      ]),
    )
    expect(names).not.toContain('permissionDetail')
    expect(names).not.toContain('permissionEdit')
  })
})
