import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LongTextAnswerEntry from '@/components/assessments/LongTextAnswerEntry.vue'
import { advancedQuestionnaire, componentGlobal } from '../fixtures/advancedAssessmentFixtures'

describe('LongTextAnswerEntry', () => {
  it('renders plain text entry and rejects blank values', () => {
    const wrapper = mount(LongTextAnswerEntry, { props: { question: advancedQuestionnaire.questions[0], modelValue: '   ' }, global: componentGlobal })
    expect(wrapper.text()).toContain('Explain')
    expect(wrapper.html()).not.toContain('v-html')
  })
})
