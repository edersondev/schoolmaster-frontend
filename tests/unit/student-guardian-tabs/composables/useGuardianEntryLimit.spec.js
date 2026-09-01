import { describe, expect, it } from 'vitest'
import {
  createGuardianEntryDraft,
  validateGuardianEntries,
} from '@/contracts/admin-system/student-guardian-tabs'

describe('guardian entry limits', () => {
  it('allows zero to two entries and rejects a third', () => {
    expect(validateGuardianEntries([])).toEqual({})

    const two = [
      createGuardianEntryDraft({ fullName: 'One', relationshipType: 'parent' }),
      createGuardianEntryDraft({ fullName: 'Two', relationshipType: 'parent' }),
    ]
    expect(validateGuardianEntries(two)).toEqual({})

    expect(
      validateGuardianEntries([
        ...two,
        createGuardianEntryDraft({ fullName: 'Three', relationshipType: 'parent' }),
      ]).guardian_associations,
    ).toBeTruthy()
  })
})
