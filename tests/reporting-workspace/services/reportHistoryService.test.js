import { describe, expect, it, vi } from 'vitest'
import { createReportingService } from '@/services/reporting/reportingService'
import { paginated, reportRunRecord } from '../fixtures/reportingFixtures'

describe('report history service', () => {
  it('maps report history pagination, soft delete, lineage, and outputs', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([{ ...reportRunRecord, deleted_at: '2026-07-03', source_report_run_id: 'run-old' }]) }) }
    const service = createReportingService({ client })
    const result = await service.listReports({ includeDeleted: true }, { schoolId: 'school-1' })
    expect(result.items[0]).toMatchObject({
      deletedAt: '2026-07-03',
      sourceReportRunId: 'run-old',
      outputs: expect.arrayContaining([expect.objectContaining({ format: 'pdf', availability: 'available' })]),
    })
  })
})
