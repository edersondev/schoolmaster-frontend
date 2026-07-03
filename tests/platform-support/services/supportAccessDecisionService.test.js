import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { success, supportDecisionRecord } from '../fixtures/platformSupportFixtures'

describe('support access decision service', () => {
  it('requests and reads documented decision states', async () => {
    const client = { get: vi.fn().mockResolvedValue(success(supportDecisionRecord({ state: 'pending' }))), post: vi.fn().mockResolvedValue(success(supportDecisionRecord({ state: 'requested' }))) }
    const service = createPlatformSupportService({ client })
    const requested = await service.requestSupportAccess({ targetSchoolId: 'school-1', reasonCode: 'support', purpose: 'Need help', correlationId: 'corr-1', hidden: 'x' })
    const detail = await service.getSupportAccessDecision({ supportAccessId: 'support-1' })
    expect(requested.state).toBe('requested')
    expect(detail.state).toBe('pending')
    expect(client.post.mock.calls[0][1]).toEqual({
      target_school_id: 'school-1',
      reason_code: 'support',
      purpose: 'Need help',
      correlation_id: 'corr-1',
    })
  })
})

