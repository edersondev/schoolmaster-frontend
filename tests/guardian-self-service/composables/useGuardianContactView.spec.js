import { describe, expect, it, vi } from 'vitest'
import { useGuardianContactView } from '@/composables/guardian/useGuardianContactView'
import { activeGuardianContext } from '../test-utils'

describe('useGuardianContactView', () => {
  it('loads contact view and reports safe missing values', async () => {
    const service = {
      getGuardianStudentContacts: vi.fn().mockResolvedValue({
        guardianContact: { name: 'Guardian One', email: null, phone: null },
        studentPrimaryContact: { name: 'Office', email: null, phone: '555' },
      }),
    }
    const contact = useGuardianContactView({
      route: { params: { studentProfileId: 'student-1' } },
      context: activeGuardianContext,
      service,
    })
    await contact.load()
    expect(contact.hasMissingValues.value).toBe(true)
  })
})
