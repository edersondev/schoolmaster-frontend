import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import StudentProfilesPage from '@/pages/admin-system/students/StudentProfilesPage.vue'

vi.mock('@/composables/admin-system/useStudentProfiles', () => ({
  useStudentProfiles: () => ({
    items: { value: [] },
    meta: { value: { page: 1, perPage: 25, total: 0 } },
    status: { value: 'empty' },
    error: { value: null },
    query: { value: {} },
    updateQuery: vi.fn(),
    load: vi.fn(),
    resetFilters: vi.fn(),
  }),
}))
vi.mock('@/composables/admin-system/useStudentEnrollmentRosterPermissions', () => ({
  useStudentEnrollmentRosterPermissions: () => ({ canManageStudents: { value: true } }),
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('StudentProfilesPage', () => {
  it('renders list route shell and no edit controls', () => {
    const wrapper = shallowMount(StudentProfilesPage)
    expect(wrapper.text()).toContain('Student profiles')
    expect(wrapper.text()).not.toContain('Edit')
  })
})
