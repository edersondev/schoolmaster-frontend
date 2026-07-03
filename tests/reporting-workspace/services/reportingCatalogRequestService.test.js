import { describe, expect, it, vi } from 'vitest'
import { createReportingService } from '@/services/reporting/reportingService'
import { catalogRecord, reportRunRecord } from '../fixtures/reportingFixtures'

describe('reporting catalog and request service', () => {
  it('loads catalog and requests built-in reports through approved operations', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ data: { data: catalogRecord } }),
      post: vi.fn().mockResolvedValue({ data: { data: reportRunRecord } }),
    }
    const service = createReportingService({ client, getAccessToken: () => 'token' })
    const catalog = await service.getReportCatalog({ schoolId: 'school-1' })
    const run = await service.requestReport(
      { reportType: 'attendance', outputFormats: ['pdf'], unsafe: true },
      { schoolId: 'school-1' },
    )
    expect(catalog.outputFormats).toEqual(['pdf', 'csv', 'xlsx'])
    expect(run.id).toBe('run-1')
    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/reports',
      { report_type: 'attendance', output_formats: ['pdf'] },
      expect.any(Object),
    )
  })
})
