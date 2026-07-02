import { describe, expect, it, vi } from 'vitest'
import { mapGuardianStudentSummary } from '@/contracts/guardian/guardianSelfServiceMappers'
import { createGuardianSelfServiceService } from '@/services/guardian/guardianSelfServiceService'
import { guardianStudentRecord, paginated } from '../test-utils'

describe('guardian linked students service', () => {
  it('maps list fields and drops restricted data', () => {
    const mapped = mapGuardianStudentSummary(guardianStudentRecord)
    expect(mapped).toMatchObject({
      id: 'student-1',
      schoolId: 'school-1',
      fullName: 'Ada Student',
      relationshipLabel: 'Mother',
    })
    expect(mapped.droppedFields).toContain('private_notes')
  })

  it('sends only tenant and pagination params', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([guardianStudentRecord]) }) }
    const service = createGuardianSelfServiceService({ client, getAccessToken: () => 'token' })
    await service.listGuardianStudents(
      { page: 2, perPage: 10, studentProfileId: 'blocked', sort: 'blocked' },
      { schoolId: 'school-1' },
    )
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/guardian/students',
      expect.objectContaining({
        params: { page: 2, per_page: 10 },
        headers: expect.objectContaining({ 'X-School-Id': 'school-1' }),
      }),
    )
  })
})
