import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useAcademicPeriodScope } from '@/composables/admin-system/useAcademicPeriodScope'
import { academicPeriod } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('useAcademicPeriodScope', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthSessionStore().activeSchool = { id: 'school-1' }
  })

  it('defaults to current period and persists route query', async () => {
    const route = reactive({ query: {} })
    const router = {
      push: vi.fn(),
      replace: vi.fn(async ({ query }) => Object.assign(route.query, query)),
    }
    const scope = useAcademicPeriodScope({
      route,
      router,
      loader: vi
        .fn()
        .mockResolvedValue({ items: [academicPeriod], meta: { page: 1, perPage: 25, total: 1 } }),
    })
    await nextTick()
    await scope.load()
    expect(scope.currentPeriod.value.academicPeriodId).toBe('period-1')
    expect(router.replace).toHaveBeenCalled()
  })

  it('preserves a routed academic period during initial tenant load', async () => {
    const route = reactive({ query: { academicPeriodId: 'period-2' } })
    const router = {
      push: vi.fn(),
      replace: vi.fn(async ({ query }) => Object.assign(route.query, query)),
    }
    const loader = vi.fn().mockResolvedValue({
      items: [
        academicPeriod,
        { ...academicPeriod, id: 'period-2', name: '2026 Term 2', is_current: false },
      ],
      meta: { page: 1, perPage: 25, total: 2 },
    })

    const scope = useAcademicPeriodScope({ route, router, loader })
    await nextTick()
    await Promise.resolve()

    expect(scope.selectedAcademicPeriodId.value).toBe('period-2')
    expect(scope.selectedPeriod.value.academicPeriodId).toBe('period-2')
    expect(router.replace).not.toHaveBeenCalled()
  })
})
