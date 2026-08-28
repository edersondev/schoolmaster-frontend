import { describe, expect, it, vi } from 'vitest'
import { createGuardiansService } from '@/services/admin-system/guardians'
import { createAdminClient } from '../administration.fixtures'

describe('guardians service', () => {
  it('maps only approved Guardian list filters', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({
        data: { data: [], meta: { page: 1, per_page: 25, total: 0 } },
      }),
    })

    await createGuardiansService(client).listGuardians(
      {
        page: 1,
        perPage: 25,
        fullName: 'Maria',
        contactEmail: 'guardian@example',
        status: 'active',
      },
      { schoolId: 'school-1' },
    )

    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/guardians',
      expect.objectContaining({
        params: {
          page: 1,
          per_page: 25,
          full_name: 'Maria',
          contact_email: 'guardian@example',
          status: 'active',
        },
      }),
    )
  })

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
