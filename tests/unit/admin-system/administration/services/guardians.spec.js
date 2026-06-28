import { describe, expect, it, vi } from 'vitest'
import { createGuardiansService } from '@/services/admin-system/guardians'
import { createAdminClient } from '../administration.fixtures'

describe('guardians service', () => {
  it('maps association UUIDs in one create request', async () => {
    const client = createAdminClient({
      post: vi.fn().mockResolvedValue({ data: { data: { id: '1' } } }),
    })
    await createGuardiansService(client).createGuardian({
      fullName: 'Pat',
      relationshipType: 'parent',
      studentProfileIds: ['student'],
    })
    expect(client.post.mock.calls[0][1].student_profile_ids).toEqual(['student'])
  })
})
