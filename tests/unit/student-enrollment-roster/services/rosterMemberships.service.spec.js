import { describe, expect, it, vi } from 'vitest'
import { createClassroomRosterService } from '@/services/admin-system/classroomRoster'
import { axiosResponse, rosterMembership } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('roster memberships service', () => {
  it('maps all-or-nothing batch add/end payloads', async () => {
    const client = {
      post: vi.fn().mockResolvedValue(axiosResponse({ data: { memberships: [rosterMembership] } })),
      patch: vi.fn().mockResolvedValue(axiosResponse({ data: { memberships: [rosterMembership] } })),
    }
    const service = createClassroomRosterService(client, () => null)
    await service.batchAddClassSectionMemberships('section-1', { academicPeriodId: 'p1', effectiveStartDate: '2026-01-01', studentProfileIds: ['s1', 's1'] })
    await service.batchEndClassSectionMemberships('section-1', { effectiveEndDate: '2026-02-01', reason: 'end', rosterMembershipIds: ['m1'] })
    expect(client.post.mock.calls[0][1].student_profile_ids).toEqual(['s1'])
    expect(client.patch.mock.calls[0][1].roster_membership_ids).toEqual(['m1'])
  })
})
