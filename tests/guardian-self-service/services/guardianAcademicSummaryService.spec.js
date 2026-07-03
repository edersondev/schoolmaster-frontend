import { describe, expect, it, vi } from 'vitest'
import { mapGuardianAcademicSummary } from '@/contracts/guardian/guardianSelfServiceMappers'
import { createGuardianSelfServiceService } from '@/services/guardian/guardianSelfServiceService'
import { academicSummaryRecord } from '../test-utils'

describe('guardian academic summary service', () => {
  it('maps summary-only academic fields and drops restricted rows', () => {
    const mapped = mapGuardianAcademicSummary(academicSummaryRecord)
    expect(mapped).toMatchObject({
      academicPeriodId: 'period-1',
      gradeSummary: expect.objectContaining({ average: 92 }),
      attendanceSummary: expect.objectContaining({ attendanceRate: 98 }),
      learningSets: [expect.objectContaining({ title: 'Algebra' })],
    })
    expect(mapped.gradeSummary.droppedFields).toContain('correction_details')
    expect(mapped.learningSets[0].droppedFields).toContain('teacher_private_note')
  })

  it('sends current academic period only as documented param', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: { data: academicSummaryRecord } }) }
    const service = createGuardianSelfServiceService({ client, getAccessToken: () => null })
    await service.getGuardianStudentAcademics(
      { studentProfileId: 'student-1', academicPeriodId: 'period-1', periodPicker: 'blocked' },
      { schoolId: 'school-1' },
    )
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/guardian/students/student-1/academics',
      expect.objectContaining({ params: { academic_period_id: 'period-1' } }),
    )
  })
})
