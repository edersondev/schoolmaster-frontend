import { describe, expect, it, vi } from 'vitest'
import { createClassroomRosterService } from '@/services/admin-system/classroomRoster'
import { axiosResponse, classSection, paginated } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('class sections service', () => {
  it('uses academicPeriodId/status filters only for lists', async () => {
    const client = { get: vi.fn().mockResolvedValue(axiosResponse(paginated([classSection]))) }
    const service = createClassroomRosterService(client, () => null)
    await service.listClassSections({ academicPeriodId: 'p1', status: 'active', sort: 'name' })
    expect(client.get.mock.calls[0][1].params).toEqual({ academicPeriodId: 'p1', status: 'active' })
  })
})
