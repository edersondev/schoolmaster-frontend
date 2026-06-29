import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('administration lifecycle routes', () => {
  it('keeps routes protected and permissions exact for lifecycle detail/edit surfaces', () => {
    expect(administrationRoutes.every((route) => route.meta.requiresAuth)).toBe(true)
    expect(administrationRoutes.find((route) => route.name === 'permissionsList')).toBeTruthy()
    expect(administrationRoutes.find((route) => route.name === 'permissionDetail')).toBeUndefined()
    expect(administrationRoutes.find((route) => route.name === 'schoolDetail').meta.requiresSchoolContext).toBe(false)
    expect(administrationRoutes.find((route) => route.name === 'academicYearDetail').meta.requiresSchoolContext).toBe(true)
  })
})
