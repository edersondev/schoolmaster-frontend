import { describe, expect, it } from 'vitest'
import { administrationRoutes } from '@/router/modules/administration.routes'

describe('detail lifecycle actions', () => {
  it('keeps lifecycle-capable detail routes registered separately from edit routes', () => {
    expect(administrationRoutes.find((route) => route.name === 'userDetail').meta.mode).toBe('detail')
    expect(administrationRoutes.find((route) => route.name === 'userEdit').meta.mode).toBe('edit')
  })
})
