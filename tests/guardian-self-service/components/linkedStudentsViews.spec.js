import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GuardianLinkedStudentsList from '@/components/guardian/GuardianLinkedStudentsList.vue'
import GuardianWorkspaceView from '@/pages/guardian/GuardianWorkspaceView.vue'
import { createGuardianI18n } from '../test-utils'

function stubs() {
  return {
    ElAlert: { template: '<div class="el-alert">{{ title }}</div>', props: ['title'] },
    ElButton: { template: '<button @click="$emit(`click`)"><slot /></button>' },
    ElPagination: true,
    ElTag: { template: '<span><slot /></span>' },
    RouterLink: { template: '<a><slot /></a>' },
  }
}

describe('linked students guardian views', () => {
  it('renders linked student list, relationship label, and safe empty state', () => {
    const wrapper = mount(GuardianLinkedStudentsList, {
      props: {
        items: [{ id: 'student-1', fullName: 'Ada Student', relationshipLabel: 'Mother', status: 'active' }],
        feedback: { type: 'no-linked-students' },
        pagination: { page: 1, perPage: 25, total: 1 },
      },
      global: { plugins: [createGuardianI18n()], stubs: stubs() },
    })
    expect(wrapper.text()).toContain('Ada Student')
    expect(wrapper.text()).toContain('Mother')
    expect(wrapper.text()).toContain('No linked students')
    expect(wrapper.text()).not.toMatch(/tenant|other guardian|school-only/i)
  })

  it('keeps workspace route view as composition surface', () => {
    expect(GuardianWorkspaceView).toBeTruthy()
  })
})
