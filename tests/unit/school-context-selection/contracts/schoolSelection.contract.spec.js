import { describe, expect, it } from 'vitest'
import { mapSchool } from '@/contracts/admin-system/schools'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { schoolFixture } from '../fixtures/schoolContextSelection.fixtures'

describe('school selection contracts', () => {
  it.each([
    [1, 'active'],
    ['1', 'active'],
    [0, 'inactive'],
    ['0', 'inactive'],
  ])('normalizes school status %s to %s', (status, expected) => {
    expect(mapSchool(schoolFixture({ status })).status).toBe(expected)
  })

  it('maps selector identity and location fields', () => {
    expect(mapSchool(schoolFixture())).toMatchObject({
      name: 'Central School',
      inepCode: '12345678',
      city: 'Recife',
      state: 'PE',
    })
  })

  it('maps the current-session resolved school with numeric status', () => {
    const session = mapAuthSession({ roles: [], permissions: [], resolved_school: schoolFixture() })

    expect(session.activeSchool).toMatchObject({
      id: 'school-001',
      status: 'active',
      inepCode: '12345678',
      city: 'Recife',
      state: 'PE',
    })
  })
})
