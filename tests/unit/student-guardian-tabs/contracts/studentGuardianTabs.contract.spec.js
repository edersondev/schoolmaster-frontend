import { describe, expect, it } from 'vitest'
import {
  createGuardianEntryDraft,
  GUARDIAN_ENTRY_MODES,
  mapGuardianEntriesRequest,
  validateGuardianEntries,
} from '@/contracts/admin-system/student-guardian-tabs'
import { mapStudentProfileCreateRequest } from '@/contracts/admin-system/student-profiles'

describe('student guardian tabs contract', () => {
  it('maps new and existing guardian entries to OpenAPI payload fields', () => {
    const entries = [
      createGuardianEntryDraft({
        mode: GUARDIAN_ENTRY_MODES.existing,
        guardianId: 'guardian-1',
        relationshipType: 'father',
      }),
      createGuardianEntryDraft({
        mode: GUARDIAN_ENTRY_MODES.new,
        fullName: 'Maria Silva',
        relationshipType: 'mother',
        contactEmail: 'maria@example.test',
      }),
    ]

    expect(mapGuardianEntriesRequest(entries)).toEqual([
      { relationship_type: 'father', guardian_id: 'guardian-1' },
      {
        relationship_type: 'mother',
        full_name: 'Maria Silva',
        contact_email: 'maria@example.test',
      },
    ])
    expect(
      mapStudentProfileCreateRequest({ guardianAssociations: entries }).guardian_associations,
    ).toHaveLength(2)
  })

  it('rejects third entries and duplicate guardian identities while allowing duplicate relationships', () => {
    const entries = [
      createGuardianEntryDraft({ fullName: 'One', relationshipType: 'parent' }),
      createGuardianEntryDraft({ fullName: 'Two', relationshipType: 'parent' }),
      createGuardianEntryDraft({ fullName: 'Two', relationshipType: 'aunt' }),
    ]

    const errors = validateGuardianEntries(entries)
    expect(errors.guardian_associations).toBeTruthy()
    expect(errors['guardian_associations.2.full_name']).toBeTruthy()
    expect(errors['guardian_associations.1.relationship_type']).toBeUndefined()
  })
})
