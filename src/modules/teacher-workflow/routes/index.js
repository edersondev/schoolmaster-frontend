import AdminAcademicRecordsView from './AdminAcademicRecordsView.vue'
import AdminTeacherMaterialsView from './AdminTeacherMaterialsView.vue'
import AdminTeacherWorkflowImportsView from './AdminTeacherWorkflowImportsView.vue'
import AttendanceRecordsView from './AttendanceRecordsView.vue'
import GradeRecordsView from './GradeRecordsView.vue'
import LearningSetDetailView from './LearningSetDetailView.vue'
import LearningSetListView from './LearningSetListView.vue'
import QuestionnaireDetailView from './QuestionnaireDetailView.vue'
import QuestionnaireListView from './QuestionnaireListView.vue'
import TeacherContentDetailView from './TeacherContentDetailView.vue'
import TeacherContentListView from './TeacherContentListView.vue'
import { TEACHER_WORKFLOW_ROUTE_NAMES } from './routeNames'

export { TEACHER_WORKFLOW_ROUTE_NAMES }

export const TEACHER_WORKFLOW_PERMISSIONS = Object.freeze({
  viewWorkspace: 'teacher_workflows.view',
  manageContent: 'teacher_content.manage',
  manageQuestionnaires: 'questionnaires.manage',
  manageLearningSets: 'learning_sets.manage',
  manageGrades: 'grades.manage',
  manageAttendance: 'attendance.manage',
  adminObserve: 'teacher_workflows.admin.observe',
  adminImport: 'teacher_workflows.admin.import',
})

const teacherMeta = (title, permissions = [TEACHER_WORKFLOW_PERMISSIONS.viewWorkspace]) => ({
  requiresAuth: true,
  requiresSchoolContext: true,
  title,
  permissions,
})

export const teacherWorkflowRoutes = [
  {
    path: '/teacher/workspace',
    redirect: { name: TEACHER_WORKFLOW_ROUTE_NAMES.content },
    meta: teacherMeta('teacherWorkflow.navigation.workspace'),
    children: [
      {
        path: 'content',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.content,
        component: TeacherContentListView,
        meta: teacherMeta('teacherWorkflow.navigation.content'),
      },
      {
        path: 'content/:contentItemId',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.contentDetail,
        component: TeacherContentDetailView,
        meta: teacherMeta('teacherWorkflow.navigation.content'),
      },
      {
        path: 'questionnaires',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.questionnaires,
        component: QuestionnaireListView,
        meta: teacherMeta('teacherWorkflow.navigation.questionnaires'),
      },
      {
        path: 'questionnaires/create',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.questionnaireCreate,
        component: QuestionnaireDetailView,
        meta: teacherMeta('teacherWorkflow.navigation.questionnaires'),
      },
      {
        path: 'questionnaires/:questionnaireId',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.questionnaireDetail,
        component: QuestionnaireDetailView,
        meta: teacherMeta('teacherWorkflow.navigation.questionnaires'),
      },
      {
        path: 'learning-sets',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.learningSets,
        component: LearningSetListView,
        meta: teacherMeta('teacherWorkflow.navigation.learningSets'),
      },
      {
        path: 'learning-sets/:learningSetId',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.learningSetDetail,
        component: LearningSetDetailView,
        meta: teacherMeta('teacherWorkflow.navigation.learningSets'),
      },
      {
        path: 'grades',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.grades,
        component: GradeRecordsView,
        meta: teacherMeta('teacherWorkflow.navigation.grades'),
      },
      {
        path: 'attendance',
        name: TEACHER_WORKFLOW_ROUTE_NAMES.attendance,
        component: AttendanceRecordsView,
        meta: teacherMeta('teacherWorkflow.navigation.attendance'),
      },
    ],
  },
  {
    path: '/admin/teacher-workflow/materials',
    name: TEACHER_WORKFLOW_ROUTE_NAMES.adminMaterials,
    component: AdminTeacherMaterialsView,
    meta: teacherMeta('teacherWorkflow.navigation.adminMaterials', [
      TEACHER_WORKFLOW_PERMISSIONS.adminObserve,
    ]),
  },
  {
    path: '/admin/teacher-workflow/academic-records',
    name: TEACHER_WORKFLOW_ROUTE_NAMES.adminAcademicRecords,
    component: AdminAcademicRecordsView,
    meta: teacherMeta('teacherWorkflow.navigation.adminRecords', [
      TEACHER_WORKFLOW_PERMISSIONS.adminObserve,
    ]),
  },
  {
    path: '/admin/teacher-workflow/imports',
    name: TEACHER_WORKFLOW_ROUTE_NAMES.adminImports,
    component: AdminTeacherWorkflowImportsView,
    meta: teacherMeta('teacherWorkflow.navigation.imports', [
      TEACHER_WORKFLOW_PERMISSIONS.adminImport,
    ]),
  },
]
