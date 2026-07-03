import { describe, expect, it, vi } from 'vitest'
import { createReportingService } from '@/services/reporting/reportingService'
import { reportRunRecord } from '../fixtures/reportingFixtures'

describe('report lifecycle service', () => {
  it('sends approved retry and cancel reason codes', async () => {
    const client = { post: vi.fn().mockResolvedValue({ data: { data: reportRunRecord } }) }
    const service = createReportingService({ client })
    await service.retryReport({ reportRunId: 'run-1', reasonCode: 'generation-failed' }, { schoolId: 'school-1' })
    expect(client.post).toHaveBeenCalledWith(
      '/api/v1/reports/run-1/retry',
      { reason_code: 'generation-failed' },
      expect.any(Object),
    )
  })
})
