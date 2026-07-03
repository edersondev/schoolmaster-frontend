import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { auditEventRecord, paginated } from '../fixtures/platformSupportFixtures'

describe('support audit service', () => {
  it('maps minimized audit events and filters without private payloads', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([auditEventRecord]) }), post: vi.fn() }
    const service = createPlatformSupportService({ client })
    const result = await service.listSupportAuditEvents({ action: 'diagnostics.viewed', outcome: 'allowed', correlationId: 'corr-1', hidden: 'x' })
    expect(result.items[0].droppedFields).toContain('full_payload')
    expect(result.items[0].full_payload).toBeUndefined()
    expect(client.get.mock.calls[0][1].params).toEqual({
      action: 'diagnostics.viewed',
      outcome: 'allowed',
      correlation_id: 'corr-1',
    })
  })
})

