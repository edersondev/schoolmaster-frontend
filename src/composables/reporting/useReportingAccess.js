import { computed, reactive, readonly } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  REPORTING_FEEDBACK_STATES,
  REPORTING_PERMISSIONS,
  REPORTING_ROUTE_NAMES,
} from '@/contracts/reporting/reportingContract'

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? null
}

function hasAnyPermission(session, candidates = []) {
  if (typeof session.hasPermission === 'function') {
    return candidates.some((candidate) => session.hasPermission(candidate))
  }
  const codes = (session.permissions ?? [])
    .filter((permission) => permission.status === 'active' || permission.active === true)
    .map((permission) => permission.code ?? permission)
  return candidates.some((candidate) => codes.includes(candidate))
}

export function createReportingAccessState(session = {}) {
  const school = computed(() => session.activeSchool ?? null)
  const schoolId = computed(() => firstPresent(school.value?.id, session.activeSchoolId))
  const schoolTimezone = computed(() =>
    firstPresent(school.value?.timezone, school.value?.time_zone, session.activeSchoolTimezone, 'UTC'),
  )
  const hasReportAccess = computed(() =>
    hasAnyPermission(session, [
      REPORTING_PERMISSIONS.reports,
      'report.view',
      'reports.manage',
      'school.reports.view',
      'school.reporting',
    ]),
  )
  const hasLifecycleAccess = computed(() =>
    hasAnyPermission(session, [
      REPORTING_PERMISSIONS.lifecycle,
      'report.lifecycle',
      'reports.manage',
      'school.reports.lifecycle',
    ]),
  )
  const hasDefinitionAccess = computed(() =>
    hasAnyPermission(session, [
      REPORTING_PERMISSIONS.definitions,
      'report-definitions.manage',
      'reports.definitions.manage',
      'school.report-definitions.manage',
    ]),
  )
  const workspaceStatus = computed(() => {
    if (!schoolId.value) return REPORTING_FEEDBACK_STATES.noActiveSchool
    if (!hasReportAccess.value && !hasDefinitionAccess.value) return REPORTING_FEEDBACK_STATES.forbidden
    return 'ready'
  })
  const feedbackState = computed(() =>
    workspaceStatus.value === 'ready' ? null : { type: workspaceStatus.value },
  )

  return {
    school,
    schoolId,
    schoolTimezone,
    hasReportAccess,
    hasLifecycleAccess,
    hasDefinitionAccess,
    workspaceStatus,
    feedbackState,
    defaultRoute: { name: REPORTING_ROUTE_NAMES.history },
    isReady: computed(() => workspaceStatus.value === 'ready'),
    canUseCatalogForReports: computed(() => Boolean(schoolId.value && hasReportAccess.value)),
    canUseCatalogForDefinitions: computed(() => Boolean(schoolId.value && hasDefinitionAccess.value)),
  }
}

export function useReportingAccess({ session = null } = {}) {
  const store = session ?? useAuthSessionStore()
  const state = reactive(createReportingAccessState(store))
  return readonly(state)
}
