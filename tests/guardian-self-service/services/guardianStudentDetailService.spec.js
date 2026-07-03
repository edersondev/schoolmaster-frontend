import { describe, expect, it, vi } from 'vitest'
import { mapGuardianStudentDetail } from '@/contracts/guardian/guardianSelfServiceMappers'
import { createGuardianSelfServiceService } from '@/services/guardian/guardianSelfServiceService'
import { guardianStudentDetailRecord } from '../test-utils'

describe('guardian student detail service', () => {
  it('maps limited profile and enrollment summary only', () => {
    const mapped = mapGuardianStudentDetail(guardianStudentDetailRecord)
    expect(mapped).toMatchObject({
      id: 'student-1',
      fullName: 'Ada Student',
      enrollmentSummary: expect.objectContaining({ gradeLevel: '7' }),
    })
    expect(mapped.droppedFields).toContain('other_guardians')
    expect(mapped.enrollmentSummary.droppedFields).toContain('school_only_notes')
  })

  it('normalizes target-specific not found without exposing identifiers', async () => {
    const client = {
      get: vi.fn().mockRejectedValue({
        response: { status: 404, data: { error: { code: 'NOT_FOUND', message: 'student secret' } } },
      }),
    }
    const service = createGuardianSelfServiceService({ client, getAccessToken: () => null })
    await expect(
      service.getGuardianStudent({ studentProfileId: 'student-secret' }, { schoolId: 'school-1' }),
    ).rejects.toMatchObject({ type: 'not-found' })
  })
})
