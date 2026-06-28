import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('schools service', () => {
  it('uses approved params and payload', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
      post: vi.fn().mockResolvedValue({ data: { data: paginatedEnvelope.data[0] } }),
      patch: vi.fn().mockResolvedValue({ data: { data: paginatedEnvelope.data[0] } }),
      delete: vi.fn().mockResolvedValue({ data: { data: { status: 'deleted' } } }),
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
    await service.getSchool('school-id')
    expect(client.get).toHaveBeenCalledWith('/api/v1/schools/school-id', {
      headers: { Authorization: 'Bearer test-token' },
    })
    await service.createSchool({ name: 'N', code: 'N' })
    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/schools',
      { name: 'N', code: 'N' },
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
    )
    await service.updateSchool('school-id', { removeAddress: true })
    expect(client.patch).toHaveBeenCalledWith(
      '/api/v1/schools/school-id',
      { address: null },
      expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }),
    )
    await service.deleteSchool('school-id', { effectiveAt: '2026-06-27', reason: 'Duplicate' })
    expect(client.delete).toHaveBeenCalledWith(
      '/api/v1/schools/school-id',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
        data: { effective_at: '2026-06-27', reason: 'Duplicate' },
      }),
    )
  })
})
