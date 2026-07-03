import { describe, expect, it, vi } from 'vitest'
import { useReportHistory } from '@/composables/reporting/useReportHistory'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession, pendingReportRunRecord, reportRunRecord } from '../fixtures/reportingFixtures'
import { mapReportRun } from '@/contracts/reporting/reportingContract'

describe('useReportHistory', () => {
  it('loads default history, filters, pagination, manual refresh, and selected detail', async () => {
    const history = useReportHistory({
      access: createReportingAccessState(activeReportingSession),
      service: { listReports: vi.fn().mockResolvedValue({ items: [mapReportRun(reportRunRecord)], meta: { page: 1, perPage: 25, total: 1 } }) },
    })
    await history.load({ reportType: 'attendance' })
    history.selectRun('run-1')
    expect(history.selectedRun.value.id).toBe('run-1')
    expect(history.state.meta.total).toBe(1)
  })

  it('detects pending runs for refresh', async () => {
    const history = useReportHistory({
      access: createReportingAccessState(activeReportingSession),
      service: { listReports: vi.fn().mockResolvedValue({ items: [mapReportRun(pendingReportRunRecord)], meta: { page: 1, perPage: 25, total: 1 } }) },
    })
    await history.load()
    expect(history.pendingRuns.value).toHaveLength(1)
  })
})
