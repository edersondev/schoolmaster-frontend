import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LearningSetForm from '@/modules/teacher-workflow/components/LearningSetForm.vue'

describe('LearningSetForm', () => {
  it('keeps create disabled while roster-aware contract is missing', () => {
    const wrapper = mount(LearningSetForm, {
      props: { modelValue: { title: '' }, disabled: true },
      global: { stubs: ['ElAlert', 'ElFormItem', 'ElInput', 'ElButton'] },
    })
    expect(wrapper.find('el-alert-stub').attributes('title')).toBe('Learning-set create blocked')
  })
})
