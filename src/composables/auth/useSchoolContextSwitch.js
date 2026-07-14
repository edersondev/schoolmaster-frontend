import { computed, readonly } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { authService } from '@/services/auth/authService'

export function useSchoolContextSwitch({ session = null, resetters = [] } = {}) {
  const store = session ?? useAuthSessionStore()
  const schoolOwnedStateResetters = new Set(resetters)

  function registerResetter(resetter) {
    if (typeof resetter !== 'function') {
      throw new TypeError('A school-owned state resetter must be a function.')
    }
    schoolOwnedStateResetters.add(resetter)
    return () => schoolOwnedStateResetters.delete(resetter)
  }

  async function switchSchool(schoolId, { service = authService } = {}) {
    return store.selectSchool(schoolId, {
      service,
      beforeSwitch: [...schoolOwnedStateResetters],
    })
  }

  const generation = computed(() => store.schoolContextGeneration)

  return {
    generation: readonly(generation),
    isSwitching: computed(() => store.status === 'selecting-school'),
    switchSchool,
    registerResetter,
    isCurrent: (capturedGeneration) => capturedGeneration === store.schoolContextGeneration,
  }
}
