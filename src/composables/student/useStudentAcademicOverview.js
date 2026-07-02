import { computed, reactive, readonly } from 'vue'
import { studentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { STUDENT_FEEDBACK_STATES } from '@/contracts/student/studentSelfServiceContract'
import { useStudentSelfServiceStaleGuard } from './useStudentSelfServiceStaleGuard'
import { useStudentWorkspaceContext } from './useStudentWorkspaceContext'

function increment(map, key) {
  const safeKey = key || 'unavailable'
  map[safeKey] = (map[safeKey] ?? 0) + 1
}

export function createStudentAcademicOverviewSummary({
  learningSets = [],
  grades = [],
  attendance = [],
} = {}) {
  const gradeStatusCounts = {}
  const attendanceStatusCounts = {}
  let downloadableContentCount = 0
  let unavailableContentCount = 0

  learningSets.forEach((learningSet) => {
    ;(learningSet.entries ?? []).forEach((entry) => {
      if (!entry.contentItem) return
      if (entry.contentItem.downloadAvailable) downloadableContentCount += 1
      else unavailableContentCount += 1
    })
  })
  grades.forEach((record) => increment(gradeStatusCounts, record.status))
  attendance.forEach((record) => increment(attendanceStatusCounts, record.attendanceStatus ?? record.status))

  return {
    assignedLearningSetCount: learningSets.length,
    downloadableContentCount,
    unavailableContentCount,
    gradeStatusCounts,
    attendanceStatusCounts,
  }
}

export function useStudentAcademicOverview({
  context = null,
  service = studentSelfServiceService,
} = {}) {
  const workspace = context ?? useStudentWorkspaceContext()
  const staleGuard = useStudentSelfServiceStaleGuard()
  const state = reactive({
    learningSets: [],
    grades: [],
    attendance: [],
    loading: false,
    feedback: null,
  })

  const summary = computed(() =>
    createStudentAcademicOverviewSummary({
      learningSets: state.learningSets,
      grades: state.grades,
      attendance: state.attendance,
    }),
  )

  function gateFeedback() {
    if (!workspace.schoolId) return { type: STUDENT_FEEDBACK_STATES.noActiveSchool }
    if (!workspace.studentProfileId) return { type: STUDENT_FEEDBACK_STATES.noStudentProfile }
    if (!workspace.academicPeriodId) return { type: STUDENT_FEEDBACK_STATES.noCurrentPeriod }
    return null
  }

  async function load() {
    const blocked = gateFeedback()
    if (blocked) {
      state.feedback = blocked
      return
    }

    state.loading = true
    state.feedback = { type: STUDENT_FEEDBACK_STATES.loading }
    const parts = [workspace.schoolId, workspace.studentProfileId, workspace.academicPeriodId]
    const captured = staleGuard.capture(parts)
    try {
      const [learningSets, grades, attendance] = await Promise.all([
        service.listAssignedLearningSets(
          { academicPeriodId: workspace.academicPeriodId, page: 1, perPage: 100 },
          { schoolId: workspace.schoolId },
        ),
        service.listStudentGrades(
          { academicPeriodId: workspace.academicPeriodId, page: 1, perPage: 100 },
          { schoolId: workspace.schoolId },
        ),
        service.listStudentAttendance(
          { academicPeriodId: workspace.academicPeriodId, page: 1, perPage: 100 },
          { schoolId: workspace.schoolId },
        ),
      ])
      if (!staleGuard.isCurrent(captured, parts)) return
      state.learningSets = learningSets.items ?? []
      state.grades = grades.items ?? []
      state.attendance = attendance.items ?? []
      state.feedback =
        state.learningSets.length || state.grades.length || state.attendance.length
          ? null
          : { type: STUDENT_FEEDBACK_STATES.empty }
    } catch (error) {
      state.feedback = error
    } finally {
      if (staleGuard.isCurrent(captured, parts)) state.loading = false
    }
  }

  return { state: readonly(state), summary, load }
}
