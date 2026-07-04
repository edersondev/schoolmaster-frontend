import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { reportingOverviewRecord, success } from '../fixtures/platformSupportFixtures'

describe('platform reporting overview service', () => {
  it('maps aggregate reporting health and excludes raw outputs', async () => {
    const client = { get: vi.fn().mockResolvedValue(success(reportingOverviewRecord)), post: vi.fn() }
    const service = createPlatformSupportService({ client })
    const result = await service.getPlatformReportingOverview()
    expect(result.health.reports).toBe('healthy')
    expect(result.droppedFields).toContain('raw_outputs')
    expect(result.raw_outputs).toBeUndefined()
  })
})

