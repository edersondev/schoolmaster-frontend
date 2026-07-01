import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import StudentProfileForm from '@/components/admin-system/students/StudentProfileForm.vue'

describe('StudentProfileForm', () => {
  it('emits submit and shows approved fields', async () => {
    const wrapper = mount(StudentProfileForm, { global: { plugins: [ElementPlus] }, props: { modelValue: {} } })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.text()).toContain('Registration number')
  })
})
