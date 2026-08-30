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
    const sections = useClassSections({
      route,
      router,
      autoLoad: false,
      listLoader: vi
        .fn()
        .mockResolvedValue({ items: [classSection], meta: { page: 1, perPage: 25, total: 1 } }),
    })
    await sections.load()
    expect(sections.status.value).toBe('no-current-period')
    await sections.load({ academicPeriodId: 'period-1' })
    expect(sections.items.value).toHaveLength(1)
  })

  it('exposes pending state while saving class-section forms', async () => {
    let resolveCreate
    const createLoader = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve
        }),
    )
    const sections = useClassSections({
      route: reactive({ query: {} }),
      router: { push: vi.fn() },
      autoLoad: false,
      createLoader,
    })
    Object.assign(sections.form, {
      academicPeriodId: 'period-1',
      code: 'MATH-1',
      name: 'Math 1',
    })

    const saving = sections.save()

    expect(sections.pending.value).toBe(true)
    resolveCreate(classSection)
    await expect(saving).resolves.toEqual(classSection)
    expect(sections.pending.value).toBe(false)
  })
})
