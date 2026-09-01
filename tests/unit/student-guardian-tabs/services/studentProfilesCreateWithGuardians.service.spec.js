import { describe, expect, it, vi } from 'vitest'
import { createStudentProfilesAdminService } from '@/services/admin-system/studentProfiles'

describe('student create service with guardians', () => {
  it('submits guardians through createStudentProfile only', async () => {
    const client = {
      post: vi.fn().mockResolvedValue({
        data: {
          data: {
            id: 'student-1',
            first_name: 'Ana',
            last_name: 'Silva',
            guardian_associations: [
              {
                id: 'guardian-1',
                full_name: 'Maria',
                relationship_type: 'mother',
                status: 'active',
              },
            ],
          },
        },
      }),
    }
    const service = createStudentProfilesAdminService(client, () => 'token')

    const result = await service.createStudentProfile(
      {
        registrationNumber: 'R1',
        firstName: 'Ana',
        lastName: 'Silva',
        enrolledAt: '2026-01-01',
        guardianAssociations: [{ relationshipType: 'mother', fullName: 'Maria' }],
      },
      { schoolId: 'school-1' },
    )

    expect(client.post).toHaveBeenCalledTimes(1)
    expect(client.post.mock.calls[0][0]).toBe('/api/v1/student-profiles')
    expect(client.post.mock.calls[0][1].guardian_associations).toEqual([
      { relationship_type: 'mother', full_name: 'Maria' },
    ])
    expect(result.guardianAssociations[0].relationshipType).toBe('mother')
  })
})
