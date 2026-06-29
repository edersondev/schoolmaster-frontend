import { describe, expect, it, vi } from 'vitest'
import { createRolesService } from '@/services/admin-system/roles'

describe('roles lifecycle service', () => {
  it('updates role permissions without scope editing', async () => {
    const client = {
      get: vi.fn(() => ({ data: { data: { id: 'r1', name: 'Ops', permissions: [] } } })),
      patch: vi.fn(() => ({ data: { data: { id: 'r1', name: 'Ops', permissions: [] } } })),
    }
    const service = createRolesService(client)
    await service.getRole('r1', { schoolId: 'school1' })
    await service.updateRole('r1', { name: 'Ops', scope: 'platform', permissionIds: ['p1'] }, { schoolId: 'school1' })
    expect(client.patch.mock.calls[0][1]).toEqual({ name: 'Ops', permission_ids: ['p1'] })
    expect(client.patch.mock.calls[0][2].headers['X-School-Id']).toBe('school1')
  })
})
