import { describe, expect, it } from 'vitest'
import { guardianRoutes } from '@/router/modules/guardians.routes'

describe('guardian route redirects', () => {
  it('redirects former standalone guardian routes to Create Student', () => {
    expect(guardianRoutes.map((route) => route.name)).toEqual([
      'guardiansList',
      'guardianCreate',
      'guardianDetail',
      'guardianEdit',
    ])

    guardianRoutes.forEach((route) => {
      expect(route.component).toBeUndefined()
      expect(route.redirect({ name: route.name })).toEqual({
        name: 'studentProfileCreate',
        query: { redirected_from: route.name },
      })
    })
  })
})
