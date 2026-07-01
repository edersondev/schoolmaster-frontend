import { describe, expect, it, vi } from 'vitest'
import { createTeacherAssignmentsService } from '@/services/admin-system/teacherAssignments'
import { axiosResponse, paginated, teacherAssignment } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('teacher assignments service', () => {
  it('does not send classSectionId filter on list', async () => {
    const client = { get: vi.fn().mockResolvedValue(axiosResponse(paginated([teacherAssignment]))) }
    const service = createTeacherAssignmentsService(client, () => null)
    await service.listTeacherAssignments({ academicPeriodId: 'p1', status: 'active', classSectionId: 'blocked' })
    expect(client.get.mock.calls[0][1].params).toEqual({ academicPeriodId: 'p1', status: 'active' })
  })
})
