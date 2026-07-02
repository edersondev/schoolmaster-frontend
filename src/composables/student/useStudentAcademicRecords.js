import { computed, reactive, readonly } from 'vue'
import { studentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'
import { useStudentSelfServiceStaleGuard } from './useStudentSelfServiceStaleGuard'
import { useStudentWorkspaceContext } from './useStudentWorkspaceContext'

const recordCaches = {
  grades: reactive(new Map()),
  attendance: reactive(new Map()),
}

function scopedRecordKey(context = {}, id) {
  if (!context?.schoolId || !context?.studentProfileId || !context?.academicPeriodId || !id) return null
  return [
    context.schoolId,
    context.studentProfileId,
    context.academicPeriodId,
    id,
  ].join(':')
}

function cacheRecords(type, context, items = []) {
  items.forEach((item) => {
    const key = scopedRecordKey(context, item?.id)
    if (key) recordCaches[type].set(key, item)
  })
}

export function findLoadedAcademicRecord(type, id, context = {}) {
  const key = scopedRecordKey(context, id)
  return key ? (recordCaches[type]?.get(key) ?? null) : null
}

export function useLoadedAcademicRecordDetail(type, route = {}, context = null) {
  const workspace = context ?? useStudentWorkspaceContext()
  const key = type === 'grades' ? 'gradeId' : 'attendanceId'
  const record = computed(() => findLoadedAcademicRecord(type, route?.params?.[key], workspace))
  const feedback = computed(() =>
    record.value ? null : { type: STUDENT_FEEDBACK_STATES.notFound },
  )
  return { record, feedback }
}

export function useStudentAcademicRecords({
  type,
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
  const loader =
    type === 'attendance' ? service.listStudentAttendance : service.listStudentGrades

  function requestParts() {
    return [type, workspace.schoolId, workspace.studentProfileId, workspace.academicPeriodId, state.meta.page, state.meta.perPage]
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
      const result = await loader(
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
      cacheRecords(type, workspace, state.items)
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

  return { state: readonly(state), isEmpty, load, setPage }
}

export const useStudentGrades = (options = {}) => useStudentAcademicRecords({ ...options, type: 'grades' })
export const useStudentAttendance = (options = {}) =>
  useStudentAcademicRecords({ ...options, type: 'attendance' })
