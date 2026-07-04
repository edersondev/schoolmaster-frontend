import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FileResponseSelector from '@/components/assessments/FileResponseSelector.vue'
import { advancedQuestionnaire, componentGlobal } from '../fixtures/advancedAssessmentFixtures'

describe('FileResponseSelector', () => {
  it('renders final-submit file selection without upload action', () => {
    const wrapper = mount(FileResponseSelector, { props: { question: advancedQuestionnaire.questions[1] }, global: componentGlobal })
    expect(wrapper.text()).toContain('Upload evidence')
    expect(wrapper.text()).toContain('Select file')
  })
})
