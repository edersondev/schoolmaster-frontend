import { describe, expect, it, vi } from 'vitest'
import { createUsersService } from '@/services/admin-system/users'

describe('user bulk lifecycle service', () => {
  it('sends one tenant-scoped action with unique ids and audit fields', async () => {
    const client = {
      post: vi.fn(() => ({
        data: { data: { resource_type: 'users', action: 'deactivate', affected_ids: ['u1', 'u2'] } },
      })),
    }

    const result = await createUsersService(client, () => 'token').bulkLifecycleUsers(
      {
        action: 'deactivate',
        ids: ['u1', 'u1', 'u2'],
        effectiveAt: '2026-06-28',
        reason: '  Access review complete  ',
      },
      { schoolId: 'school1' },
    )

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/users/bulk-lifecycle',
      {
        action: 'deactivate',
        ids: ['u1', 'u2'],
        effective_at: '2026-06-28',
        reason: 'Access review complete',
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
          'X-School-Id': 'school1',
        }),
      }),
    )
    expect(result).toMatchObject({ resourceType: 'users', affectedIds: ['u1', 'u2'] })
  })

  it('normalizes all-or-nothing batch failures', async () => {
    const client = {
      post: vi.fn(() =>
        Promise.reject({
          response: { status: 409, data: { error: { code: 'batch_conflict' } } },
        }),
      ),
    }

    await expect(
      createUsersService(client).bulkLifecycleUsers(
        { action: 'delete', ids: ['u1'], effectiveAt: '2026-06-28', reason: 'Audit' },
        { schoolId: 'school1' },
      ),
    ).rejects.toMatchObject({
      type: 'conflict',
      conflictKind: 'batch',
      operationId: 'bulkLifecycleUsers',
    })
  })
})
