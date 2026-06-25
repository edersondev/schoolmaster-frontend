import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('schools service', () => {
  it('uses approved params and payload', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
      post: vi.fn().mockResolvedValue({ data: { data: paginatedEnvelope.data[0] } }),
    })
    const service = createSchoolsService(client, () => 'test-token')
    await service.listSchools({ page: 1, perPage: 25, status: 'active' })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/schools',
      expect.objectContaining({
        params: { page: 1, per_page: 25, status: 'active' },
        headers: { Authorization: 'Bearer test-token' },
      }),
    )
    await service.createSchool({ name: 'N', code: 'N' })
    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/schools',
      { name: 'N', code: 'N' },
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
    )
  })
})
