import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('schools list identity filters service', () => {
  it('serializes documented identity, contact, and location filter names only', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
    })
    const service = createSchoolsService(client, () => 'test-token')

    await service.listSchools({
      page: 3,
      perPage: 50,
      status: '1',
      inepCode: '35000001',
      document: '56563930000108',
      cnpj: 'should-not-submit',
      name: 'Sao',
      email: 'office',
      city: 'Sao Paulo',
      state: 'SP',
    })

    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/schools',
      expect.objectContaining({
        params: {
          page: 3,
          per_page: 50,
          status: '1',
          inep_code: '35000001',
          document: '56563930000108',
          name: 'Sao',
          email: 'office',
          city: 'Sao Paulo',
          state: 'SP',
        },
      }),
    )
    expect(client.get.mock.calls[0][1].params).not.toHaveProperty('cnpj')
  })
})
