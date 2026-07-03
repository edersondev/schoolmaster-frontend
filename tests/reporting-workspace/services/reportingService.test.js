import { describe, expect, it, vi } from 'vitest'
import {
  mapReportCatalog,
  mapReportDefinition,
  mapReportRun,
} from '@/contracts/reporting/reportingContract'
import { normalizeReportingError } from '@/services/reporting/reportingErrorMapper'
import { createReportingService } from '@/services/reporting/reportingService'
import { catalogRecord, definitionRecord, errorResponse, paginated, reportRunRecord } from '../fixtures/reportingFixtures'

describe('reporting service contracts', () => {
  it('maps approved fields and drops undocumented response fields', () => {
    expect(mapReportCatalog(catalogRecord).droppedFields).toContain('private_payload')
    expect(mapReportRun(reportRunRecord).droppedFields).toContain('storage_path')
    expect(mapReportDefinition(definitionRecord).droppedFields).toContain('hidden_field')
  })

  it('submits only documented list params and tenant header', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([reportRunRecord]) }) }
    const service = createReportingService({ client, getAccessToken: () => 'token' })
    await service.listReports(
      { page: 2, perPage: 10, reportType: 'attendance', hidden: 'blocked' },
      { schoolId: 'school-1' },
    )
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/reports',
      expect.objectContaining({
        params: { page: 2, per_page: 10, report_type: 'attendance' },
        headers: expect.objectContaining({ 'X-School-Id': 'school-1' }),
      }),
    )
  })

  it('normalizes expired output safely', () => {
    const feedback = normalizeReportingError(errorResponse(410, 'OUTPUT_EXPIRED'), {
      operationId: 'downloadReport',
    })
    expect(feedback.type).toBe('output-expired')
    expect(feedback.diagnostic).toMatchObject({ operationId: 'downloadReport', requestId: 'req-1' })
  })
})
