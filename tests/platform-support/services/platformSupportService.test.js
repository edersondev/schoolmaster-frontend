import { describe, expect, it, vi } from 'vitest'
import {
  mapPlatformSchoolSummary,
  mapSupportAccessDecision,
} from '@/contracts/platform-support/platformSupportContract'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { errorResponse, paginated, schoolSummaryRecord, success, supportDecisionRecord } from '../fixtures/platformSupportFixtures'

describe('platform support service contracts', () => {
  it('maps approved fields and drops undocumented response fields', () => {
    expect(mapPlatformSchoolSummary(schoolSummaryRecord).droppedFields).toContain('private_payload')
    expect(mapSupportAccessDecision(supportDecisionRecord()).droppedFields).toContain('hidden_actor_metadata')
  })

  it('submits only approved params and auth header', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([schoolSummaryRecord]) }), post: vi.fn() }
    const service = createPlatformSupportService({ client, getAccessToken: () => 'token' })
    await service.listPlatformSchoolSummaries({ page: 2, perPage: 10, search: 'north', hidden: 'blocked' })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/platform/schools',
      expect.objectContaining({
        params: { page: 2, per_page: 10, search: 'north' },
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    )
  })

  it('does not expose school-admin opt-in service functions', () => {
    const service = createPlatformSupportService({ client: { get: vi.fn(), post: vi.fn() } })
    expect(service.createSchoolSupportOptIn).toBeUndefined()
    expect(service.revokeSchoolSupportOptIn).toBeUndefined()
  })

  it('normalizes contract-unavailable responses safely', async () => {
    const client = { get: vi.fn().mockRejectedValue(errorResponse(503, 'CONTRACT_UNAVAILABLE')), post: vi.fn() }
    const service = createPlatformSupportService({ client })
    await expect(service.getPlatformReportingOverview()).rejects.toMatchObject({
      type: 'contract-unavailable',
      diagnostic: { operationId: 'getPlatformReportingOverview', requestId: 'req-1' },
    })
  })
})

