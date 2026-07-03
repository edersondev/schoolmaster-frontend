import { computed, reactive, readonly } from 'vue'
import { platformSupportService } from '@/services/platform-support/platformSupportService'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'
import { hasPlatformSupportAccessFlag } from './usePlatformSupportAccess'
import { usePlatformSupportRequestGuards } from './usePlatformSupportRequestGuards'

export function usePlatformReportingOverview({ service = platformSupportService, access = null } = {}) {
  const guards = usePlatformSupportRequestGuards()
  const state = reactive({
    overview: null,
    feedback: null,
    loading: false,
  })
  const summaryGroups = computed(() => {
    const overview = state.overview ?? {}
    return [
      { key: 'health', values: overview.health ?? {} },
      { key: 'lifecycle', values: overview.lifecycle ?? {} },
    ]
  })

  async function load(query = {}) {
    if (!hasPlatformSupportAccessFlag(access, 'hasReportingOverviewAccess')) {
      state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.forbidden }
      return null
    }
    const requestKey = guards.beginRequest(['reporting-overview', query])
    state.loading = true
    state.feedback = null
    try {
      const result = await service.getPlatformReportingOverview(query)
      if (guards.ignoreIfStale(requestKey)) return null
      state.overview = result
      return result
    } catch (error) {
      state.feedback = error.feedback ?? { type: PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable }
      return null
    } finally {
      guards.clearRequest(requestKey)
      state.loading = false
    }
  }

  return { state, summaryGroups, guards, load, readonlyState: readonly(state) }
}
