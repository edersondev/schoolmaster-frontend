import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportService } from '@/services/platform-support/platformSupportService'
import { diagnosticsRecord, success } from '../fixtures/platformSupportFixtures'

describe('support diagnostics service', () => {
  it('maps redacted diagnostics and excludes private output', async () => {
    const client = { get: vi.fn().mockResolvedValue(success(diagnosticsRecord)), post: vi.fn() }
    const service = createPlatformSupportService({ client })
    const result = await service.getSupportSchoolDiagnostics({ schoolId: 'school-1', supportAccessId: 'support-1' })
    expect(result.redactedFields).toContain('private_path')
    expect(result.suppressed).toContain('small_count')
    expect(result.droppedFields).toContain('raw_report_outputs')
    expect(client.get.mock.calls[0][1].params).toEqual({ support_access_id: 'support-1' })
  })
})

