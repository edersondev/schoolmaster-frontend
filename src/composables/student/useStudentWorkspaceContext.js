import { computed, readonly, reactive } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  STUDENT_FEEDBACK_STATES,
  STUDENT_SELF_SERVICE_ROUTE_NAMES,
} from '@/contracts/student/studentSelfServiceContract'

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? null
}

function mapEntityId(entity) {
  if (!entity) return null
  if (typeof entity === 'string') return entity
  return firstPresent(entity.id, entity.student_profile_id, entity.academic_period_id)
}

export function resolveActiveStudentProfile(session = {}) {
  return firstPresent(
    session.activeStudentProfile,
    session.studentProfile,
    session.linkedStudentProfile,
    session.currentUser?.activeStudentProfile,
    session.currentUser?.studentProfile,
    session.currentUser?.student_profile,
    session.currentUser?.student_profile_id,
    session.tenantContext?.activeStudentProfile,
  )
}

export function resolveCurrentAcademicPeriod(session = {}) {
  return firstPresent(
    session.currentAcademicPeriod,
    session.activeAcademicPeriod,
    session.academicPeriod,
    session.activeSchool?.currentAcademicPeriod,
    session.activeSchool?.current_academic_period,
    session.tenantContext?.currentAcademicPeriod,
    session.tenantContext?.current_academic_period,
    session.currentUser?.currentAcademicPeriod,
  )
}

export function createStudentWorkspaceContextState(session = {}) {
  const school = computed(() => session.activeSchool ?? null)
  const studentProfile = computed(() => resolveActiveStudentProfile(session))
  const academicPeriod = computed(() => resolveCurrentAcademicPeriod(session))
  const schoolId = computed(() => firstPresent(school.value?.id, session.activeSchoolId))
  const studentProfileId = computed(() => mapEntityId(studentProfile.value))
  const academicPeriodId = computed(() => mapEntityId(academicPeriod.value))
  const workspaceStatus = computed(() => {
    if (!schoolId.value) return STUDENT_FEEDBACK_STATES.noActiveSchool
    if (!studentProfileId.value) return STUDENT_FEEDBACK_STATES.noStudentProfile
    if (!academicPeriodId.value) return STUDENT_FEEDBACK_STATES.noCurrentPeriod
    return 'ready'
  })
  const feedbackState = computed(() =>
    workspaceStatus.value === 'ready' ? null : { type: workspaceStatus.value },
  )

  return {
    school,
    studentProfile,
    academicPeriod,
    schoolId,
    studentProfileId,
    academicPeriodId,
    workspaceStatus,
    feedbackState,
    defaultRoute: { name: STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets },
    isReady: computed(() => workspaceStatus.value === 'ready'),
  }
}

export function useStudentWorkspaceContext({ session = null } = {}) {
  const store = session ?? useAuthSessionStore()
  const state = reactive(createStudentWorkspaceContextState(store))
  return readonly(state)
}
