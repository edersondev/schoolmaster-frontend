import { describe, expect, it, vi } from 'vitest'
import { useSupportDecisionRefresh } from '@/composables/platform-support/useSupportDecisionRefresh'

describe('useSupportDecisionRefresh', () => {
  it('refreshes decision and removes diagnostics when access closes', async () => {
    const diagnostics = { clear: vi.fn() }
    const decisionState = {
      state: { decision: { id: 'support-1', state: 'approved', diagnosticsAvailable: true } },
      loadDecision: vi.fn().mockResolvedValue({ id: 'support-1', state: 'revoked', diagnosticsAvailable: false }),
    }
    const refresh = useSupportDecisionRefresh({ decisionState, diagnostics })
    await refresh.refreshNow()
    expect(diagnostics.clear).toHaveBeenCalled()
    expect(refresh.state.feedback.type).toBe('diagnostics-unavailable')
  })
})

