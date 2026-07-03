import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportRetryCancelDialogs from '@/components/reporting/ReportRetryCancelDialogs.vue'
import ReportRunLifecycleControls from '@/components/reporting/ReportRunLifecycleControls.vue'
import { createReportingI18n } from '../fixtures/reportingFixtures'

describe('report lifecycle actions', () => {
  it('renders approved actions and predefined reason codes only', async () => {
    const global = {
      plugins: [createReportingI18n()],
      stubs: {
        ElButton: { template: `<button type="button" @click="$emit('click')"><slot /></button>` },
        ElDialog: { template: '<div><slot /><slot name="footer" /></div>' },
        ElForm: { template: '<form><slot /></form>' },
        ElFormItem: { template: '<div><slot /></div>' },
        ElSelect: { template: '<div><slot /></div>' },
        ElOption: { props: ['label'], template: '<div>{{ label }}</div>' },
      },
    }
    const controls = mount(ReportRunLifecycleControls, {
      props: { run: { id: 'run-1' }, availableActions: () => ['retry'] },
      global,
    })
    expect(controls.text()).toContain('Retry')
    const dialog = mount(ReportRetryCancelDialogs, {
      props: { modelValue: true, action: 'retry', reasonCode: 'generation-failed', reasonOptions: ['generation-failed'] },
      global,
    })
    expect(dialog.text()).toContain('generation-failed')
  })
})
