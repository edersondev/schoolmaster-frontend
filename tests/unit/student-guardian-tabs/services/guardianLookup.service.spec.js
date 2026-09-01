import { describe, expect, it, vi } from 'vitest'
import { createGuardiansService } from '@/services/admin-system/guardians'

describe('guardian lookup service', () => {
  it('uses active same-school list filters', async () => {
    const client = {
      get: vi
        .fn()
        .mockResolvedValue({ data: { data: [], meta: { page: 1, per_page: 10, total: 0 } } }),
    }

    await createGuardiansService(client).lookupActiveGuardians(
      { search: 'Maria', perPage: 10 },
      { schoolId: 'school-1' },
    )

    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/guardians',
      expect.objectContaining({
        params: { per_page: 10, status: 'active', search: 'Maria' },
        headers: expect.objectContaining({ 'X-School-Id': 'school-1' }),
      }),
    )
  })
})
