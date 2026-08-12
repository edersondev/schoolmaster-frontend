import { describe, expect, it } from 'vitest'
import { resolveUserLookupMode } from '@/contracts/admin-system/user-lookup'

const school = { id: 'school-1', status: 'active' }
const schoolPermission = [{ code: 'users.view', scope: 'school', status: 'active' }]
const platformPermission = [{ code: 'schools.view', scope: 'platform', status: 'active' }]

describe('user lookup mode contract', () => {
  it('selects exact active school by default and platform only when explicitly authorized', () => {
    expect(resolveUserLookupMode({ activeSchool: school, permissions: schoolPermission })).toEqual({
      scope: 'school',
      schoolId: 'school-1',
    })
    expect(resolveUserLookupMode({ permissions: platformPermission })).toEqual({
      scope: 'platform',
      schoolId: null,
    })
  })

  it('fails closed for invalid explicit intent without fallback', () => {
    expect(
      resolveUserLookupMode({
        requestedMode: 'platform',
        activeSchool: school,
        permissions: schoolPermission,
      }),
    ).toBeNull()
    expect(
      resolveUserLookupMode({
        requestedMode: 'school',
        permissions: platformPermission,
      }),
    ).toBeNull()
  })

  it('accepts both modes for exact active System Administrator role', () => {
    const roles = [{ name: 'System Administrator', scope: 'platform', status: 'active' }]
    expect(
      resolveUserLookupMode({ requestedMode: 'platform', activeSchool: school, roles }),
    ).toEqual({
      scope: 'platform',
      schoolId: null,
    })
    expect(resolveUserLookupMode({ requestedMode: 'school', activeSchool: school, roles })).toEqual(
      {
        scope: 'school',
        schoolId: 'school-1',
      },
    )
  })
})
