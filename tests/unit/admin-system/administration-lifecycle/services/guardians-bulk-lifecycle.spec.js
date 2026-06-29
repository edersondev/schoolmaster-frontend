import { describe, expect, it, vi } from 'vitest'
import { createGuardiansService } from '@/services/admin-system/guardians'

describe('guardian bulk lifecycle service', () => {
  it('sends tenant-scoped guardian bulk lifecycle requests', async () => {
    const client = {
      post: vi.fn(() => ({
        data: { data: { resource_type: 'guardians', action: 'activate', affected_ids: ['g1'] } },
      })),
    }

    const result = await createGuardiansService(client).bulkLifecycleGuardians(
      { action: 'activate', ids: ['g1'], effectiveAt: '2026-06-28', reason: 'Verified' },
      { schoolId: 'school1' },
    )

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/guardians/bulk-lifecycle',
      { action: 'activate', ids: ['g1'], effective_at: '2026-06-28', reason: 'Verified' },
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-School-Id': 'school1' }),
      }),
    )
    expect(result).toMatchObject({ resourceType: 'guardians', affectedIds: ['g1'] })
  })

  it('normalizes validation failures without leaking submitted reason text', async () => {
    const client = {
      post: vi.fn(() =>
        Promise.reject({
          response: {
            status: 422,
            data: {
              error: {
                code: 'validation_failed',
                details: { reason: 'Sensitive note', errors: { ids: ['Invalid selection'] } },
              },
            },
          },
        }),
      ),
    }

    await expect(
      createGuardiansService(client).bulkLifecycleGuardians(
        {
          action: 'deactivate',
          ids: [],
          effectiveAt: '2026-06-28',
          reason: 'Sensitive note',
        },
        { schoolId: 'school1' },
      ),
    ).rejects.toMatchObject({
      type: 'validation',
      fieldErrors: { ids: ['Invalid selection'] },
      operationId: 'bulkLifecycleGuardians',
    })
  })
})
