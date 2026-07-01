import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TeacherWorkflowFeedbackState from '@/modules/teacher-workflow/components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '@/modules/teacher-workflow/components/TeacherWorkflowStatusControls.vue'

describe('teacher material shared components', () => {
  it('renders unsupported-contract feedback safely', () => {
    const wrapper = mount(TeacherWorkflowFeedbackState, {
      props: { feedback: { type: 'unsupported-contract', code: 'gate' } },
      global: { stubs: ['ElAlert', 'ElEmpty', 'ElButton', 'ElIcon'] },
    })
    expect(wrapper.find('el-alert-stub').attributes('title')).toBe('Contract support required')
  })

  it('emits lifecycle actions', async () => {
    const wrapper = mount(TeacherWorkflowStatusControls, {
      props: { status: 'active' },
      global: { stubs: ['ElTag', 'ElButton', 'ElTooltip'] },
    })
    await wrapper.findAll('el-button-stub')[1].trigger('click')
    expect(wrapper.emitted('deactivate')).toBeTruthy()
  })
})
