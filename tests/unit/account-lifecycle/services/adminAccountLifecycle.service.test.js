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
        {
          scope: 'school',
          schoolId,
          fullName: 'Avery',
          email: 'avery@example.com',
          roleIds: ['role-1'],
        },
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

  it('normalizes invitation delivery failure as safe retryable unavailability', async () => {
    const service = createAdminAccountLifecycleService(
      createClient({
        post: vi.fn().mockRejectedValue(
          lifecycleError('temporary_unavailable', 503, {
            provider: 'must-not-be-forwarded',
          }),
        ),
      }),
      () => 'token',
    )

    await expect(
      service.createAccountInvitation(
        {
          scope: 'school',
          schoolId,
          fullName: 'Avery',
          email: 'avery@example.com',
          roleIds: ['role-1'],
        },
        { schoolId },
      ),
    ).rejects.toMatchObject({
      type: 'unavailable',
      code: 'temporary_unavailable',
      recoveryAction: 'retry',
      operationId: 'createAccountInvitation',
    })
  })

  it('uses exact lock, unlock, recovery, and reactivation requests with abort signals', async () => {
    const client = createClient({
      get: vi.fn().mockResolvedValue({ data: { data: { user_id: userId, status: 'none' } } }),
      post: vi.fn().mockResolvedValue({ data: { data: { user_id: userId, status: 'active' } } }),
      delete: vi.fn().mockResolvedValue({
        data: { data: { user_id: userId, status: 'active', action: 'account_unlocked' } },
      }),
    })
    const service = createAdminAccountLifecycleService(client, () => 'token')
    const controller = new AbortController()

    await service.getAccountLock(userId, { schoolId, signal: controller.signal })
    await service.lockAccount(
      userId,
      { reason: ' Security review ' },
      { schoolId, signal: controller.signal },
    )
    await service.unlockAccount(userId, { schoolId, signal: controller.signal })
    await service.reactivateAccount(
      userId,
      { action: 'recover', reason: ' Verified ' },
      { schoolId, signal: controller.signal },
    )
    await service.reactivateAccount(
      userId,
      { action: 'reactivate' },
      { schoolId, signal: controller.signal },
    )

    expect(client.get).toHaveBeenCalledWith(
      `/api/v1/users/${userId}/account-lock`,
      expect.objectContaining({ signal: controller.signal }),
    )
    expect(client.post).toHaveBeenNthCalledWith(
      1,
      `/api/v1/users/${userId}/account-lock`,
      { reason: 'Security review' },
      expect.objectContaining({ signal: controller.signal }),
    )
    expect(client.delete).toHaveBeenCalledWith(
      `/api/v1/users/${userId}/account-lock`,
      expect.objectContaining({ signal: controller.signal }),
    )
    expect(client.post).toHaveBeenNthCalledWith(
      2,
      `/api/v1/users/${userId}/account-reactivation`,
      { action: 'unlock', reason: 'Verified' },
      expect.objectContaining({ signal: controller.signal }),
    )
    expect(client.post).toHaveBeenNthCalledWith(
      3,
      `/api/v1/users/${userId}/account-reactivation`,
      { action: 'reactivate' },
      expect.objectContaining({ signal: controller.signal }),
    )
  })

  it('omits the school header for platform targets', async () => {
    const client = createClient({
      get: vi.fn().mockResolvedValue({ data: { data: { user_id: userId, status: 'none' } } }),
    })
    const service = createAdminAccountLifecycleService(client, () => 'token')

    await service.getAccountLock(userId)

    expect(client.get.mock.calls[0][1].headers).not.toHaveProperty('X-School-Id')
  })

  it('posts no body for password delivery and maps only safe result data', async () => {
    const client = createClient({
      post: vi.fn().mockResolvedValue({
        data: {
          data: {
            status: 'requested',
            delivery_channel: 'email',
            delivery_requested_at: '2026-08-26T12:00:00Z',
            token: 'must-not-survive',
          },
        },
      }),
    })
    const service = createAdminAccountLifecycleService(client, () => 'token')
    const controller = new AbortController()

    await expect(
      service.requestUserPasswordDelivery(userId, {
        schoolId,
        signal: controller.signal,
      }),
    ).resolves.toEqual({
      status: 'requested',
      deliveryChannel: 'email',
      deliveryRequestedAt: '2026-08-26T12:00:00Z',
    })
    expect(client.post).toHaveBeenCalledWith(
      `/api/v1/users/${userId}/password-delivery`,
      undefined,
      expect.objectContaining({
        signal: controller.signal,
        headers: expect.objectContaining({ 'X-School-Id': schoolId }),
      }),
    )
  })

  it('maps password delivery limits and unavailability to safe retry states', async () => {
    const limited = createAdminAccountLifecycleService(
      createClient({
        post: vi.fn().mockRejectedValue(lifecycleError('password_delivery_rate_limited', 429)),
      }),
      () => 'token',
    )

    await expect(limited.requestUserPasswordDelivery(userId, { schoolId })).rejects.toMatchObject({
      type: 'rate-limited',
      operationId: 'requestUserPasswordDelivery',
      recoveryAction: 'retry',
    })
  })
})
