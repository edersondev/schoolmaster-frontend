import { describe, expect, it, vi } from 'vitest'
import { createStudentProfilesAdminService } from '@/services/admin-system/studentProfiles'
import { axiosResponse, paginated, studentProfile } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student profiles list service', () => {
  it('sends approved list params and school header', async () => {
    const client = { get: vi.fn().mockResolvedValue(axiosResponse(paginated([studentProfile]))) }
    const service = createStudentProfilesAdminService(client, () => 'token')
    const result = await service.listStudentProfiles({ page: 2, perPage: 10, status: 'active', search: 'ana', sort: '-created_at' }, { schoolId: 'school-1' })
    expect(client.get).toHaveBeenCalledWith('/api/v1/student-profiles', expect.objectContaining({ params: { page: 2, per_page: 10, status: 'active', search: 'ana', sort: '-created_at' } }))
    expect(result.items[0].id).toBe('student-1')
  })
})
