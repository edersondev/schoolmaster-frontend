import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('school lifecycle detail/edit pages', () => {
  it('registers school detail and edit list-return routes', () => {
    expect(administrationRoutes.find((route) => route.name === 'schoolDetail').meta.returnListRoute).toBe('schoolsList')
    expect(administrationRoutes.find((route) => route.name === 'schoolEdit').meta.returnListRoute).toBe('schoolsList')
  })
})
