import { describe, expect, it, vi } from 'vitest'
import { createAdminAccountLifecycleService } from '@/services/admin-system/accountLifecycle'
import { createClient, lifecycleError, schoolId, userId } from '../fixtures'

describe('admin account lifecycle service', () => {
  it('uses X-School-Id and maps invitation response', async () => {
    const client = createClient({
      post: vi.fn().mockResolvedValue({
        data: { data: { id: 'inv-1', user_id: userId, scope: 'school', status: 'pending' } },
      }),
    })
    const service = createAdminAccountLifecycleService(client, () => 'token')

    await expect(
      service.createAccountInvitation(
        { scope: 'school', schoolId, fullName: 'Avery', email: 'avery@example.com', roleIds: ['role-1'] },
        { schoolId },
      ),
    ).resolves.toMatchObject({ id: 'inv-1', userId })
    expect(client.post.mock.calls[0][2].headers).toMatchObject({
      Authorization: 'Bearer token',
      'X-School-Id': schoolId,
    })
    expect(client.post.mock.calls[0][1].delivery_metadata).toBeUndefined()
  })

  it('normalizes admin errors safely', async () => {
    const service = createAdminAccountLifecycleService(
      createClient({ get: vi.fn().mockRejectedValue(lifecycleError('tenant_mismatch', 403)) }),
      () => 'token',
    )

    await expect(service.getAccountLock(userId, { schoolId })).rejects.toMatchObject({
      type: 'tenant-mismatch',
      operationId: 'getAccountLock',
    })
  })
})

