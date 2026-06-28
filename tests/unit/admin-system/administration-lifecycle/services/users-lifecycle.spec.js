import { describe, expect, it, vi } from 'vitest'
import { createUsersService } from '@/services/admin-system/users'

describe('users lifecycle service', () => {
  it('uses tenant headers for detail/update and omits status', async () => {
    const client = {
      get: vi.fn(() => ({ data: { data: { id: 'u1', full_name: 'A', roles: [] } } })),
      patch: vi.fn(() => ({ data: { data: { id: 'u1', full_name: 'A', roles: [] } } })),
    }
    const service = createUsersService(client, () => 'token')
    await service.getUser('u1', { schoolId: 'school1' })
    await service.updateUser('u1', { fullName: 'A', email: 'a@example.test', roleIds: ['r1'], status: 'inactive' }, { schoolId: 'school1' })
    expect(client.get.mock.calls[0][1].headers['X-School-Id']).toBe('school1')
    expect(client.patch.mock.calls[0][1]).toEqual({ full_name: 'A', email: 'a@example.test', role_ids: ['r1'] })
  })
})
