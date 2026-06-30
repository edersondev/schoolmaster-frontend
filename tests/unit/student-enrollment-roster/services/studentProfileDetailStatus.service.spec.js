import { describe, expect, it, vi } from 'vitest'
import { createStudentProfilesAdminService } from '@/services/admin-system/studentProfiles'
import { axiosResponse, studentProfile } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student profile detail/status service', () => {
  it('has no general update call and maps status result', async () => {
    const client = {
      get: vi.fn().mockResolvedValue(axiosResponse({ data: studentProfile })),
      patch: vi.fn().mockResolvedValue(axiosResponse({ data: { student_profile: { ...studentProfile, status: 'inactive' } } })),
    }
    const service = createStudentProfilesAdminService(client, () => null)
    expect(service.updateStudentProfile).toBeUndefined()
    expect((await service.getStudentProfile('student-1')).id).toBe('student-1')
    expect((await service.updateStudentProfileStatus('student-1', { status: 'inactive', effectiveAt: '2026-02-01', reason: 'x' })).studentProfile.status).toBe('inactive')
  })
})
