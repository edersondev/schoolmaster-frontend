import { describe, expect, it } from 'vitest'
import {
  createGuardianEntryDraft,
  validateGuardianEntries,
} from '@/contracts/admin-system/student-guardian-tabs'

describe('student guardian limit flow', () => {
  it('keeps two valid guardians accepted and rejects invalid second entry without partial-success state', () => {
    const valid = [
      createGuardianEntryDraft({ relationshipType: 'parent', fullName: 'Guardian One' }),
      createGuardianEntryDraft({ relationshipType: 'parent', fullName: 'Guardian Two' }),
    ]
    expect(validateGuardianEntries(valid)).toEqual({})

    const invalid = [...valid]
    invalid[1] = { ...invalid[1], fullName: '' }
    expect(validateGuardianEntries(invalid)['guardian_associations.1.full_name']).toBeTruthy()
  })
})
