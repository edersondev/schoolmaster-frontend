import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { useSupportApprovalActions } from '@/composables/platform-support/useSupportApprovalActions'
import { platformSession, supportDecisionRecord } from '../fixtures/platformSupportFixtures'

describe('useSupportApprovalActions', () => {
  it('gates approval/revocation and applies returned decision', async () => {
    const onDecision = vi.fn()
    const service = { approveSupportAccess: vi.fn().mockResolvedValue(supportDecisionRecord()), revokeSupportAccess: vi.fn().mockResolvedValue(supportDecisionRecord({ state: 'revoked' })) }
    const actions = useSupportApprovalActions({ service, access: createPlatformSupportAccessState(platformSession), onDecision })
    await actions.approve({ id: 'support-1', reasonCode: 'support' })
    await actions.revoke({ id: 'support-1', reasonCode: 'support' })
    expect(onDecision).toHaveBeenCalledTimes(2)
  })
})

