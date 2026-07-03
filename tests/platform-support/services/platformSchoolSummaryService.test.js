import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { paginated, schoolSummaryRecord } from '../fixtures/platformSupportFixtures'

describe('platform school summary service', () => {
  it('maps pagination, filters, minimized fields, suppression markers, and no detail records', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([schoolSummaryRecord]) }), post: vi.fn() }
    const service = createPlatformSupportService({ client })
    const result = await service.listPlatformSchoolSummaries({ status: 'active', sort: 'name' })
    expect(result.meta.total).toBe(1)
    expect(result.items[0]).toMatchObject({ id: 'school-1', suppressed: ['students_under_5'] })
    expect(result.items[0].private_payload).toBeUndefined()
    expect(client.get.mock.calls[0][1].params).toEqual({ sort: 'name', status: 'active' })
  })
})

