import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import ClassSectionForm from '@/components/admin-system/class-sections/ClassSectionForm.vue'

describe('ClassSectionForm', () => {
  it('renders approved metadata fields', () => {
    const wrapper = mount(ClassSectionForm, {
      global: { plugins: [ElementPlus] },
      props: {
        modelValue: {},
        periodOptions: [{ academicPeriodId: 'period-1', label: 'Term 1' }],
        metadataOptions: {
          course: ['Mathematics'],
          classroom: ['Room 101'],
          section: ['Grade 1'],
          group: ['Morning'],
        },
      },
    })
    expect(wrapper.text()).toContain('Code')
    expect(wrapper.text()).toContain('Course')
    expect(wrapper.text()).not.toContain('Status')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.findAll('.el-select')).toHaveLength(5)
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['grid', 'grid-cols-1', 'sm:grid-cols-2']),
    )
  })
})
