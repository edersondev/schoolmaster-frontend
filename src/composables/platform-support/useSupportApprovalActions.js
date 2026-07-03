import { computed, reactive, readonly } from 'vue'
import { platformSupportService } from '@/services/platform-support/platformSupportService'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'
import { hasPlatformSupportAccessFlag } from './usePlatformSupportAccess'

export function useSupportApprovalActions({ service = platformSupportService, access = null, onDecision = () => {} } = {}) {
  const state = reactive({
    reasonCode: '',
    feedback: null,
    pendingAction: '',
  })
  const canApprove = computed(() => hasPlatformSupportAccessFlag(access, 'hasSupportApprovalAccess'))
  const canRevoke = computed(() => hasPlatformSupportAccessFlag(access, 'hasSupportRevocationAccess'))

  function setReasonCode(reasonCode) {
    state.reasonCode = reasonCode
  }

  async function submit(action, decision) {
    if (!decision?.id) {
      state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.notFound }
      return null
    }
    if ((action === 'approve' && !canApprove.value) || (action === 'revoke' && !canRevoke.value)) {
      state.feedback = { type: PLATFORM_SUPPORT_FEEDBACK_STATES.forbidden }
      return null
    }
    state.pendingAction = action
    state.feedback = null
    try {
      const payload = { supportAccessId: decision.id, reasonCode: state.reasonCode || decision.reasonCode || action }
      const result =
        action === 'approve'
          ? await service.approveSupportAccess(payload)
          : await service.revokeSupportAccess(payload)
      onDecision(result)
      return result
    } catch (error) {
      state.feedback = error.feedback ?? { type: PLATFORM_SUPPORT_FEEDBACK_STATES.conflict }
      return null
    } finally {
      state.pendingAction = ''
    }
  }

  return {
    state,
    canApprove,
    canRevoke,
    setReasonCode,
    approve: (decision) => submit('approve', decision),
    revoke: (decision) => submit('revoke', decision),
    readonlyState: readonly(state),
  }
}
