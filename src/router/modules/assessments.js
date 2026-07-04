import AdvancedAssessmentWorkspacePage from '@/pages/assessments/AdvancedAssessmentWorkspacePage.vue'
import AdvancedQuestionnaireAuthoringPage from '@/pages/assessments/AdvancedQuestionnaireAuthoringPage.vue'
import StudentAdvancedResponsePage from '@/pages/assessments/StudentAdvancedResponsePage.vue'
import AssessmentReviewQueuePage from '@/pages/assessments/AssessmentReviewQueuePage.vue'
import AssessmentResponseGradingPage from '@/pages/assessments/AssessmentResponseGradingPage.vue'
import StudentAssessmentResultPage from '@/pages/assessments/StudentAssessmentResultPage.vue'
import AdvancedAssessmentReportingPage from '@/pages/assessments/AdvancedAssessmentReportingPage.vue'
import { ADVANCED_ASSESSMENT_ROUTE_NAMES } from '@/contracts/assessments/advancedAssessmentContract'

export { ADVANCED_ASSESSMENT_ROUTE_NAMES }

const assessmentMeta = (title) => ({
  requiresAuth: true,
  requiresSchoolContext: true,
  title,
})

export const assessmentRoutes = [
  {
    path: '/assessments',
    component: AdvancedAssessmentWorkspacePage,
    meta: assessmentMeta('advancedAssessment.navigation.workspace'),
    children: [
      {
        path: '',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.workspace,
        redirect: { name: ADVANCED_ASSESSMENT_ROUTE_NAMES.reviewQueue },
      },
      {
        path: 'questionnaires/new',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.authoring,
        component: AdvancedQuestionnaireAuthoringPage,
        meta: assessmentMeta('advancedAssessment.navigation.authoring'),
      },
      {
        path: 'questionnaires/:questionnaireId/edit',
        name: `${ADVANCED_ASSESSMENT_ROUTE_NAMES.authoring}Detail`,
        component: AdvancedQuestionnaireAuthoringPage,
        meta: assessmentMeta('advancedAssessment.navigation.authoring'),
      },
      {
        path: 'student-response/:questionnaireId?',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.studentResponse,
        component: StudentAdvancedResponsePage,
        meta: assessmentMeta('advancedAssessment.navigation.studentResponse'),
      },
      {
        path: 'review',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.reviewQueue,
        component: AssessmentReviewQueuePage,
        meta: assessmentMeta('advancedAssessment.navigation.review'),
      },
      {
        path: 'responses/:responseAttemptId/grading',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.grading,
        component: AssessmentResponseGradingPage,
        meta: assessmentMeta('advancedAssessment.navigation.grading'),
      },
      {
        path: 'student-results/:responseAttemptId',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.studentResult,
        component: StudentAssessmentResultPage,
        meta: assessmentMeta('advancedAssessment.navigation.studentResult'),
      },
      {
        path: 'reporting',
        name: ADVANCED_ASSESSMENT_ROUTE_NAMES.reporting,
        component: AdvancedAssessmentReportingPage,
        meta: assessmentMeta('advancedAssessment.navigation.reporting'),
      },
    ],
  },
]
