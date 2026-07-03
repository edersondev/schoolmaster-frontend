import { shallowRef } from 'vue'
import { GUARDIAN_FEEDBACK_STATES } from '@/contracts/guardian/guardianSelfServiceContract'

export function useGuardianSelfServiceStaleGuard() {
  const currentKey = shallowRef(0)

  function capture(parts = []) {
    currentKey.value += 1
    return {
      id: currentKey.value,
      signature: JSON.stringify(parts),
    }
  }

  function isCurrent(captured, parts = null) {
    if (!captured || captured.id !== currentKey.value) return false
    return parts === null || captured.signature === JSON.stringify(parts)
  }

  function invalidate() {
    currentKey.value += 1
    return { type: GUARDIAN_FEEDBACK_STATES.staleResponse }
  }

  return { currentKey, capture, isCurrent, invalidate }
}
