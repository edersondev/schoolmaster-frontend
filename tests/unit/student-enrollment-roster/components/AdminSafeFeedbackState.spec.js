import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

describe('AdminSafeFeedbackState', () => {
  it('renders safe feedback states', () => {
    const wrapper = mount(AdminSafeFeedbackState, { global: { plugins: [ElementPlus] }, props: { state: 'conflict', feedback: { code: 'dependency_conflict' } } })
    expect(wrapper.text()).toContain('Conflict')
  })
})
