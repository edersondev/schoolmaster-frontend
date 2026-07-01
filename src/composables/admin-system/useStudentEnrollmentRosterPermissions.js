import { computed } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

export const STUDENT_ENROLLMENT_ROSTER_PERMISSIONS = Object.freeze({
  studentView: ['student_profiles.view', 'students.view'],
  studentManage: ['student_profiles.manage', 'students.manage'],
  rosterView: ['class_sections.view', 'rosters.view'],
  rosterManage: ['class_sections.manage', 'rosters.manage'],
  assignmentView: ['teacher_assignments.view', 'rosters.view'],
  assignmentManage: ['teacher_assignments.manage', 'rosters.manage'],
})

export function useStudentEnrollmentRosterPermissions(options = {}) {
  const sessionStore = options.sessionStore ?? useAuthSessionStore()
  const schoolReady = computed(() => Boolean(sessionStore.activeSchool?.id))
  const hasAny = (codes) => codes.some((code) => sessionStore.hasPermission(code))
  return {
    schoolReady,
    canViewStudents: computed(() => schoolReady.value && hasAny(STUDENT_ENROLLMENT_ROSTER_PERMISSIONS.studentView)),
    canManageStudents: computed(() => schoolReady.value && hasAny(STUDENT_ENROLLMENT_ROSTER_PERMISSIONS.studentManage)),
    canViewRosters: computed(() => schoolReady.value && hasAny(STUDENT_ENROLLMENT_ROSTER_PERMISSIONS.rosterView)),
    canManageRosters: computed(() => schoolReady.value && hasAny(STUDENT_ENROLLMENT_ROSTER_PERMISSIONS.rosterManage)),
    canViewAssignments: computed(() => schoolReady.value && hasAny(STUDENT_ENROLLMENT_ROSTER_PERMISSIONS.assignmentView)),
    canManageAssignments: computed(() => schoolReady.value && hasAny(STUDENT_ENROLLMENT_ROSTER_PERMISSIONS.assignmentManage)),
  }
}
