import GuardianAcademicSummaryView from '@/pages/guardian/GuardianAcademicSummaryView.vue'
import GuardianContactView from '@/pages/guardian/GuardianContactView.vue'
import GuardianStudentDetailView from '@/pages/guardian/GuardianStudentDetailView.vue'
import GuardianWorkspaceView from '@/pages/guardian/GuardianWorkspaceView.vue'
import { GUARDIAN_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/guardian/guardianSelfServiceContract'

export { GUARDIAN_SELF_SERVICE_ROUTE_NAMES }

const guardianMeta = (title) => ({
  requiresAuth: true,
  requiresSchoolContext: true,
  title,
})

export const guardianRoutes = [
  {
    path: '/guardian/workspace',
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.workspace,
    redirect: { name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents },
    meta: guardianMeta('guardianSelfService.navigation.workspace'),
  },
  {
    path: '/guardian/workspace/students',
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents,
    component: GuardianWorkspaceView,
    meta: guardianMeta('guardianSelfService.navigation.linkedStudents'),
  },
  {
    path: '/guardian/workspace/students/:studentProfileId',
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.studentDetail,
    component: GuardianStudentDetailView,
    meta: guardianMeta('guardianSelfService.navigation.studentDetail'),
  },
  {
    path: '/guardian/workspace/students/:studentProfileId/academics',
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.academics,
    component: GuardianAcademicSummaryView,
    meta: guardianMeta('guardianSelfService.navigation.academics'),
  },
  {
    path: '/guardian/workspace/students/:studentProfileId/contacts',
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.contacts,
    component: GuardianContactView,
    meta: guardianMeta('guardianSelfService.navigation.contacts'),
  },
]
