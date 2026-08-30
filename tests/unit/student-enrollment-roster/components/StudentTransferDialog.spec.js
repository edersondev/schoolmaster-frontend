import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import StudentTransferDialog from '@/components/admin-system/students/StudentTransferDialog.vue'
import { studentEnrollmentRosterI18n } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('StudentTransferDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders transfer fields without private source data', async () => {
    const wrapper = mount(StudentTransferDialog, {
      attachTo: document.body,
      global: { plugins: [studentEnrollmentRosterI18n(), ElementPlus] },
      props: { open: true, values: {} },
    })
    await nextTick()
    expect(wrapper.props('open')).toBe(true)
    expect(document.body.querySelector('.el-form.el-form--label-top')).not.toBeNull()
    expect(wrapper.text()).not.toContain('grade')
  })
})
