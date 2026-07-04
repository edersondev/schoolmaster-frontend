import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StudentResponseSubmitStatus from '@/components/assessments/StudentResponseSubmitStatus.vue'
import { componentGlobal } from '../fixtures/advancedAssessmentFixtures'

describe('student advanced response page states', () => {
  it('renders submitted and due-date safe feedback', () => {
    expect(mount(StudentResponseSubmitStatus, { props: { submitted: true }, global: componentGlobal }).text()).toContain('Submitted')
    expect(mount(StudentResponseSubmitStatus, { props: { dueDatePassed: true }, global: componentGlobal }).text()).toContain('Due date passed')
  })
})
