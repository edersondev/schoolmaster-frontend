import { computed, reactive, readonly } from 'vue'
import { guardianSelfServiceService } from '@/services/guardian/guardianSelfServiceService'
import { GUARDIAN_FEEDBACK_STATES } from '@/contracts/guardian/guardianSelfServiceContract'
import { useGuardianSelfServiceStaleGuard } from './useGuardianSelfServiceStaleGuard'
import { useGuardianWorkspaceContext } from './useGuardianWorkspaceContext'

const loadedStudents = reactive(new Map())

function scopedStudentKey(context = {}, id) {
  if (!context?.schoolId || !id) return null
  return [context.schoolId, id].join(':')
}

function cacheStudents(context, items = []) {
  items.forEach((item) => {
    const key = scopedStudentKey(context, item?.id)
    if (key) loadedStudents.set(key, item)
  })
}

export function findLoadedGuardianStudent(studentProfileId, context = {}) {
  const key = scopedStudentKey(context, studentProfileId)
  return key ? (loadedStudents.get(key) ?? null) : null
}

export function useGuardianLinkedStudents({
  context = null,
  service = guardianSelfServiceService,
  page = 1,
  perPage = 25,
} = {}) {
  const workspace = context ?? useGuardianWorkspaceContext()
  const staleGuard = useGuardianSelfServiceStaleGuard()
  const state = reactive({
    items: [],
    meta: { page, perPage, total: 0 },
    loading: false,
    feedback: null,
  })

  const isEmpty = computed(() => !state.loading && state.feedback?.type === GUARDIAN_FEEDBACK_STATES.noLinkedStudents)

  function requestParts() {
    return [workspace.schoolId, state.meta.page, state.meta.perPage]
  }

  function gateFeedback() {
    if (!workspace.schoolId) return { type: GUARDIAN_FEEDBACK_STATES.noActiveSchool }
    if (workspace.safeNoGuardianLink) return { type: GUARDIAN_FEEDBACK_STATES.noGuardianLink }
    return null
  }

  async function load() {
    const blocked = gateFeedback()
    if (blocked) {
      state.items = []
      state.feedback = blocked
      return
    }

    state.loading = true
    state.feedback = { type: GUARDIAN_FEEDBACK_STATES.loading }
    const captured = staleGuard.capture(requestParts())
    try {
      const result = await service.listGuardianStudents(
        { page: state.meta.page, perPage: state.meta.perPage },
        { schoolId: workspace.schoolId },
      )
      if (!staleGuard.isCurrent(captured, requestParts())) return
      state.items = result.items ?? []
      state.meta = result.meta ?? state.meta
      cacheStudents(workspace, state.items)
      state.feedback = state.items.length === 0 ? { type: GUARDIAN_FEEDBACK_STATES.noLinkedStudents } : null
    } catch (error) {
      state.items = []
      state.feedback = error
    } finally {
      if (staleGuard.isCurrent(captured, requestParts())) state.loading = false
    }
  }

  function setPage(nextPage) {
    state.meta.page = Number(nextPage) || 1
    return load()
  }

  return {
    state: readonly(state),
    isEmpty,
    load,
    setPage,
    findLoadedGuardianStudent,
  }
}
