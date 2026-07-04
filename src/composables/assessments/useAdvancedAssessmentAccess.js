import { computed } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  ADVANCED_ASSESSMENT_FEEDBACK_STATES,
  ADVANCED_ASSESSMENT_PERMISSIONS,
} from '@/contracts/assessments/advancedAssessmentContract'

function createDenied(type, gate) {
  return { allowed: false, feedback: { type, gate } }
}

export function useAdvancedAssessmentAccess({ session = useAuthSessionStore() } = {}) {
  const actorReady = computed(() => session.isAuthenticated && Boolean(session.currentUser))
  const activeSchoolReady = computed(() => Boolean(session.activeSchool?.id))
  const studentReady = computed(() => Boolean(session.activeStudentProfile?.id))

  function hasPermission(permission) {
    if (!permission) return true
    return session.hasPermission?.(permission) ?? session.permissionCodes?.includes(permission)
  }

  function gate(permission, { requiresStudent = false } = {}) {
    if (!actorReady.value) {
      return createDenied(ADVANCED_ASSESSMENT_FEEDBACK_STATES.unauthorized, 'actor')
    }
    if (!activeSchoolReady.value) {
      return createDenied(ADVANCED_ASSESSMENT_FEEDBACK_STATES.tenantMismatch, 'active-school')
    }
    if (requiresStudent && !studentReady.value) {
      return createDenied(ADVANCED_ASSESSMENT_FEEDBACK_STATES.forbidden, 'student-profile')
    }
    if (!hasPermission(permission)) {
      return createDenied(ADVANCED_ASSESSMENT_FEEDBACK_STATES.contractUnavailable, permission)
    }
    return { allowed: true, feedback: null }
  }

  return {
    actorReady,
    activeSchoolReady,
    studentReady,
    options: computed(() => ({ schoolId: session.activeSchool?.id })),
    permissions: ADVANCED_ASSESSMENT_PERMISSIONS,
    canAuthor: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.author)),
    canSubmit: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.submit, { requiresStudent: true })),
    canViewStudentResult: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.submit, { requiresStudent: true })),
    canReview: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.review)),
    canGrade: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.grade)),
    canDownloadCleanFile: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.downloadCleanFile)),
    canReport: computed(() => gate(ADVANCED_ASSESSMENT_PERMISSIONS.report)),
    gate,
  }
}
