import { describe, expect, it, vi } from 'vitest'
import { extractSafeFilename, startReportDownload } from '@/services/reporting/reportingDownloadAdapter'
import { createReportingService } from '@/services/reporting/reportingService'

describe('report download service', () => {
  it('uses format query and safe filename for binary download', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: new Blob(['x']), headers: { 'content-disposition': 'attachment; filename=\"report.pdf\"' } }) }
    const service = createReportingService({ client })
    const response = await service.downloadReport({ reportRunId: 'run-1', format: 'pdf' }, { schoolId: 'school-1' })
    expect(client.get).toHaveBeenCalledWith('/api/v1/reports/run-1/download', expect.objectContaining({ params: { format: 'pdf' } }))
    expect(extractSafeFilename(response.disposition)).toBe('report.pdf')
  })

  it('does not expose storage paths in generated filenames', () => {
    expect(extractSafeFilename('attachment; filename=\"../../private/report.pdf\"')).toBe('.._.._private_report.pdf')
    expect(startReportDownload({ format: 'pdf' }, { documentRef: null }).started).toBe(false)
  })
})
