import { describe, expect, it, vi } from 'vitest'
import { useReportCatalog } from '@/composables/reporting/useReportCatalog'
import { activeReportingSession, catalogRecord } from '../fixtures/reportingFixtures'
import { createReportingAccessState } from '@/composables/reporting/useReportingAccess'
import { mapReportCatalog } from '@/contracts/reporting/reportingContract'

describe('useReportCatalog', () => {
  it('loads approved catalog options and blocks denied catalog access', async () => {
    const access = createReportingAccessState(activeReportingSession)
    const catalog = useReportCatalog({ access, service: { getReportCatalog: vi.fn().mockResolvedValue(mapReportCatalog(catalogRecord)) } })
    await catalog.load()
    expect(catalog.domains.value).toHaveLength(1)
    expect(catalog.isSupportedFormat('xlsx')).toBe(true)

    const denied = useReportCatalog({ access: createReportingAccessState({ activeSchool: { id: 'school-1' }, permissions: [] }) })
    await denied.load()
    expect(denied.state.feedback.type).toBe('forbidden')
  })
})
