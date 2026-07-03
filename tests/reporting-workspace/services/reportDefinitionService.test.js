import { describe, expect, it, vi } from 'vitest'
import { createReportingService } from '@/services/reporting/reportingService'
import { definitionRecord, paginated } from '../fixtures/reportingFixtures'

describe('report definition service', () => {
  it('maps definition list and lifecycle operations', async () => {
    const client = {
      get: vi.fn().mockResolvedValue({ data: paginated([definitionRecord]) }),
      post: vi.fn().mockResolvedValue({ data: { data: { ...definitionRecord, lifecycle_state: 'inactive' } } }),
    }
    const service = createReportingService({ client })
    const list = await service.listReportDefinitions({}, { schoolId: 'school-1' })
    const restored = await service.restoreReportDefinition({ reportDefinitionId: 'definition-1' }, { schoolId: 'school-1' })
    expect(list.items[0].lifecycleState).toBe('active')
    expect(restored.lifecycleState).toBe('inactive')
  })
})
