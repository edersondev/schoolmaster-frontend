import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useClassSections } from '@/composables/admin-system/useClassSections'
import { classSection } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('useClassSections', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthSessionStore().activeSchool = { id: 'school-1' }
  })

  it('blocks list without current period and loads selected period', async () => {
    const route = reactive({ query: {} })
    const router = { push: vi.fn() }
    const sections = useClassSections({ route, router, autoLoad: false, listLoader: vi.fn().mockResolvedValue({ items: [classSection], meta: { page: 1, perPage: 25, total: 1 } }) })
    await sections.load()
    expect(sections.status.value).toBe('no-current-period')
    await sections.load({ academicPeriodId: 'period-1' })
    expect(sections.items.value).toHaveLength(1)
  })
})
