import { describe, expect, it, vi } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { usePlatformReportingOverview } from '@/composables/platform-support/usePlatformReportingOverview'
import { usePlatformSchoolSummaries } from '@/composables/platform-support/usePlatformSchoolSummaries'
import { platformSession, reportingOverviewRecord, schoolSummaryRecord } from '../fixtures/platformSupportFixtures'

describe('platform operational oversight composables', () => {
  it('loads default permitted summaries and reporting overview', async () => {
    const access = createPlatformSupportAccessState(platformSession)
    const service = {
      listPlatformSchoolSummaries: vi.fn().mockResolvedValue({ items: [schoolSummaryRecord], meta: { page: 1, perPage: 25, total: 1 } }),
      getPlatformReportingOverview: vi.fn().mockResolvedValue(reportingOverviewRecord),
    }
    const summaries = usePlatformSchoolSummaries({ service, access })
    const reporting = usePlatformReportingOverview({ service, access })
    await summaries.load()
    await reporting.load()
    expect(summaries.state.items[0].name).toBe('North Campus')
    expect(reporting.summaryGroups.value[0].key).toBe('health')
  })
})

