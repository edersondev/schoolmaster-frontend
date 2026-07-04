import { computed, reactive, readonly } from 'vue'
import { platformSupportService } from '@/services/platform-support/platformSupportService'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'
import { hasPlatformSupportAccessFlag } from './usePlatformSupportAccess'
import { usePlatformSupportRequestGuards } from './usePlatformSupportRequestGuards'

export function useSupportDiagnostics({ service = platformSupportService, access = null } = {}) {
  const guards = usePlatformSupportRequestGuards()
  const state = reactive({
    diagnostics: null,
    feedback: null,
    loading: false,
  })
  const redactionState = computed(() => ({
    redactedFields: state.diagnostics?.redactedFields ?? [],
    suppressed: state.diagnostics?.suppressed ?? [],
  }))

  function canLoad(decision, schoolId = decision?.targetSchoolId) {
    return Boolean(
      schoolId &&
      decision?.id &&
      decision?.targetSchoolId === schoolId &&
      decision?.diagnosticsAvailable &&
      hasPlatformSupportAccessFlag(access, 'hasSupportDrillDownAccess'),
    )
  }

  async function load({ schoolId, decision } = {}) {
    if (!canLoad(decision, schoolId)) {
      state.diagnostics = null
      state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.diagnosticsUnavailable }
      return null
    }
    const requestKey = guards.beginRequest(['diagnostics', schoolId, decision.id])
    state.loading = true
    state.feedback = null
    try {
      const result = await service.getSupportSchoolDiagnostics({ schoolId, supportAccessId: decision.id })
      if (guards.ignoreIfStale(requestKey)) return null
      state.diagnostics = result
      return result
    } catch (error) {
      state.diagnostics = null
      state.feedback = error.feedback ?? { type: PLATFORM_SUPPORT_FEEDBACK_STATES.diagnosticsUnavailable }
      return null
    } finally {
      guards.clearRequest(requestKey)
      state.loading = false
    }
  }

  function clear() {
    state.diagnostics = null
  }

  return { state, redactionState, guards, canLoad, load, clear, readonlyState: readonly(state) }
}
