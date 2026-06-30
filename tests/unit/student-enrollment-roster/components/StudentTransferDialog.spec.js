import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import StudentTransferDialog from '@/components/admin-system/students/StudentTransferDialog.vue'

describe('StudentTransferDialog', () => {
  it('renders transfer fields without private source data', () => {
    const wrapper = mount(StudentTransferDialog, { attachTo: document.body, global: { plugins: [ElementPlus] }, props: { open: true, values: {} } })
    expect(wrapper.props('open')).toBe(true)
    expect(wrapper.text()).not.toContain('grade')
  })
})
