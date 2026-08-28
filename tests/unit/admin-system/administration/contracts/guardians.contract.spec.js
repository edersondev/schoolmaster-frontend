import { describe, expect, it } from 'vitest'
import {
  createGuardianForm,
  mapGuardianCreateRequest,
  mapGuardianUpdateRequest,
  mapStudentProfileOption,
  validateGuardianForm,
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

  it('submits Guardian phone values as at most 11 digits', () => {
    const form = {
      ...createGuardianForm(),
      fullName: 'Pat',
      relationshipType: 'parent',
      contactPhone: '(11) 98765-4321',
    }

    expect(mapGuardianCreateRequest(form).contact_phone).toBe('11987654321')
    expect(mapGuardianUpdateRequest(form).contact_phone).toBe('11987654321')
  })

  it('validates required guardian fields and optional email format', () => {
    expect(validateGuardianForm(createGuardianForm())).toEqual({
      full_name: ['Full name is required.'],
      relationship_type: ['Relationship is required.'],
    })
    expect(
      validateGuardianForm({
        ...createGuardianForm(),
        fullName: 'Pat',
        relationshipType: 'parent',
        contactEmail: 'invalid',
      }),
    ).toEqual({
      contact_email: ['Enter a valid email address.'],
    })
  })
})
