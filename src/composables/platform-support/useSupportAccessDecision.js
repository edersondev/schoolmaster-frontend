import { computed, reactive, readonly } from 'vue'
import { platformSupportService } from '@/services/platform-support/platformSupportService'
import {
  PLATFORM_SUPPORT_FEEDBACK_STATES,
  SUPPORT_ACCESS_DECISION_STATES,
} from '@/contracts/platform-support/platformSupportContract'
import { usePlatformSupportRequestGuards } from './usePlatformSupportRequestGuards'

export function useSupportAccessDecision({ service = platformSupportService, access = null } = {}) {
  const guards = usePlatformSupportRequestGuards()
  const state = reactive({
    draft: { targetSchoolId: '', reasonCode: '', purpose: '', correlationId: '' },
    decision: null,
    feedback: null,
    loading: false,
    submitting: false,
  })
  const canSubmit = computed(() =>
    Boolean(
      state.draft.targetSchoolId &&
      state.draft.reasonCode &&
      state.draft.purpose &&
      state.draft.correlationId &&
      (!access || access.hasSupportAccess?.value),
    ),
  )
  const diagnosticsBlocked = computed(() => !state.decision?.diagnosticsAvailable)

  function updateDraft(patch = {}) {
    state.draft = { ...state.draft, ...patch }
  }

  async function requestAccess() {
    if (!canSubmit.value) {
      state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.validation }
      return null
    }
    state.submitting = true
    state.feedback = null
    try {
      const result = await service.requestSupportAccess(state.draft)
      state.decision = result
      return result
    } catch (error) {
      state.feedback = error.feedback ?? { type: PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable }
      return null
    } finally {
      state.submitting = false
    }
  }

  async function loadDecision(supportAccessId) {
    if (!supportAccessId) return null
    const requestKey = guards.beginRequest(['decision', supportAccessId])
    state.loading = true
    state.feedback = null
    try {
      const result = await service.getSupportAccessDecision({ supportAccessId })
      if (guards.ignoreIfStale(requestKey)) return null
      state.decision = result
      return result
    } catch (error) {
      state.feedback = error.feedback ?? { type: PLATFORM_SUPPORT_FEEDBACK_STATES.temporaryUnavailable }
      return null
    } finally {
      guards.clearRequest(requestKey)
      state.loading = false
    }
  }

  function applyDecision(decision) {
    state.decision = decision
  }

  return {
    state,
    canSubmit,
    diagnosticsBlocked,
    decisionStates: SUPPORT_ACCESS_DECISION_STATES,
    guards,
    updateDraft,
    requestAccess,
    loadDecision,
    applyDecision,
    readonlyState: readonly(state),
  }
}

