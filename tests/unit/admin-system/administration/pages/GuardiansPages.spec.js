import { describe, expect, it } from 'vitest'
import { guardianRoutes } from '@/router/modules/guardians.routes'

describe('guardian page flows', () => {
  it('keeps student lookup permission outside guardian route requirement', () => {
    expect(
      guardianRoutes.find((route) => route.name === 'guardianCreate').meta.permissions,
    ).toEqual(['guardians.view', 'guardians.manage'])
  })
})
