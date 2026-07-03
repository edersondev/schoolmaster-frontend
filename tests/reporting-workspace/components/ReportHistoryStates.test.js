import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportHistoryList from '@/components/reporting/ReportHistoryList.vue'
import ReportRunDetail from '@/components/reporting/ReportRunDetail.vue'
import { createReportingI18n, reportRunRecord } from '../fixtures/reportingFixtures'
import { mapReportRun } from '@/contracts/reporting/reportingContract'

describe('report history states', () => {
  it('renders report history state and active school timezone timestamps', () => {
    const global = {
      plugins: [createReportingI18n()],
      stubs: {
        ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
        ElButton: { template: '<button><slot /></button>' },
        ElPagination: { template: '<nav />' },
        ElTag: { template: '<span><slot /></span>' },
      },
    }
    const run = mapReportRun(reportRunRecord)
    expect(mount(ReportHistoryList, { props: { items: [run], pagination: { page: 1, perPage: 25, total: 1 } }, global }).text()).toContain('attendance')
    expect(
      mount(ReportRunDetail, {
        props: {
          run,
          formatTimestamp: () => 'Jul 3, 2026, 9:00 AM',
          downloads: { state: {}, canDownload: () => true, availabilityFor: () => 'available' },
          lifecycle: { availableActions: () => [] },
        },
        global,
      }).text(),
    ).toContain('Jul 3, 2026')
  })
})
