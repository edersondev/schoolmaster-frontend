import { describe, expect, it, vi } from 'vitest'
import { createPermissionsService } from '@/services/admin-system/permissions'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('permissions service', () => {
  it('exports read-only list behavior', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
    })
    const service = createPermissionsService(client)
    expect(service.createPermission).toBeUndefined()
    await service.listPermissions({ page: 1, perPage: 25, status: 'active' })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/permissions',
      expect.objectContaining({
        params: { page: 1, per_page: 25 },
      }),
    )
  })
})
