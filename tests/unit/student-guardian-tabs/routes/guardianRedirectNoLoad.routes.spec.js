import { describe, expect, it } from 'vitest'
import { guardianRoutes } from '@/router/modules/guardians.routes'

describe('guardian redirect routes do not load standalone pages', () => {
  it('defines redirects without guardian page components', () => {
    expect(guardianRoutes.every((route) => typeof route.redirect === 'function')).toBe(true)
    expect(guardianRoutes.every((route) => route.component === undefined)).toBe(true)
    expect(guardianRoutes.every((route) => route.meta.sidebar === undefined)).toBe(true)
  })
})
