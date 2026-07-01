import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CorrectionReasonDialog from '@/modules/teacher-workflow/components/CorrectionReasonDialog.vue'

describe('CorrectionReasonDialog', () => {
  it('shows reason validation', () => {
    const wrapper = mount(CorrectionReasonDialog, {
      props: {
        modelValue: true,
        draft: { correctionReason: 'short' },
        currentValue: 90,
        originalValue: 80,
      },
      global: {
        stubs: {
          ElDialog: { template: '<div><slot /><slot name="footer" /></div>' },
          ElFormItem: { template: '<label><slot /></label>' },
          ElInput: true,
          ElInputNumber: true,
          ElOption: true,
          ElSelect: true,
          ElButton: true,
        },
      },
    })
    expect(wrapper.text()).toContain('Current value')
  })

  it('requires a corrected grade value', () => {
    const wrapper = mount(CorrectionReasonDialog, {
      props: {
        modelValue: true,
        draft: { gradeValue: null, correctionReason: 'valid reason' },
        currentValue: 90,
        originalValue: 80,
        valueType: 'grade',
      },
      global: {
        stubs: {
          ElDialog: { template: '<div><slot /><slot name="footer" /></div>' },
          ElFormItem: { props: ['error'], template: '<label><span>{{ error }}</span><slot /></label>' },
          ElInput: true,
          ElInputNumber: true,
          ElButton: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Corrected grade is required.')
  })

  it('renders corrected attendance status input', () => {
    const wrapper = mount(CorrectionReasonDialog, {
      props: {
        modelValue: true,
        draft: { attendanceStatus: 'absent', correctionReason: 'valid reason' },
        currentValue: 'present',
        originalValue: 'present',
        valueType: 'attendance',
      },
      global: {
        stubs: {
          ElDialog: { template: '<div><slot /><slot name="footer" /></div>' },
          ElFormItem: { props: ['label'], template: '<label><span>{{ label }}</span><slot /></label>' },
          ElInput: true,
          ElOption: true,
          ElSelect: true,
          ElInputNumber: true,
          ElButton: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Corrected attendance')
  })
})
