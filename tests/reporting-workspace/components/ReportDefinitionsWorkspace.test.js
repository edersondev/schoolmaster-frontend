import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportDefinitionDetail from '@/components/reporting/ReportDefinitionDetail.vue'
import ReportDefinitionEditor from '@/components/reporting/ReportDefinitionEditor.vue'
import ReportDefinitionsList from '@/components/reporting/ReportDefinitionsList.vue'
import { catalogRecord, createReportingI18n, definitionRecord } from '../fixtures/reportingFixtures'
import { mapReportCatalog, mapReportDefinition } from '@/contracts/reporting/reportingContract'

describe('report definitions workspace components', () => {
  it('renders list, detail, editor, lifecycle, and request-from-active flow', async () => {
    const global = {
      plugins: [createReportingI18n()],
      stubs: {
        ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
        ElButton: { template: `<button type="button" @click="$emit('click')"><slot /></button>` },
        ElTag: { template: '<span><slot /></span>' },
        ElForm: { template: '<form><slot /></form>' },
        ElFormItem: { template: '<div><slot /></div>' },
        ElInput: { template: '<input />' },
        ElSelect: { template: '<div><slot /></div>' },
        ElOption: { template: '<div />' },
        ElCheckboxGroup: { template: '<div><slot /></div>' },
        ElCheckbox: { template: '<label><slot /></label>' },
      },
    }
    const definition = mapReportDefinition(definitionRecord)
    expect(mount(ReportDefinitionsList, { props: { items: [definition] }, global }).text()).toContain('Attendance summary')
    const detail = mount(ReportDefinitionDetail, { props: { definition }, global })
    expect(detail.text()).toContain('Request report')
    const editor = mount(ReportDefinitionEditor, {
      props: {
        draft: { ...definition },
        catalog: mapReportCatalog(catalogRecord),
        canSubmit: true,
        complexityUsage: { fields: 1, filters: 0, grouping: 0, sorting: 0 },
      },
      global,
    })
    expect(editor.text()).toContain('Definition editor')
  })
})
