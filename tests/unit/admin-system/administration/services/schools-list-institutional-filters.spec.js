import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('schools list institutional filters service', () => {
  it('serializes single-value institutional filter IDs', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
    })
    const service = createSchoolsService(client, () => 'test-token')

    await service.listSchools({
      administrativeTypeId: '1',
      legalNatureId: '2',
      managementTypeId: '3',
      pedagogicalApproachId: '4',
    })

    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/schools',
      expect.objectContaining({
        params: {
          administrative_type_id: '1',
          legal_nature_id: '2',
          management_type_id: '3',
          pedagogical_approach_id: '4',
        },
      }),
    )
  })
})
