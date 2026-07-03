import { describe, expect, it, vi } from 'vitest'
import { useReportRequestForm } from '@/composables/reporting/useReportRequestForm'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession, reportRunRecord } from '../fixtures/reportingFixtures'
import { mapReportRun } from '@/contracts/reporting/reportingContract'

describe('useReportRequestForm', () => {
  it('validates built-in requests and unsupported output formats', async () => {
    const form = useReportRequestForm({
      access: createReportingAccessState(activeReportingSession),
      catalog: { isSupportedFormat: (format) => ['pdf'].includes(format) },
      service: { requestReport: vi.fn().mockResolvedValue(mapReportRun(reportRunRecord)) },
    })
    form.state.draft.reportType = 'attendance'
    form.state.draft.outputFormats = ['xml']
    expect(form.canSubmit.value).toBe(false)
    form.state.draft.outputFormats = ['pdf']
    expect(await form.submit()).toMatchObject({ id: 'run-1' })
  })
})
