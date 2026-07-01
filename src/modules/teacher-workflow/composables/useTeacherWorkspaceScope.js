import { computed, reactive, readonly, watch } from 'vue'
import { listAcademicPeriods } from '@/services/admin-system/academic-periods'
import { listClassSectionMemberships } from '@/services/admin-system/classroomRoster'
import { listTeacherAssignments } from '@/services/admin-system/teacherAssignments'
import { TEACHER_WORKFLOW_FEEDBACK_STATES } from '../services/teacherWorkflowFeedbackMapper'
import { useTeacherWorkflowStaleGuard } from './useTeacherWorkflowStaleGuard'

function routeValue(route, key) {
  const value = route?.query?.[key]
  return Array.isArray(value) ? value[0] : value
}

export function useTeacherWorkspaceScope({
  route = null,
  router = null,
  session = null,
  services = {},
} = {}) {
  const academicPeriodsService = services.listAcademicPeriods ?? listAcademicPeriods
  const assignmentsService = services.listTeacherAssignments ?? listTeacherAssignments
  const membershipsService = services.listClassSectionMemberships ?? listClassSectionMemberships
  const staleGuard = useTeacherWorkflowStaleGuard()

  const state = reactive({
    loading: false,
    feedback: null,
    schoolId: session?.activeSchool?.id ?? session?.activeSchoolId ?? null,
    academicPeriods: [],
    teacherAssignments: [],
    memberships: [],
    selectedAcademicPeriodId: routeValue(route, 'academicPeriodId') ?? null,
    selectedClassSectionId: routeValue(route, 'classSectionId') ?? routeValue(route, 'rosterId') ?? null,
  })

  const currentAcademicPeriod = computed(
    () =>
      state.academicPeriods.find((period) => period.id === state.selectedAcademicPeriodId) ??
      state.academicPeriods.find((period) => period.status === 'active' || period.is_current === true) ??
      state.academicPeriods[0] ??
      null,
  )

  const activeTeacherAssignments = computed(() =>
    state.teacherAssignments.filter((assignment) => (assignment.status ?? 'active') === 'active'),
  )

  const selectedTeacherAssignment = computed(() =>
    activeTeacherAssignments.value.find(
      (assignment) =>
        assignment.classSectionId === state.selectedClassSectionId ||
        assignment.class_section_id === state.selectedClassSectionId,
    ) ?? activeTeacherAssignments.value[0] ?? null,
  )

  const eligibleStudentProfileIds = computed(() =>
    state.memberships
      .filter((membership) => (membership.status ?? 'active') === 'active')
      .map((membership) => membership.studentProfileId ?? membership.student_profile_id)
      .filter(Boolean),
  )

  const scopeStatus = computed(() => {
    if (!state.schoolId) return 'missing-school'
    if (!currentAcademicPeriod.value) return 'missing-academic-period'
    if (!selectedTeacherAssignment.value) return 'missing-teacher-roster'
    return 'ready'
  })

  function syncRouteQuery() {
    if (!router?.replace || !route) return
    const query = {
      ...route.query,
      academicPeriodId: state.selectedAcademicPeriodId || undefined,
      classSectionId: state.selectedClassSectionId || undefined,
    }
    router.replace({ query })
  }

  function setScope({ academicPeriodId, classSectionId } = {}) {
    if (academicPeriodId !== undefined) state.selectedAcademicPeriodId = academicPeriodId
    if (classSectionId !== undefined) state.selectedClassSectionId = classSectionId
    syncRouteQuery()
  }

  async function loadScope(options = {}) {
    state.loading = true
    state.feedback = { type: TEACHER_WORKFLOW_FEEDBACK_STATES.loading }
    const captured = staleGuard.capture([state.schoolId, state.selectedAcademicPeriodId, state.selectedClassSectionId])
    try {
      const [periods, assignments] = await Promise.all([
        academicPeriodsService({ page: 1, perPage: 100 }, options),
        assignmentsService(
          { page: 1, perPage: 100, academicPeriodId: state.selectedAcademicPeriodId, status: 'active' },
          options,
        ),
      ])
      if (!staleGuard.isCurrent(captured)) return
      state.academicPeriods = periods.items ?? periods.data ?? []
      state.teacherAssignments = assignments.items ?? assignments.data ?? []
      if (!state.selectedAcademicPeriodId && currentAcademicPeriod.value) {
        state.selectedAcademicPeriodId = currentAcademicPeriod.value.id
      }
      if (!state.selectedClassSectionId && selectedTeacherAssignment.value) {
        state.selectedClassSectionId =
          selectedTeacherAssignment.value.classSectionId ?? selectedTeacherAssignment.value.class_section_id
      }
      await loadMemberships(options)
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function loadMemberships(options = {}) {
    if (!state.selectedClassSectionId) {
      state.memberships = []
      return
    }
    const response = await membershipsService(
      state.selectedClassSectionId,
      {
        page: 1,
        perPage: 100,
        academicPeriodId: state.selectedAcademicPeriodId,
        status: 'active',
      },
      options,
    )
    state.memberships = response.items ?? response.data ?? []
  }

  watch(
    () => [routeValue(route, 'academicPeriodId'), routeValue(route, 'classSectionId')],
    ([academicPeriodId, classSectionId]) => {
      if (academicPeriodId !== undefined) state.selectedAcademicPeriodId = academicPeriodId
      if (classSectionId !== undefined) state.selectedClassSectionId = classSectionId
    },
  )

  return {
    state: readonly(state),
    currentAcademicPeriod,
    activeTeacherAssignments,
    selectedTeacherAssignment,
    eligibleStudentProfileIds,
    scopeStatus,
    setScope,
    loadScope,
    loadMemberships,
  }
}
