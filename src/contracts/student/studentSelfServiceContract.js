export const STUDENT_SELF_SERVICE_ROUTE_NAMES = Object.freeze({
  workspace: 'studentWorkspace',
  assignedLearningSets: 'studentAssignedLearningSets',
  learningSetDetail: 'studentLearningSetDetail',
  grades: 'studentGrades',
  gradeDetail: 'studentGradeDetail',
  attendance: 'studentAttendance',
  attendanceDetail: 'studentAttendanceDetail',
  overview: 'studentAcademicOverview',
})

export const STUDENT_SELF_SERVICE_OPERATIONS = Object.freeze({
  listStudentLearningSets: 'listStudentLearningSets',
  downloadStudentTeacherContent: 'downloadStudentTeacherContent',
  listStudentGrades: 'listStudentGrades',
  listStudentAttendance: 'listStudentAttendance',
})

export const STUDENT_SELF_SERVICE_ENDPOINTS = Object.freeze({
  learningSets: '/api/v1/student/learning-sets',
  teacherContentDownload: (contentItemId) =>
    `/api/v1/student/teacher-content/${encodeURIComponent(contentItemId)}/download`,
  grades: '/api/v1/student/grades',
  attendance: '/api/v1/student/attendance',
})

export const STUDENT_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  success: 'success',
  loading: 'loading',
  empty: 'empty',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  inactiveSchool: 'inactive-school',
  noActiveSchool: 'no-active-school',
  noStudentProfile: 'no-student-profile',
  noCurrentPeriod: 'no-current-period',
  unavailableContent: 'unavailable-content',
  validation: 'validation',
  notFound: 'not-found',
  unsupportedPageSize: 'unsupported-page-size',
  temporaryUnavailable: 'temporary-unavailable',
  staleResponse: 'stale-response',
  contractUnavailable: 'contract-unavailable',
})

export const STUDENT_BLOCKED_CAPABILITIES = Object.freeze({
  manualPeriodSwitch: 'manual-period-switch',
  questionnaireResponses: 'questionnaire-response-submit-review',
  standaloneLearningSetDetail: 'standalone-learning-set-detail',
  standaloneGradeDetail: 'standalone-grade-detail',
  standaloneAttendanceDetail: 'standalone-attendance-detail',
  reportRuns: 'student-report-runs',
  reportDownloads: 'student-report-downloads',
  transcripts: 'student-transcripts',
  calculatedGpa: 'calculated-gpa',
  attendanceRate: 'attendance-rate',
  rankings: 'rankings',
  trends: 'trends',
  corrections: 'grade-attendance-corrections',
  imports: 'imports',
  teacherAdminGuardianPlatform: 'teacher-admin-guardian-platform-surfaces',
})

export function isApprovedStudentOperation(operationId) {
  return Object.values(STUDENT_SELF_SERVICE_OPERATIONS).includes(operationId)
}

export function assertStudentCapabilitySupported(capability) {
  if (Object.values(STUDENT_BLOCKED_CAPABILITIES).includes(capability)) {
    const error = new Error(`Student self-service capability is blocked: ${capability}`)
    error.feedbackState = STUDENT_FEEDBACK_STATES.contractUnavailable
    error.gate = capability
    throw error
  }
}

export const STUDENT_SELF_SERVICE_TRACEABILITY = Object.freeze([
  {
    surface: 'Assigned Learning Sets',
    operationId: STUDENT_SELF_SERVICE_OPERATIONS.listStudentLearningSets,
    path: STUDENT_SELF_SERVICE_ENDPOINTS.learningSets,
  },
  {
    surface: 'Student content download',
    operationId: STUDENT_SELF_SERVICE_OPERATIONS.downloadStudentTeacherContent,
    path: '/api/v1/student/teacher-content/{contentItemId}/download',
  },
  {
    surface: 'Grades',
    operationId: STUDENT_SELF_SERVICE_OPERATIONS.listStudentGrades,
    path: STUDENT_SELF_SERVICE_ENDPOINTS.grades,
  },
  {
    surface: 'Attendance',
    operationId: STUDENT_SELF_SERVICE_OPERATIONS.listStudentAttendance,
    path: STUDENT_SELF_SERVICE_ENDPOINTS.attendance,
  },
])
