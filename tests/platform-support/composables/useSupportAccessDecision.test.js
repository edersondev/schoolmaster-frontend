import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { useSupportAccessDecision } from '@/composables/platform-support/useSupportAccessDecision'
import { platformSession, supportDecisionRecord } from '../fixtures/platformSupportFixtures'

describe('useSupportAccessDecision', () => {
  it('submits documented request fields and exposes diagnostics gate', async () => {
    const service = { requestSupportAccess: vi.fn().mockResolvedValue({ ...supportDecisionRecord(), diagnosticsAvailable: true }) }
    const state = useSupportAccessDecision({ service, access: createPlatformSupportAccessState(platformSession) })
    state.updateDraft({ targetSchoolId: 'school-1', reasonCode: 'support', purpose: 'Need help', correlationId: 'corr-1' })
    await state.requestAccess()
    expect(service.requestSupportAccess).toHaveBeenCalledWith(state.state.draft)
    expect(state.diagnosticsBlocked.value).toBe(false)
  })
})

