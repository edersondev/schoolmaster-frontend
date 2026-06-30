import { describe, expect, it, vi } from 'vitest'
import { createAdminAccountLifecycleService } from '@/services/admin-system/accountLifecycle'
import { createClient, schoolId, userId } from '../fixtures'

describe('getAccountLock service', () => {
  it('maps lock state response', async () => {
    const client = createClient({
      get: vi.fn().mockResolvedValue({
        data: {
          data: {
            id: 'lock-1',
            user_id: userId,
            school_id: schoolId,
            lock_type: 'administrative',
            status: 'active',
            reason: 'Support',
          },
        },
      }),
    })
    const service = createAdminAccountLifecycleService(client, () => 'token')

    await expect(service.getAccountLock(userId, { schoolId })).resolves.toMatchObject({
      id: 'lock-1',
      userId,
      status: 'active',
    })
  })
})

