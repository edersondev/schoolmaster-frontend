import { describe, expect, it, vi } from 'vitest'
import { useReportDefinitions } from '@/composables/reporting/useReportDefinitions'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { activeReportingSession, definitionRecord } from '../fixtures/reportingFixtures'
import { mapReportDefinition } from '@/contracts/reporting/reportingContract'

describe('useReportDefinitions', () => {
  it('loads definitions and preserves selection', async () => {
    const definitions = useReportDefinitions({
      access: createReportingAccessState(activeReportingSession),
      service: { listReportDefinitions: vi.fn().mockResolvedValue({ items: [mapReportDefinition(definitionRecord)], meta: { page: 1, perPage: 25, total: 1 } }) },
    })
    await definitions.load()
    definitions.selectDefinition('definition-1')
    expect(definitions.selectedDefinition.value.name).toBe('Attendance summary')
  })
})
