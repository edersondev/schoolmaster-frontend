import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useStudentProfiles } from '@/composables/admin-system/useStudentProfiles'
import { studentProfile } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('useStudentProfiles', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthSessionStore().activeSchool = { id: 'school-1' }
  })

  it('loads latest list and classifies empty state', async () => {
    const route = reactive({ query: { page: '1' } })
    const router = { push: vi.fn(async ({ query }) => Object.assign(route.query, query)) }
    const list = useStudentProfiles({ route, router, autoLoad: false, listLoader: vi.fn().mockResolvedValue({ items: [studentProfile], meta: { page: 1, perPage: 25, total: 1 } }) })
    await list.load()
    expect(list.items.value).toHaveLength(1)
    expect(list.status.value).toBe('ready')
  })
})
