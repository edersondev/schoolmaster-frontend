import { describe, expect, it, vi } from 'vitest'
import { createUsersService } from '@/services/admin-system/users'
import { createAdminClient, paginatedEnvelope, schoolId } from '../administration.fixtures'

describe('users service', () => {
  it('sends tenant header, approved query, role-only payload', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
      post: vi.fn().mockResolvedValue({ data: { data: { id: '1', roles: [] } } }),
    })
    const service = createUsersService(client, () => 'test-token')
    await service.listUsers({ page: 1, perPage: 25 }, { schoolId })
    expect(client.get.mock.calls[0][1].headers).toEqual({
      Authorization: 'Bearer test-token',
      'X-School-Id': schoolId,
    })
    await service.createUser(
      { fullName: 'A', email: 'a@b.test', roleIds: ['r'], accountSetupMode: 'active' },
      { schoolId },
    )
    expect(client.post.mock.calls[0][1]).toEqual({
      full_name: 'A',
      email: 'a@b.test',
      role_ids: ['r'],
      account_setup_mode: 'invitation',
    })
  })

  it('gets, updates, and soft-deletes tenant users', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: { data: { id: '1', roles: [] } } }),
      patch: vi.fn().mockResolvedValue({ data: { data: { id: '1', roles: [] } } }),
      delete: vi.fn().mockResolvedValue({ data: { status: 'deleted' } }),
    })
    const service = createUsersService(client, () => 'test-token')

    await service.getUser('1', { schoolId })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/users/1',
      expect.objectContaining({
        params: {},
        headers: { Authorization: 'Bearer test-token', 'X-School-Id': schoolId },
      }),
    )

    await service.updateUser(
      '1',
      {
        fullName: 'A',
        email: 'a@b.test',
        status: 'inactive',
        roleIds: ['r'],
      },
      { schoolId },
    )
    expect(client.patch).toHaveBeenCalledWith(
      '/api/v1/users/1',
      {
        full_name: 'A',
        email: 'a@b.test',
        role_ids: ['r'],
      },
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token', 'X-School-Id': schoolId },
      }),
    )

    await service.deleteUser('1', { effectiveAt: '2026-06-27', reason: 'Left' }, { schoolId })
    expect(client.delete).toHaveBeenCalledWith(
      '/api/v1/users/1',
      expect.objectContaining({
        params: {},
        headers: { Authorization: 'Bearer test-token', 'X-School-Id': schoolId },
        data: { effective_at: '2026-06-27', reason: 'Left' },
      }),
    )
  })

  it('restores a tenant user with the published path, body, and school header', async () => {
    const client = createAdminClient({
      post: vi.fn().mockResolvedValue({
        data: { data: { resource_type: 'users', action: 'restore', affected_ids: ['1'] } },
      }),
    })
    const service = createUsersService(client, () => 'test-token')

    await service.restoreUser(
      '1',
      { effectiveAt: '2026-06-27', reason: 'Approved recovery' },
      { schoolId },
    )

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/users/1/restore',
      { effective_at: '2026-06-27', reason: 'Approved recovery' },
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token', 'X-School-Id': schoolId },
      }),
    )
  })
})
