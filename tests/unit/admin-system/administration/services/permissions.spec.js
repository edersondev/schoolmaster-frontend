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
    await service.listPermissions({ page: 1, perPage: 25 })
    expect(client.get).toHaveBeenCalledOnce()
  })
})
