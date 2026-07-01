import { AUTH_ALL_PERMISSIONS, hasPrivilegedAccess } from '@/contracts/auth/authSession.contract'

export const TEACHER_WORKFLOW_OPERATIONS = Object.freeze({
  listAcademicPeriods: 'listAcademicPeriods',
  listClassSections: 'listClassSections',
  listClassSectionMemberships: 'listClassSectionMemberships',
  listTeacherAssignments: 'listTeacherAssignments',
  getTeacherAssignment: 'getTeacherAssignment',
  listTeacherContent: 'listTeacherContent',
  createTeacherContent: 'createTeacherContent',
  getTeacherContent: 'getTeacherContent',
  updateTeacherContent: 'updateTeacherContent',
  updateTeacherContentStatus: 'updateTeacherContentStatus',
  deleteTeacherContent: 'deleteTeacherContent',
  restoreTeacherContent: 'restoreTeacherContent',
  downloadTeacherContent: 'downloadTeacherContent',
  listQuestionnaires: 'listQuestionnaires',
  createQuestionnaire: 'createQuestionnaire',
  getQuestionnaire: 'getQuestionnaire',
  updateQuestionnaire: 'updateQuestionnaire',
  updateQuestionnaireStatus: 'updateQuestionnaireStatus',
  deleteQuestionnaire: 'deleteQuestionnaire',
  restoreQuestionnaire: 'restoreQuestionnaire',
  listLearningSets: 'listLearningSets',
  createLearningSet: 'createLearningSet',
  getLearningSet: 'getLearningSet',
  updateLearningSet: 'updateLearningSet',
  updateLearningSetStatus: 'updateLearningSetStatus',
  deleteLearningSet: 'deleteLearningSet',
  restoreLearningSet: 'restoreLearningSet',
  listGrades: 'listGrades',
  createGrade: 'createGrade',
  getGrade: 'getGrade',
  correctGrade: 'correctGrade',
  updateGradeStatus: 'updateGradeStatus',
  deleteGrade: 'deleteGrade',
  restoreGrade: 'restoreGrade',
  importGrades: 'importGrades',
  listAttendance: 'listAttendance',
  createAttendance: 'createAttendance',
  getAttendance: 'getAttendance',
  correctAttendance: 'correctAttendance',
  updateAttendanceStatus: 'updateAttendanceStatus',
  deleteAttendance: 'deleteAttendance',
  restoreAttendance: 'restoreAttendance',
  importAttendance: 'importAttendance',
})

export const TEACHER_WORKFLOW_CAPABILITIES = Object.freeze({
  teacherWorkspace: 'teacher_workflows.view',
  contentManage: 'teacher_content.manage',
  questionnaireManage: 'questionnaires.manage',
  learningSetManage: 'learning_sets.manage',
  gradeManage: 'grades.manage',
  attendanceManage: 'attendance.manage',
  adminObserve: 'teacher_workflows.admin.observe',
  adminImport: 'teacher_workflows.admin.import',
  closedPeriodCorrection: 'teacher_workflows.admin.closed_period_correction',
})

export const TEACHER_WORKFLOW_CONTRACT_GATES = Object.freeze({
  rosterAwareLearningSetCreate: false,
  scopedLearningSetList: false,
  scopedGradeList: false,
  scopedAttendanceList: false,
  jsonImports: true,
  contentDownload: true,
})

export function assertContractGate(gate, message) {
  if (TEACHER_WORKFLOW_CONTRACT_GATES[gate]) return
  const error = new Error(message ?? `Contract gate blocked: ${gate}`)
  error.feedbackState = 'unsupported-contract'
  error.gate = gate
  throw error
}

export function hasCapability(session, capability) {
  if (hasPrivilegedAccess(session)) return true

  const permissions = session?.permissions ?? []
  return permissions.some((permission) => {
    if (typeof permission === 'string') return permission === capability || permission === AUTH_ALL_PERMISSIONS
    if (permission?.code === AUTH_ALL_PERMISSIONS && (permission?.status ?? 'active') === 'active') return true
    return permission?.code === capability && (permission?.status ?? 'active') === 'active'
  })
}
