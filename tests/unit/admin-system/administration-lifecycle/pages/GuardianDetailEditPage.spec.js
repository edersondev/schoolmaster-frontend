import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('guardian lifecycle detail/edit pages', () => {
  it('registers guardian routes without user-link route behavior', () => {
    expect(administrationRoutes.find((route) => route.name === 'guardianDetail').meta.permissions).toEqual(['guardians.view'])
    expect(administrationRoutes.find((route) => route.name === 'guardianUserLink')).toBeUndefined()
  })
})
