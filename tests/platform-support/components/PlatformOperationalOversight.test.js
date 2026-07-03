import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PlatformReportingOverviewPanel from '@/components/platform-support/PlatformReportingOverviewPanel.vue'
import PlatformSchoolSummaryList from '@/components/platform-support/PlatformSchoolSummaryList.vue'
import { reportingOverviewRecord, schoolSummaryRecord } from '../fixtures/platformSupportFixtures'
import { globalMountOptions } from './testUtils'

describe('Platform Operational Oversight components', () => {
  it('renders minimized summaries with suppression and no private detail', () => {
    const wrapper = mount(PlatformSchoolSummaryList, {
      props: { items: [{ ...schoolSummaryRecord, private_payload: undefined }], loading: false },
      ...globalMountOptions(),
    })
    expect(wrapper.text()).toContain('North Campus')
    expect(wrapper.text()).toContain('students_under_5')
    expect(wrapper.text()).not.toContain('blocked')
  })

  it('renders aggregate reporting overview without raw outputs', () => {
    const wrapper = mount(PlatformReportingOverviewPanel, {
      props: { overview: reportingOverviewRecord },
      ...globalMountOptions(),
    })
    expect(wrapper.text()).toContain('healthy')
    expect(wrapper.text()).not.toContain('raw_outputs')
  })
})

