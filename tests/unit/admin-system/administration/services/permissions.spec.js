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

  it('loads every API page into one non-paginated permission result', async () => {
    const permission = (id) => ({
      id,
      code: `permission.${id}`,
      name: `Permission ${id}`,
      scope: 'school',
      status: 'active',
    })
    const client = createAdminClient({
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            data: [permission('one')],
            meta: { page: 1, per_page: 1, total: 2 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: [permission('two')],
            meta: { page: 2, per_page: 1, total: 2 },
          },
        }),
    })
    const service = createPermissionsService(client)

    const result = await service.listAllPermissions({ perPage: 1 })

    expect(client.get).toHaveBeenCalledTimes(2)
    expect(client.get.mock.calls.map(([, config]) => config.params)).toEqual([
      { page: 1, per_page: 1 },
      { page: 2, per_page: 1 },
    ])
    expect(result.items.map((item) => item.id)).toEqual(['one', 'two'])
    expect(result.meta).toEqual({ page: 1, perPage: 2, total: 2 })
  })
})
