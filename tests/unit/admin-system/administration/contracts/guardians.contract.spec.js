import { describe, expect, it } from 'vitest'
import {
  createGuardianForm,
  mapGuardianCreateRequest,
  mapStudentProfileOption,
} from '@/contracts/admin-system/guardians'

describe('guardian contracts', () => {
  it('maps optional UUID associations and lookup labels', () => {
    expect(
      mapGuardianCreateRequest({
        ...createGuardianForm(),
        fullName: 'Pat',
        relationshipType: 'parent',
        studentProfileIds: ['uuid'],
      }).student_profile_ids,
    ).toEqual(['uuid'])
    expect(
      mapStudentProfileOption({ full_name: 'Sam', registration_number: 'R1' }).label,
    ).toContain('R1')
  })
})
