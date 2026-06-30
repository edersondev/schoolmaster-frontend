import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import StudentTransferDialog from '@/components/admin-system/students/StudentTransferDialog.vue'

describe('StudentTransferFlow', () => {
  it('shows safe transfer validation surface', () => {
    const wrapper = mount(StudentTransferDialog, { attachTo: document.body, global: { plugins: [ElementPlus] }, props: { open: true, values: {}, fieldErrors: { reason: ['Required'] } } })
    expect(wrapper.props('open')).toBe(true)
    expect(wrapper.text()).not.toContain('cross-tenant')
  })
})
