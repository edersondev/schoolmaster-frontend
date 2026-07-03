import { computed, onUnmounted, reactive, readonly } from 'vue'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'

export function useSupportDecisionRefresh({ decisionState, diagnostics = null, intervalMs = 60000, announce = () => {} } = {}) {
  const state = reactive({
    enabled: false,
    lastRefreshedAt: null,
    pending: false,
    feedback: null,
  })
  let timer = null
  const shouldRefresh = computed(() =>
    Boolean(decisionState?.state?.decision?.id && ['requested', 'pending', 'approved'].includes(decisionState.state.decision.state)),
  )

  async function refreshNow() {
    const decision = decisionState?.state?.decision
    if (!decision?.id || !decisionState?.loadDecision) return null
    state.pending = true
    state.feedback = null
    try {
      const refreshed = await decisionState.loadDecision(decision.id)
      state.lastRefreshedAt = new Date().toISOString()
      if (!refreshed?.diagnosticsAvailable && diagnostics?.clear) {
        diagnostics.clear()
        state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.diagnosticsUnavailable }
        announce('platformSupport.refresh.diagnosticsRemoved')
      }
      return refreshed
    } finally {
      state.pending = false
    }
  }

  function start() {
    if (!shouldRefresh.value || timer) return
    state.enabled = true
    timer = setInterval(refreshNow, intervalMs)
  }

  function stop() {
    if (timer) clearInterval(timer)
    timer = null
    state.enabled = false
  }

  onUnmounted(stop)

  return { state: readonly(state), shouldRefresh, refreshNow, start, stop }
}

