import { computed, readonly, reactive } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  GUARDIAN_FEEDBACK_STATES,
  GUARDIAN_SELF_SERVICE_ROUTE_NAMES,
} from '@/contracts/guardian/guardianSelfServiceContract'

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? null
}

function mapEntityId(entity) {
  if (!entity) return null
  if (typeof entity === 'string') return entity
  return firstPresent(entity.id, entity.academic_period_id)
}

export function resolveGuardianAccessState(session = {}) {
  return firstPresent(
    session.guardianAccessState,
    session.guardianSelfServiceAccess,
    session.currentUser?.guardianAccessState,
    session.currentUser?.guardian_self_service_access,
    session.tenantContext?.guardianAccessState,
  )
}

export function resolveCurrentGuardianAcademicPeriod(session = {}) {
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

export function createGuardianWorkspaceContextState(session = {}) {
  const school = computed(() => session.activeSchool ?? null)
  const guardianAccessState = computed(() => resolveGuardianAccessState(session))
  const academicPeriod = computed(() => resolveCurrentGuardianAcademicPeriod(session))
  const schoolId = computed(() => firstPresent(school.value?.id, session.activeSchoolId))
  const academicPeriodId = computed(() => mapEntityId(academicPeriod.value))
  const safeNoGuardianLink = computed(() =>
    ['no-guardian-link', 'missing_guardian_link', 'missing-guardian-link'].includes(
      String(guardianAccessState.value ?? '').toLowerCase(),
    ) || guardianAccessState.value?.noGuardianLink === true,
  )
  const workspaceStatus = computed(() => {
    if (!schoolId.value) return GUARDIAN_FEEDBACK_STATES.noActiveSchool
    if (safeNoGuardianLink.value) return GUARDIAN_FEEDBACK_STATES.noGuardianLink
    return 'ready'
  })
  const feedbackState = computed(() =>
    workspaceStatus.value === 'ready' ? null : { type: workspaceStatus.value },
  )

  return {
    school,
    guardianAccessState,
    academicPeriod,
    schoolId,
    academicPeriodId,
    safeNoGuardianLink,
    workspaceStatus,
    feedbackState,
    defaultRoute: { name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents },
    isReady: computed(() => workspaceStatus.value === 'ready'),
  }
}

export function useGuardianWorkspaceContext({ session = null } = {}) {
  const store = session ?? useAuthSessionStore()
  const state = reactive(createGuardianWorkspaceContextState(store))
  return readonly(state)
}
