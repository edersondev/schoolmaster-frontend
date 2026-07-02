import { computed, reactive, readonly } from 'vue'
import { studentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'
import { useStudentSelfServiceStaleGuard } from './useStudentSelfServiceStaleGuard'
import { useStudentWorkspaceContext } from './useStudentWorkspaceContext'

const loadedLearningSets = reactive(new Map())

function scopedLearningSetKey(context = {}, id) {
  if (!context?.schoolId || !context?.studentProfileId || !context?.academicPeriodId || !id) return null
  return [
    context.schoolId,
    context.studentProfileId,
    context.academicPeriodId,
    id,
  ].join(':')
}

function cacheLearningSets(context, items = []) {
  items.forEach((item) => {
    const key = scopedLearningSetKey(context, item?.id)
    if (key) loadedLearningSets.set(key, item)
  })
}

export function findLoadedLearningSet(learningSetId, context = {}) {
  const key = scopedLearningSetKey(context, learningSetId)
  return key ? (loadedLearningSets.get(key) ?? null) : null
}

export function useLoadedLearningSetDetail(route = {}, context = null) {
  const workspace = context ?? useStudentWorkspaceContext()
  const learningSet = computed(() => findLoadedLearningSet(route?.params?.learningSetId, workspace))
  const feedback = computed(() =>
    learningSet.value ? null : { type: STUDENT_FEEDBACK_STATES.notFound },
  )
  return { learningSet, feedback }
}

export function useAssignedLearningSets({
  context = null,
  service = studentSelfServiceService,
  page = 1,
  perPage = 25,
} = {}) {
  const workspace = context ?? useStudentWorkspaceContext()
  const staleGuard = useStudentSelfServiceStaleGuard()
  const state = reactive({
    items: [],
    meta: { page, perPage, total: 0 },
    loading: false,
    feedback: null,
  })

  const isEmpty = computed(() => !state.loading && !state.feedback && state.items.length === 0)

  function requestParts() {
    return [workspace.schoolId, workspace.studentProfileId, workspace.academicPeriodId, state.meta.page, state.meta.perPage]
  }

  function gateFeedback() {
    if (!workspace.schoolId) return { type: STUDENT_FEEDBACK_STATES.noActiveSchool }
    if (!workspace.studentProfileId) return { type: STUDENT_FEEDBACK_STATES.noStudentProfile }
    if (!workspace.academicPeriodId) return { type: STUDENT_FEEDBACK_STATES.noCurrentPeriod }
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
    state.feedback = { type: STUDENT_FEEDBACK_STATES.loading }
    const captured = staleGuard.capture(requestParts())
    try {
      const result = await service.listAssignedLearningSets(
        {
          academicPeriodId: workspace.academicPeriodId,
          page: state.meta.page,
          perPage: state.meta.perPage,
        },
        { schoolId: workspace.schoolId },
      )
      if (!staleGuard.isCurrent(captured, requestParts())) return
      state.items = result.items ?? []
      state.meta = result.meta ?? state.meta
      cacheLearningSets(workspace, state.items)
      state.feedback = state.items.length === 0 ? { type: STUDENT_FEEDBACK_STATES.empty } : null
    } catch (error) {
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
    findLoadedLearningSet,
  }
}
