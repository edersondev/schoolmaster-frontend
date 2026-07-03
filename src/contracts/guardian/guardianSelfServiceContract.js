export const GUARDIAN_SELF_SERVICE_ROUTE_NAMES = Object.freeze({
  workspace: 'guardianWorkspace',
  linkedStudents: 'guardianLinkedStudents',
  studentDetail: 'guardianStudentDetail',
  academics: 'guardianAcademicSummary',
  contacts: 'guardianContactView',
})

export const GUARDIAN_SELF_SERVICE_OPERATIONS = Object.freeze({
  listGuardianStudents: 'listGuardianStudents',
  getGuardianStudent: 'getGuardianStudent',
  getGuardianStudentAcademics: 'getGuardianStudentAcademics',
  getGuardianStudentContacts: 'getGuardianStudentContacts',
})

export const GUARDIAN_SELF_SERVICE_ENDPOINTS = Object.freeze({
  students: '/api/v1/guardian/students',
  student: (studentProfileId) =>
    `/api/v1/guardian/students/${encodeURIComponent(studentProfileId)}`,
  academics: (studentProfileId) =>
    `/api/v1/guardian/students/${encodeURIComponent(studentProfileId)}/academics`,
  contacts: (studentProfileId) =>
    `/api/v1/guardian/students/${encodeURIComponent(studentProfileId)}/contacts`,
})

export const GUARDIAN_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  empty: 'empty',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  inactiveSchool: 'inactive-school',
  noActiveSchool: 'no-active-school',
  noGuardianLink: 'no-guardian-link',
  noLinkedStudents: 'no-linked-students',
  noAcademicPeriod: 'no-academic-period',
  unavailableSummary: 'unavailable-summary',
  validation: 'validation',
  notFound: 'not-found',
  unsupportedPageSize: 'unsupported-page-size',
  staleResponse: 'stale-response',
  temporaryUnavailable: 'temporary-unavailable',
  contractUnavailable: 'contract-unavailable',
})

export const GUARDIAN_BLOCKED_CAPABILITIES = Object.freeze({
  manualPeriodSwitch: 'manual-period-switch',
  freeFormAcademicPeriod: 'free-form-academic-period',
  guardianWrites: 'guardian-writes',
  profileUpdate: 'guardian-profile-update',
  associationRequest: 'guardian-association-request',
  guardianUserLinkProvisioning: 'guardian-user-link-provisioning',
  academicRows: 'detailed-academic-rows',
  teacherContent: 'teacher-content',
  questionnaireActions: 'questionnaire-actions',
  reports: 'reports',
  messaging: 'messaging',
  notificationCenter: 'notification-center',
  schoolAdmin: 'school-admin',
  studentSelfService: 'student-self-service',
  platformSupport: 'platform-support',
  billing: 'billing',
  legalWorkflow: 'legal-workflow',
})

export function isApprovedGuardianOperation(operationId) {
  return Object.values(GUARDIAN_SELF_SERVICE_OPERATIONS).includes(operationId)
}

export function assertGuardianCapabilitySupported(capability) {
  if (Object.values(GUARDIAN_BLOCKED_CAPABILITIES).includes(capability)) {
    const error = new Error(`Guardian self-service capability is blocked: ${capability}`)
    error.feedbackState = GUARDIAN_FEEDBACK_STATES.contractUnavailable
    error.gate = capability
    throw error
  }
}

export const GUARDIAN_SELF_SERVICE_TRACEABILITY = Object.freeze([
  {
    surface: 'Linked students',
    operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.listGuardianStudents,
    path: GUARDIAN_SELF_SERVICE_ENDPOINTS.students,
  },
  {
    surface: 'Linked student detail',
    operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.getGuardianStudent,
    path: '/api/v1/guardian/students/{studentProfileId}',
  },
  {
    surface: 'Academic summary',
    operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.getGuardianStudentAcademics,
    path: '/api/v1/guardian/students/{studentProfileId}/academics',
  },
  {
    surface: 'Contact view',
    operationId: GUARDIAN_SELF_SERVICE_OPERATIONS.getGuardianStudentContacts,
    path: '/api/v1/guardian/students/{studentProfileId}/contacts',
  },
])
