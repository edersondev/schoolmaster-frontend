import { describe, expect, it, vi } from 'vitest'
import { useReportDownloads } from '@/composables/reporting/useReportDownloads'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession } from '../fixtures/reportingFixtures'

describe('useReportDownloads', () => {
  it('downloads only available outputs', async () => {
    const run = { id: 'run-1', outputs: [{ format: 'pdf', availability: 'available' }, { format: 'csv', availability: 'expired' }] }
    const downloads = useReportDownloads({
      access: createReportingAccessState(activeReportingSession),
      service: { downloadReport: vi.fn().mockResolvedValue({ format: 'pdf' }) },
      downloadAdapter: vi.fn().mockReturnValue({ started: true, filename: 'report.pdf' }),
    })
    expect(downloads.canDownload(run, 'pdf')).toBe(true)
    expect(downloads.canDownload(run, 'csv')).toBe(false)
    await downloads.download(run, 'pdf')
    expect(downloads.state.lastDownload.started).toBe(true)
  })
})
