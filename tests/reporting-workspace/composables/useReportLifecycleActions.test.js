import { describe, expect, it, vi } from 'vitest'
import { useReportLifecycleActions } from '@/composables/reporting/useReportLifecycleActions'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession, reportRunRecord } from '../fixtures/reportingFixtures'
import { mapReportRun } from '@/contracts/reporting/reportingContract'

describe('useReportLifecycleActions', () => {
  it('gates lifecycle actions by state and applies returned state', async () => {
    const history = { applyReturnedRun: vi.fn() }
    const lifecycle = useReportLifecycleActions({
      access: createReportingAccessState(activeReportingSession),
      history,
      service: { retryReport: vi.fn().mockResolvedValue(mapReportRun(reportRunRecord)) },
    })
    const failed = { id: 'run-1', generationStatus: 'failed', outputs: [] }
    expect(lifecycle.availableActions(failed)).toContain('retry')
    await lifecycle.submit(failed, 'retry')
    expect(history.applyReturnedRun).toHaveBeenCalled()
  })
})
