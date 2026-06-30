import { describe, expect, it, vi } from 'vitest'
import { createStudentProfilesAdminService } from '@/services/admin-system/studentProfiles'
import { axiosResponse, studentProfile } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student profile create service', () => {
  it('projects create payload and maps result', async () => {
    const client = { post: vi.fn().mockResolvedValue(axiosResponse({ data: studentProfile })) }
    const service = createStudentProfilesAdminService(client, () => null)
    const result = await service.createStudentProfile({ registrationNumber: 'R1', firstName: 'Ana', lastName: 'Silva', enrolledAt: '2026-01-01', ignored: 'x' })
    expect(client.post.mock.calls[0][1]).not.toHaveProperty('ignored')
    expect(result.fullName).toBe('Ana Silva')
  })
})
