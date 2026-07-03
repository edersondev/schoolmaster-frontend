import { computed, reactive, readonly } from 'vue'
import { platformSupportService } from '@/services/platform-support/platformSupportService'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'
import { usePlatformSupportRequestGuards } from './usePlatformSupportRequestGuards'

export function usePlatformSchoolSummaries({ service = platformSupportService, access = null } = {}) {
  const guards = usePlatformSupportRequestGuards()
  const state = reactive({
    items: [],
    meta: { page: 1, perPage: 25, total: 0 },
    filters: { search: '', status: '', sort: '' },
    feedback: null,
    loading: false,
  })
  const emptyState = computed(() => {
    if (state.feedback) return state.feedback
    if (!state.loading && state.items.length === 0) return { type: PLATFORM_SUPPORT_FEEDBACK_STATES.empty }
    return null
  })

  function setPage(page) {
    state.meta.page = page
    return load()
  }

  function setFilters(filters = {}) {
    state.filters = { ...state.filters, ...filters }
    state.meta.page = 1
    return load()
  }

  async function load() {
    if (access && !access.hasOperationalOversightAccess?.value) {
      state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.forbidden }
      return null
    }
    const requestKey = guards.beginRequest(['school-summaries', state.meta.page, state.filters])
    state.loading = true
    state.feedback = null
    try {
      const result = await service.listPlatformSchoolSummaries({
        page: state.meta.page,
        perPage: state.meta.perPage,
        ...state.filters,
      })
      if (guards.ignoreIfStale(requestKey)) return null
      state.items = result.items
      state.meta = result.meta
      return result
    } catch (error) {
      state.feedback = error.feedback ?? { type: PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable }
      return null
    } finally {
      guards.clearRequest(requestKey)
      state.loading = false
    }
  }

  return { state, emptyState, guards, load, setPage, setFilters, readonlyState: readonly(state) }
}

