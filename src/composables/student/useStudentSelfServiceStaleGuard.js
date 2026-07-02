import { shallowRef } from 'vue'
import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'

export function useStudentSelfServiceStaleGuard() {
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
    return { type: STUDENT_FEEDBACK_STATES.staleResponse }
  }

  return { currentKey, capture, isCurrent, invalidate }
}
