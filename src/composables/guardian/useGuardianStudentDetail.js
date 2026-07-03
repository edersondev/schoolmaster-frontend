import { computed, reactive, readonly } from 'vue'
import { guardianSelfServiceService } from '@/services/guardian/guardianSelfServiceService'
import { GUARDIAN_FEEDBACK_STATES } from '@/contracts/guardian/guardianSelfServiceContract'
import { useGuardianSelfServiceStaleGuard } from './useGuardianSelfServiceStaleGuard'
import { useGuardianWorkspaceContext } from './useGuardianWorkspaceContext'

export function useGuardianStudentDetail({
  route = {},
  context = null,
  service = guardianSelfServiceService,
} = {}) {
  const workspace = context ?? useGuardianWorkspaceContext()
  const staleGuard = useGuardianSelfServiceStaleGuard()
  const state = reactive({
    student: null,
    loading: false,
    feedback: null,
  })

  const studentProfileId = computed(() => route?.params?.studentProfileId ?? route?.studentProfileId ?? null)

  function requestParts() {
    return [workspace.schoolId, studentProfileId.value]
  }

  function gateFeedback() {
    if (!workspace.schoolId) return { type: GUARDIAN_FEEDBACK_STATES.noActiveSchool }
    if (workspace.safeNoGuardianLink) return { type: GUARDIAN_FEEDBACK_STATES.noGuardianLink }
    if (!studentProfileId.value) return { type: GUARDIAN_FEEDBACK_STATES.notFound }
    return null
  }

  async function load() {
    const blocked = gateFeedback()
    if (blocked) {
      state.student = null
      state.feedback = blocked
      return
    }

    state.loading = true
    state.feedback = { type: GUARDIAN_FEEDBACK_STATES.loading }
    const captured = staleGuard.capture(requestParts())
    try {
      const student = await service.getGuardianStudent(
        { studentProfileId: studentProfileId.value },
        { schoolId: workspace.schoolId },
      )
      if (!staleGuard.isCurrent(captured, requestParts())) return
      state.student = student
      state.feedback = null
    } catch (error) {
      state.student = null
      state.feedback = error?.type === GUARDIAN_FEEDBACK_STATES.forbidden ? { type: GUARDIAN_FEEDBACK_STATES.notFound } : error
    } finally {
      if (staleGuard.isCurrent(captured, requestParts())) state.loading = false
    }
  }

  return { state: readonly(state), studentProfileId, load }
}
