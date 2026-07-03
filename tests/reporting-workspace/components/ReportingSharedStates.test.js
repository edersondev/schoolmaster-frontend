import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportingAnnouncementRegion from '@/components/reporting/ReportingAnnouncementRegion.vue'
import ReportingFeedbackState from '@/components/reporting/ReportingFeedbackState.vue'
import ReportingStatusBadges from '@/components/reporting/ReportingStatusBadges.vue'
import { createReportingI18n } from '../fixtures/reportingFixtures'

describe('reporting shared states', () => {
  it('renders safe feedback, status, and polite announcements', () => {
    const global = {
      plugins: [createReportingI18n()],
      stubs: {
        ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
        ElTag: { template: '<span><slot /></span>' },
      },
    }
    expect(mount(ReportingFeedbackState, { props: { feedback: { type: 'forbidden' } }, global }).text()).toContain('Reporting is unavailable')
    expect(mount(ReportingStatusBadges, { props: { status: 'generated' }, global }).text()).toContain('Generated')
    expect(mount(ReportingAnnouncementRegion, { props: { message: 'Report ready' } }).attributes('aria-live')).toBe('polite')
  })
})
