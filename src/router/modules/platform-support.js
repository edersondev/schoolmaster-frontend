import PlatformSupportWorkspacePage from '@/pages/platform-support/PlatformSupportWorkspacePage.vue'
import PlatformOperationalOversightPage from '@/pages/platform-support/PlatformOperationalOversightPage.vue'
import SupportAccessDecisionsPage from '@/pages/platform-support/SupportAccessDecisionsPage.vue'
import SupportDiagnosticsPage from '@/pages/platform-support/SupportDiagnosticsPage.vue'
import SupportAuditReviewPage from '@/pages/platform-support/SupportAuditReviewPage.vue'
import { PLATFORM_SUPPORT_ROUTE_NAMES } from '@/contracts/platform-support/platformSupportContract'

export { PLATFORM_SUPPORT_ROUTE_NAMES }

const platformSupportMeta = (title) => ({
  requiresAuth: true,
  requiresSchoolContext: false,
  title,
})

export const platformSupportRoutes = [
  {
    path: '/platform-support',
    component: PlatformSupportWorkspacePage,
    meta: platformSupportMeta('platformSupport.navigation.workspace'),
    children: [
      {
        path: '',
        name: PLATFORM_SUPPORT_ROUTE_NAMES.workspace,
        redirect: { name: PLATFORM_SUPPORT_ROUTE_NAMES.oversight },
      },
      {
        path: 'oversight',
        name: PLATFORM_SUPPORT_ROUTE_NAMES.oversight,
        component: PlatformOperationalOversightPage,
        meta: platformSupportMeta('platformSupport.navigation.oversight'),
      },
      {
        path: 'decisions',
        name: PLATFORM_SUPPORT_ROUTE_NAMES.decisions,
        component: SupportAccessDecisionsPage,
        meta: platformSupportMeta('platformSupport.navigation.decisions'),
      },
      {
        path: 'decisions/:supportAccessId',
        name: PLATFORM_SUPPORT_ROUTE_NAMES.decisionDetail,
        component: SupportAccessDecisionsPage,
        meta: platformSupportMeta('platformSupport.navigation.decisions'),
      },
      {
        path: 'diagnostics',
        name: PLATFORM_SUPPORT_ROUTE_NAMES.diagnostics,
        component: SupportDiagnosticsPage,
        meta: platformSupportMeta('platformSupport.navigation.diagnostics'),
      },
      {
        path: 'audit',
        name: PLATFORM_SUPPORT_ROUTE_NAMES.audit,
        component: SupportAuditReviewPage,
        meta: platformSupportMeta('platformSupport.navigation.audit'),
      },
    ],
  },
]

