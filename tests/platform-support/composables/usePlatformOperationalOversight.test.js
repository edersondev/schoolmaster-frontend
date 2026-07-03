import { describe, expect, it, vi } from 'vitest'
import {
  createPlatformSupportAccessState,
  usePlatformSupportAccess,
} from '@/composables/platform-support/usePlatformSupportAccess'
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

  it('accepts the readonly workspace access object when checking child permissions', async () => {
    const access = usePlatformSupportAccess({ session: platformSession })
    const service = {
      listPlatformSchoolSummaries: vi.fn().mockResolvedValue({
        items: [schoolSummaryRecord],
        meta: { page: 1, perPage: 25, total: 1 },
      }),
      getPlatformReportingOverview: vi.fn().mockResolvedValue(reportingOverviewRecord),
    }
    const summaries = usePlatformSchoolSummaries({ service, access })
    const reporting = usePlatformReportingOverview({ service, access })

    await summaries.load()
    await reporting.load()

    expect(summaries.state.feedback).toBeNull()
    expect(reporting.state.feedback).toBeNull()
    expect(service.listPlatformSchoolSummaries).toHaveBeenCalledTimes(1)
    expect(service.getPlatformReportingOverview).toHaveBeenCalledTimes(1)
  })

  it('ignores stale summary failures while a newer request is active', async () => {
    let rejectFirst
    let resolveSecond
    const access = createPlatformSupportAccessState(platformSession)
    const service = {
      listPlatformSchoolSummaries: vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve, reject) => {
              rejectFirst = reject
            }),
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveSecond = resolve
            }),
        ),
    }
    const summaries = usePlatformSchoolSummaries({ service, access })

    const firstLoad = summaries.load()
    const secondLoad = summaries.setFilters({ search: 'North' })
    rejectFirst({ feedback: { type: 'temporaryUnavailable' } })
    await firstLoad

    expect(summaries.state.feedback).toBeNull()
    expect(summaries.state.loading).toBe(true)

    resolveSecond({ items: [schoolSummaryRecord], meta: { page: 1, perPage: 25, total: 1 } })
    await secondLoad

    expect(summaries.state.loading).toBe(false)
    expect(summaries.state.items).toEqual([schoolSummaryRecord])
  })
})
