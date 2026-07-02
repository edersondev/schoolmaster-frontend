import AssignedLearningSetsView from '@/pages/student/AssignedLearningSetsView.vue'
import StudentAcademicOverviewView from '@/pages/student/StudentAcademicOverviewView.vue'
import StudentAttendanceView from '@/pages/student/StudentAttendanceView.vue'
import StudentGradesView from '@/pages/student/StudentGradesView.vue'
import StudentLearningSetDetailView from '@/pages/student/StudentLearningSetDetailView.vue'
import { STUDENT_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/student/studentSelfServiceContract'

export { STUDENT_SELF_SERVICE_ROUTE_NAMES }

const studentMeta = (title) => ({
  requiresAuth: true,
  requiresSchoolContext: true,
  title,
})

export const studentRoutes = [
  {
    path: '/student/workspace',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.workspace,
    redirect: { name: STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets },
    meta: studentMeta('studentSelfService.navigation.workspace'),
  },
  {
    path: '/student/workspace/learning-sets',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets,
    component: AssignedLearningSetsView,
    meta: studentMeta('studentSelfService.navigation.assignedLearningSets'),
  },
  {
    path: '/student/workspace/learning-sets/:learningSetId',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.learningSetDetail,
    component: StudentLearningSetDetailView,
    meta: studentMeta('studentSelfService.learningSets.detail'),
  },
  {
    path: '/student/workspace/grades',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.grades,
    component: StudentGradesView,
    meta: studentMeta('studentSelfService.navigation.grades'),
  },
  {
    path: '/student/workspace/grades/:gradeId',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.gradeDetail,
    component: StudentGradesView,
    meta: studentMeta('studentSelfService.grades.detail'),
  },
  {
    path: '/student/workspace/attendance',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.attendance,
    component: StudentAttendanceView,
    meta: studentMeta('studentSelfService.navigation.attendance'),
  },
  {
    path: '/student/workspace/attendance/:attendanceId',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.attendanceDetail,
    component: StudentAttendanceView,
    meta: studentMeta('studentSelfService.attendance.detail'),
  },
  {
    path: '/student/workspace/overview',
    name: STUDENT_SELF_SERVICE_ROUTE_NAMES.overview,
    component: StudentAcademicOverviewView,
    meta: studentMeta('studentSelfService.navigation.overview'),
  },
]
