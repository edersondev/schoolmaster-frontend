import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('school address service', () => {
  it('submits structured address create and explicit null update payloads', async () => {
    const client = createAdminClient({
      post: vi.fn().mockResolvedValue({ data: { data: paginatedEnvelope.data[0] } }),
      patch: vi.fn().mockResolvedValue({ data: { data: paginatedEnvelope.data[0] } }),
    })
    const service = createSchoolsService(client, () => 'test-token')

    await service.createSchool({
      name: 'Northfield',
      code: 'NORTH',
      address: {
        street: 'Main Street',
        number: '123',
        neighborhood: 'Central',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '12345678',
      },
    })
    await service.updateSchool('school-1', { removeAddress: true })

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/schools',
      expect.objectContaining({
        address: expect.objectContaining({ zip_code: '12345678' }),
      }),
      expect.any(Object),
    )
    expect(client.patch).toHaveBeenCalledWith(
      '/api/v1/schools/school-1',
      { address: null },
      expect.any(Object),
    )
  })
})
