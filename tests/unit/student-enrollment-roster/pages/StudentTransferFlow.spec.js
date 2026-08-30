import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import StudentTransferDialog from '@/components/admin-system/students/StudentTransferDialog.vue'
import { studentEnrollmentRosterI18n } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('StudentTransferFlow', () => {
  it('shows safe transfer validation surface', () => {
    const wrapper = mount(StudentTransferDialog, {
      attachTo: document.body,
      global: { plugins: [studentEnrollmentRosterI18n(), ElementPlus] },
      props: { open: true, values: {}, fieldErrors: { reason: ['Required'] } },
    })
    expect(wrapper.props('open')).toBe(true)
    expect(wrapper.text()).not.toContain('cross-tenant')
  })
})
