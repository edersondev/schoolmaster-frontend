import { describe, expect, it, vi } from 'vitest'
import { createRolesService } from '@/services/admin-system/roles'

describe('role single lifecycle service', () => {
  it('normalizes role lifecycle outcome', async () => {
    const client = { post: vi.fn(() => ({ data: { data: { resource_id: 'r1', status: 'inactive' } } })) }
    const result = await createRolesService(client).deactivateRole('r1', { effectiveAt: '2026-06-28', reason: 'Dependency reviewed' }, { schoolId: 'school1' })
    expect(result).toMatchObject({ resourceId: 'r1', status: 'inactive' })
  })
})
