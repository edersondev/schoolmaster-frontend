import { describe, expect, it, vi } from 'vitest'
import { createStudentProfilesAdminService } from '@/services/admin-system/studentProfiles'
import { axiosResponse, studentProfile } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student transfer service', () => {
  it('sends required transfer fields only', async () => {
    const client = { post: vi.fn().mockResolvedValue(axiosResponse({ data: { student_profile: { ...studentProfile, status: 'transferred' } } })) }
    const service = createStudentProfilesAdminService(client, () => null)
    await service.transferStudentProfile('student-1', { effectiveAt: '2026-03-01', reason: 'move', privateGrades: ['A'] })
    expect(client.post.mock.calls[0][1]).toEqual({ effective_at: '2026-03-01', reason: 'move' })
  })
})
