import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportDownloadSurface from '@/components/reporting/ReportDownloadSurface.vue'
import { createReportingI18n, reportRunRecord } from '../fixtures/reportingFixtures'
import { mapReportRun } from '@/contracts/reporting/reportingContract'

describe('report download surface', () => {
  it('emits downloads only through enabled controls', async () => {
    const wrapper = mount(ReportDownloadSurface, {
      props: {
        run: mapReportRun(reportRunRecord),
        canDownload: (_run, format) => format === 'pdf',
        availabilityFor: (_run, format) => (format === 'pdf' ? 'available' : 'expired'),
      },
      global: {
        plugins: [createReportingI18n()],
        stubs: {
          ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
          ElButton: { template: `<button type="button" :disabled="$attrs.disabled" @click="$emit('click')"><slot /></button>` },
          ElTag: { template: '<span><slot /></span>' },
        },
      },
    })
    expect(wrapper.text()).toContain('PDF')
    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('download')?.[0]).toEqual(['pdf'])
  })
})
