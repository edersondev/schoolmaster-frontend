import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportCatalogBrowser from '@/components/reporting/ReportCatalogBrowser.vue'
import ReportRequestForm from '@/components/reporting/ReportRequestForm.vue'
import { catalogRecord, createReportingI18n } from '../fixtures/reportingFixtures'
import { mapReportCatalog } from '@/contracts/reporting/reportingContract'

describe('report catalog request flow components', () => {
  it('renders catalog domains and emits request submit', async () => {
    const global = {
      plugins: [createReportingI18n()],
      stubs: {
        ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
        ElForm: { template: '<form><slot /></form>' },
        ElFormItem: { template: '<div><slot /></div>' },
        ElSelect: { template: '<div><slot /></div>' },
        ElOption: { template: '<div />' },
        ElCheckboxGroup: { template: '<div><slot /></div>' },
        ElCheckbox: { template: '<label><slot /></label>' },
        ElButton: { template: `<button type="button" @click="$emit('click')"><slot /></button>` },
      },
    }
    const catalog = mapReportCatalog(catalogRecord)
    expect(mount(ReportCatalogBrowser, { props: { catalog }, global }).text()).toContain('Attendance')
    const form = mount(ReportRequestForm, {
      props: { draft: { reportType: '', reportDefinitionId: '', outputFormats: [] }, catalog, canSubmit: true },
      global,
    })
    await form.find('button').trigger('click')
    expect(form.emitted('submit')).toBeTruthy()
  })
})
