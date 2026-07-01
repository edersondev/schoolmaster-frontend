import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useTeacherAssignments } from '@/composables/admin-system/useTeacherAssignments'
import { teacherAssignment } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('useTeacherAssignments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthSessionStore().activeSchool = { id: 'school-1' }
  })

  it('requires academic period and supports admin assignment list', async () => {
    const route = reactive({ query: {} })
    const assignments = useTeacherAssignments({ route, router: { push: vi.fn() }, autoLoad: false, listLoader: vi.fn().mockResolvedValue({ items: [teacherAssignment], meta: { page: 1, perPage: 25, total: 1 } }) })
    await assignments.load()
    expect(assignments.status.value).toBe('no-current-period')
    await assignments.load({ academicPeriodId: 'period-1' })
    expect(assignments.items.value[0].id).toBe('assignment-1')
  })
})
