import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TeacherWorkflowImportEditor from '@/modules/teacher-workflow/components/TeacherWorkflowImportEditor.vue'

describe('TeacherWorkflowImportEditor', () => {
  it('renders JSON-only import policy', () => {
    const wrapper = mount(TeacherWorkflowImportEditor, {
      props: { modelValue: { mode: 'grade', json: '[]', result: null }, rowCount: 0 },
      global: { stubs: ['ElAlert', 'ElRadioGroup', 'ElRadioButton', 'ElFormItem', 'ElInput', 'ElTag', 'ElButton'] },
    })
    expect(wrapper.find('el-alert-stub').attributes('title')).toBe('Structured JSON only')
    expect(wrapper.text()).not.toMatch(/CSV upload|spreadsheet upload|file upload/i)
  })
})
