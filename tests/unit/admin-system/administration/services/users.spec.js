import { describe, expect, it, vi } from 'vitest'
import { createUsersService } from '@/services/admin-system/users'
import { createAdminClient, paginatedEnvelope, schoolId } from '../administration.fixtures'

describe('users service', () => {
  it('sends tenant header, approved query, role-only payload', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
      post: vi.fn().mockResolvedValue({ data: { data: { id: '1', roles: [] } } }),
    })
    const service = createUsersService(client)
    await service.listUsers({ page: 1, perPage: 25 }, { schoolId })
    expect(client.get.mock.calls[0][1].headers).toEqual({ 'X-School-Id': schoolId })
    await service.createUser({ fullName: 'A', email: 'a@b.test', roleIds: ['r'] }, { schoolId })
    expect(client.post.mock.calls[0][1]).toEqual({
      full_name: 'A',
      email: 'a@b.test',
      role_ids: ['r'],
    })
  })
})
