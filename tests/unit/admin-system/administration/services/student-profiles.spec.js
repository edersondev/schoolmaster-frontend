import { describe, expect, it, vi } from 'vitest'
import { createStudentProfilesService } from '@/services/admin-system/student-profiles'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('student profile lookup service', () => {
  it('always sends active status plus approved remote params', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
    })
    await createStudentProfilesService(client).listStudentProfiles({
      search: 'sam',
      page: 2,
      perPage: 10,
    })
    expect(client.get.mock.calls[0][1].params).toEqual({
      page: 2,
      per_page: 10,
      status: 'active',
      search: 'sam',
    })
  })
})
