import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ClassSectionDetailPage from '@/pages/admin-system/class-sections/ClassSectionDetailPage.vue'

const mocks = vi.hoisted(() => ({
  useRosterMemberships: vi.fn(),
  loadDetail: vi.fn().mockResolvedValue({ id: 'section-1' }),
  save: vi.fn().mockResolvedValue({ id: 'section-1' }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { classSectionId: 'section-1' },
    query: { academicPeriodId: 'period-1' },
  }),
}))

vi.mock('@/stores/auth/sessionStore', () => ({
  useAuthSessionStore: () => ({ activeSchool: { id: 'school-1' } }),
}))

vi.mock('@/composables/admin-system/useClassSections', () => ({
  useClassSections: () => ({
    status: { value: 'ready' },
    error: { value: null },
    detail: { value: { id: 'section-1' } },
    fieldErrors: { value: {} },
    form: {},
    loadDetail: mocks.loadDetail,
    save: mocks.save,
  }),
}))

vi.mock('@/composables/admin-system/useRosterMemberships', () => ({
  useRosterMemberships: mocks.useRosterMemberships,
}))

describe('ClassSectionDetailPage', () => {
  it('constructs roster memberships with the active school service context', () => {
    mocks.useRosterMemberships.mockReturnValue({
      items: { value: [] },
      fieldErrors: { value: {} },
      batch: { studentProfileIds: [] },
      selectedMembershipIds: { value: [] },
      load: vi.fn().mockResolvedValue(undefined),
      submitAdd: vi.fn().mockResolvedValue(undefined),
      submitEnd: vi.fn().mockResolvedValue(undefined),
      setMembershipSelection: vi.fn(),
    })

    mount(ClassSectionDetailPage, {
      global: {
        stubs: [
          'AdminSafeFeedbackState',
          'ClassSectionSummaryPanel',
          'ClassSectionForm',
          'RosterMembershipTable',
          'RosterMembershipBatchPanel',
        ],
      },
    })

    const options = mocks.useRosterMemberships.mock.calls[0][0]
    expect(options.serviceOptions()).toEqual({ schoolId: 'school-1' })
  })
})
