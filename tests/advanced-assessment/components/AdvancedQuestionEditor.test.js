import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AdvancedQuestionEditor from '@/components/assessments/AdvancedQuestionEditor.vue'
import { advancedQuestionnaire, componentGlobal } from '../fixtures/advancedAssessmentFixtures'

describe('AdvancedQuestionEditor', () => {
  it('renders approved advanced controls without unsupported question types', () => {
    const wrapper = mount(AdvancedQuestionEditor, { props: { question: advancedQuestionnaire.questions[0] }, global: componentGlobal })
    expect(wrapper.text()).toContain('Long text')
    expect(wrapper.text()).toContain('File response')
    expect(wrapper.text()).not.toContain('Rating')
  })
})
