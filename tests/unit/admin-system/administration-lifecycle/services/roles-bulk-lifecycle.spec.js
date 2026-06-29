import { describe, expect, it, vi } from 'vitest'
import { createRolesService } from '@/services/admin-system/roles'

describe('role bulk lifecycle service', () => {
  it('sends tenant headers and normalized bulk payloads', async () => {
    const client = {
      post: vi.fn(() => ({
        data: { data: { resource_type: 'roles', action: 'restore', affected_ids: ['r1'] } },
      })),
    }

    await createRolesService(client).bulkLifecycleRoles(
      { action: 'restore', ids: ['r1', 'r1'], effectiveAt: '2026-06-28', reason: 'Reviewed' },
      { schoolId: 'school1' },
    )

    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/roles/bulk-lifecycle',
      { action: 'restore', ids: ['r1'], effective_at: '2026-06-28', reason: 'Reviewed' },
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-School-Id': 'school1' }),
      }),
    )
  })

  it('maps dependency conflicts to batch feedback', async () => {
    const client = {
      post: vi.fn(() =>
        Promise.reject({
          response: { status: 409, data: { error: { code: 'dependency_conflict' } } },
        }),
      ),
    }

    await expect(
      createRolesService(client).bulkLifecycleRoles(
        { action: 'delete', ids: ['r1'], effectiveAt: '2026-06-28', reason: 'Reviewed' },
        { schoolId: 'school1' },
      ),
    ).rejects.toMatchObject({
      type: 'conflict',
      conflictKind: 'dependency',
      operationId: 'bulkLifecycleRoles',
    })
  })
})
