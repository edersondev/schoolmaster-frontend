import { describe, expect, it, vi } from 'vitest'
import { mapGuardianContactView } from '@/contracts/guardian/guardianSelfServiceMappers'
import { createGuardianSelfServiceService } from '@/services/guardian/guardianSelfServiceService'
import { contactViewRecord } from '../test-utils'

describe('guardian contact view service', () => {
  it('maps guardian-owned and primary contact fields only', () => {
    const mapped = mapGuardianContactView(contactViewRecord)
    expect(mapped).toMatchObject({
      relationshipLabel: 'Mother',
      guardianContact: expect.objectContaining({ email: 'guardian@example.test' }),
      studentPrimaryContact: expect.objectContaining({ phone: '555-0100' }),
    })
    expect(mapped.droppedFields).toContain('other_guardians')
    expect(mapped.guardianContact.droppedFields).toContain('school_only_notes')
    expect(mapped.studentPrimaryContact.droppedFields).toContain('non_primary_contacts')
  })

  it('calls contact endpoint without write or edit params', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: { data: contactViewRecord } }) }
    const service = createGuardianSelfServiceService({ client, getAccessToken: () => null })
    await service.getGuardianStudentContacts({ studentProfileId: 'student-1' }, { schoolId: 'school-1' })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/guardian/students/student-1/contacts',
      expect.objectContaining({ params: {} }),
    )
  })
})
