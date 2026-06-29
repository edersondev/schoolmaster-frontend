import { describe, expect, it, vi } from 'vitest'
import { createGuardiansService } from '@/services/admin-system/guardians'

describe('guardians lifecycle service', () => {
  it('updates guardian contact fields without user-link workflow fields', async () => {
    const client = {
      get: vi.fn(() => ({ data: { data: { id: 'g1', full_name: 'Jordan' } } })),
      patch: vi.fn(() => ({ data: { data: { id: 'g1', full_name: 'Jordan' } } })),
    }
    const service = createGuardiansService(client)
    await service.updateGuardian('g1', { fullName: 'Jordan', relationshipType: 'parent', userLinkId: 'blocked' }, { schoolId: 'school1' })
    expect(client.patch.mock.calls[0][1]).toEqual({ full_name: 'Jordan', relationship_type: 'parent' })
  })
})
