import { describe, expect, it, vi } from 'vitest'
import { createRolesService } from '@/services/admin-system/roles'
import { createAdminClient, schoolId } from '../administration.fixtures'

describe('roles service', () => {
  it('forces school scope and sends tenant header', async () => {
    const client = createAdminClient({
      post: vi.fn().mockResolvedValue({ data: { data: { id: '1', permissions: [] } } }),
    })
    await createRolesService(client).createRole(
      { name: 'Admin', permissionIds: ['p'] },
      { schoolId },
    )
    expect(client.post.mock.calls[0][1]).toEqual({
      scope: 'school',
      name: 'Admin',
      permission_ids: ['p'],
    })
    expect(client.post.mock.calls[0][2].headers).toEqual({ 'X-School-Id': schoolId })
  })
})
