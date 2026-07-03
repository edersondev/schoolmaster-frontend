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

  it('fetches and merges a selected definition missing from the current page', async () => {
    const pageDefinition = mapReportDefinition(definitionRecord)
    const detailDefinition = mapReportDefinition({
      ...definitionRecord,
      id: 'definition-99',
      name: 'Deleted export',
      deleted_at: '2026-07-03T10:00:00Z',
    })
    const service = {
      listReportDefinitions: vi.fn().mockResolvedValue({ items: [pageDefinition], meta: { page: 1, perPage: 25, total: 2 } }),
      getReportDefinition: vi.fn().mockResolvedValue(detailDefinition),
    }
    const definitions = useReportDefinitions({
      access: createReportingAccessState(activeReportingSession),
      service,
    })

    await definitions.load()
    definitions.selectDefinition('definition-99')
    expect(definitions.selectedDefinition.value).toBeNull()

    await definitions.loadDefinition('definition-99')

    expect(service.getReportDefinition).toHaveBeenCalledWith(
      { reportDefinitionId: 'definition-99' },
      { schoolId: 'school-1' },
    )
    expect(definitions.selectedDefinition.value.name).toBe('Deleted export')
    expect(definitions.items.value.map((definition) => definition.id)).toEqual(['definition-99', 'definition-1'])
  })
})
