import { mount, shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AssignedLearningSetList from '@/components/student/AssignedLearningSetList.vue'
import StudentLearningSetEntryList from '@/components/student/StudentLearningSetEntryList.vue'
import StudentFeedbackState from '@/components/student/StudentFeedbackState.vue'
import { createStudentI18n } from '../test-utils'

const global = {
  plugins: [createStudentI18n()],
  stubs: {
    ElAlert: true,
    ElButton: true,
    ElPagination: true,
    ElTag: true,
    StudentContentDownloadAction: true,
  },
}

describe('assigned learning-set views', () => {
  it('renders assigned learning sets with pagination and open event', async () => {
    const wrapper = mount(AssignedLearningSetList, {
      props: {
        items: [{ id: 'set-1', title: 'Algebra set', status: 'published', entries: [] }],
        pagination: { page: 1, perPage: 25, total: 1 },
      },
      global,
    })
    expect(wrapper.text()).toContain('Algebra set')
    await wrapper.findComponent({ name: 'ElButton' }).trigger('click')
    expect(wrapper.emitted('open')?.[0]?.[0]).toMatchObject({ id: 'set-1' })
  })

  it('renders ordered entries and read-only questionnaire state', () => {
    const wrapper = shallowMount(StudentLearningSetEntryList, {
      props: {
        entries: [
          { entryReferenceId: 'content-1', sequence: 2, title: 'Content', entryType: 'content_item', contentItem: { id: 'c1', downloadAvailable: true } },
          { entryReferenceId: 'questionnaire-1', sequence: 1, title: 'Warmup', entryType: 'questionnaire' },
        ],
      },
      global,
    })
    expect(wrapper.text().indexOf('Warmup')).toBeLessThan(wrapper.text().indexOf('Content'))
    expect(wrapper.find('el-alert-stub').attributes('title')).toBe(
      'Questionnaire entry is read-only in this workspace.',
    )
  })

  it('shows no-active-school, no-current-period, no-student-profile, and not-found feedback', () => {
    ;['no-active-school', 'no-current-period', 'no-student-profile', 'not-found'].forEach((type) => {
      const wrapper = mount(StudentFeedbackState, {
        props: { feedback: { type } },
        global,
      })
      expect(wrapper.findComponent({ name: 'ElAlert' }).exists()).toBe(true)
    })
  })
})
