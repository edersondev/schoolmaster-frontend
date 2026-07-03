import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { errorResponse, success, supportDecisionRecord } from '../fixtures/platformSupportFixtures'

describe('support approval service', () => {
  it('approves and revokes with returned-state authority', async () => {
    const client = { get: vi.fn(), post: vi.fn().mockResolvedValueOnce(success(supportDecisionRecord({ state: 'approved' }))).mockResolvedValueOnce(success(supportDecisionRecord({ state: 'revoked' }))) }
    const service = createPlatformSupportService({ client })
    expect((await service.approveSupportAccess({ supportAccessId: 'support-1', reasonCode: 'ok' })).state).toBe('approved')
    expect((await service.revokeSupportAccess({ supportAccessId: 'support-1', reasonCode: 'done' })).state).toBe('revoked')
  })

  it('maps stale conflict safely', async () => {
    const client = { get: vi.fn(), post: vi.fn().mockRejectedValue(errorResponse(409, 'SUPPORT_ACCESS_STALE')) }
    const service = createPlatformSupportService({ client })
    await expect(service.approveSupportAccess({ supportAccessId: 'support-1', reasonCode: 'ok' })).rejects.toMatchObject({ type: 'stale-response' })
  })
})

