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
          ElButton: true,
        },
      },
    })
    expect(wrapper.text()).toContain('Current value')
  })
})
