import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { useSupportDiagnostics } from '@/composables/platform-support/useSupportDiagnostics'
import { mapSupportSchoolDiagnostics } from '@/contracts/platform-support/platformSupportContract'
import { diagnosticsRecord, platformSession, supportDecisionRecord } from '../fixtures/platformSupportFixtures'

describe('useSupportDiagnostics', () => {
  it('loads only with valid support drill-down gates', async () => {
    const service = { getSupportSchoolDiagnostics: vi.fn().mockResolvedValue(mapSupportSchoolDiagnostics(diagnosticsRecord)) }
    const diagnostics = useSupportDiagnostics({ service, access: createPlatformSupportAccessState(platformSession) })
    const decision = { ...supportDecisionRecord(), diagnosticsAvailable: true, targetSchoolId: 'school-1' }
    await diagnostics.load({ schoolId: 'school-1', decision })
    expect(diagnostics.state.diagnostics.groups[0].key).toBe('reporting')
    expect(diagnostics.redactionState.value.redactedFields).toContain('private_path')
  })

  it('blocks mismatched target school safely', async () => {
    const diagnostics = useSupportDiagnostics({ service: {}, access: createPlatformSupportAccessState(platformSession) })
    await diagnostics.load({ schoolId: 'school-2', decision: { ...supportDecisionRecord(), diagnosticsAvailable: true, targetSchoolId: 'school-1' } })
    expect(diagnostics.state.feedback.type).toBe('diagnostics-unavailable')
  })
})
