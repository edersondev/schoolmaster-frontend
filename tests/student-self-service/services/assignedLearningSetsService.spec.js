import { describe, expect, it, vi } from 'vitest'
import { mapStudentLearningSet } from '@/contracts/student/studentSelfServiceMappers'
import { createStudentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { learningSetRecord, paginated } from '../test-utils'

describe('student assigned learning set service', () => {
  it('maps timeline fields and drops undocumented private fields', () => {
    const mapped = mapStudentLearningSet(learningSetRecord)
    expect(mapped).toMatchObject({
      id: 'set-1',
      academicPeriodId: 'period-1',
      title: 'Algebra set',
      status: 'published',
      entries: expect.arrayContaining([
        expect.objectContaining({ entryType: 'questionnaire', readOnly: true }),
        expect.objectContaining({ contentItem: expect.objectContaining({ downloadAvailable: true }) }),
      ]),
    })
    expect(mapped.droppedFields).toContain('private_path')
    expect(mapped.entries[0].contentItem.droppedFields).toContain('storage_key')
  })

  it('sends only tenant, academic period, and pagination params', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([learningSetRecord]) }) }
    const service = createStudentSelfServiceService({ client, getAccessToken: () => 'token' })
    await service.listAssignedLearningSets(
      { academicPeriodId: 'period-1', page: 2, perPage: 10, studentProfileId: 'blocked' },
      { schoolId: 'school-1' },
    )
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/student/learning-sets',
      expect.objectContaining({
        params: { academic_period_id: 'period-1', page: 2, per_page: 10 },
        headers: expect.objectContaining({ 'X-School-Id': 'school-1' }),
      }),
    )
  })
})
