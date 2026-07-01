import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import ClassSectionForm from '@/components/admin-system/class-sections/ClassSectionForm.vue'

describe('ClassSectionForm', () => {
  it('renders approved metadata fields', () => {
    const wrapper = mount(ClassSectionForm, { global: { plugins: [ElementPlus] }, props: { modelValue: {} } })
    expect(wrapper.text()).toContain('Code')
    expect(wrapper.text()).toContain('Course')
    expect(wrapper.text()).not.toContain('Status')
  })
})
