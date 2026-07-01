import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AdminLifecycleConfirmDialog from '@/components/ui/admin/AdminLifecycleConfirmDialog.vue'

describe('AdminLifecycleConfirmDialog', () => {
  it('binds the effective date picker to effectiveEndDate', async () => {
    const values = { effectiveEndDate: '', reason: '' }
    const wrapper = mount(AdminLifecycleConfirmDialog, {
      global: {
        stubs: {
          ElDialog: { template: '<section><slot /><slot name="footer" /></section>' },
          ElDatePicker: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<button data-test="date-picker" @click="$emit(\'update:modelValue\', \'2026-02-01\')" />',
          },
          ElInput: true,
          ElAlert: true,
          ElButton: true,
        },
      },
      props: {
        open: true,
        values,
      },
    })

    await wrapper.find('[data-test="date-picker"]').trigger('click')

    expect(values.effectiveEndDate).toBe('2026-02-01')
    expect(values).not.toHaveProperty('effectiveAt')
  })
})
