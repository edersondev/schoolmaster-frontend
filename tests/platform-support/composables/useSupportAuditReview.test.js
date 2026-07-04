import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { useSupportAuditReview } from '@/composables/platform-support/useSupportAuditReview'
import { auditEventRecord, platformSession } from '../fixtures/platformSupportFixtures'

describe('useSupportAuditReview', () => {
  it('loads minimized audit events with filters and pagination', async () => {
    const service = { listSupportAuditEvents: vi.fn().mockResolvedValue({ items: [auditEventRecord], meta: { page: 1, perPage: 25, total: 1 } }) }
    const audit = useSupportAuditReview({ service, access: createPlatformSupportAccessState(platformSession) })
    await audit.setFilters({ outcome: 'allowed' })
    expect(service.listSupportAuditEvents).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'allowed' }))
    expect(audit.state.items[0].action).toBe('diagnostics.viewed')
  })
})

