import ReportingWorkspacePage from '@/pages/reporting/ReportingWorkspacePage.vue'
import { REPORTING_ROUTE_NAMES } from '@/contracts/reporting/reportingContract'

export { REPORTING_ROUTE_NAMES }

const reportingMeta = (title) => ({
  requiresAuth: true,
  requiresSchoolContext: true,
  title,
})

export const reportingRoutes = [
  {
    path: '/reporting',
    name: REPORTING_ROUTE_NAMES.workspace,
    redirect: { name: REPORTING_ROUTE_NAMES.history },
    meta: reportingMeta('reporting.navigation.workspace'),
  },
  {
    path: '/reporting/history',
    name: REPORTING_ROUTE_NAMES.history,
    component: ReportingWorkspacePage,
    meta: reportingMeta('reporting.navigation.history'),
  },
  {
    path: '/reporting/catalog',
    name: REPORTING_ROUTE_NAMES.catalog,
    component: ReportingWorkspacePage,
    meta: reportingMeta('reporting.navigation.catalog'),
  },
  {
    path: '/reporting/history/:reportRunId',
    name: REPORTING_ROUTE_NAMES.runDetail,
    component: ReportingWorkspacePage,
    meta: reportingMeta('reporting.history.title'),
  },
  {
    path: '/reporting/definitions',
    name: REPORTING_ROUTE_NAMES.definitions,
    component: ReportingWorkspacePage,
    meta: reportingMeta('reporting.navigation.definitions'),
  },
  {
    path: '/reporting/definitions/:reportDefinitionId',
    name: REPORTING_ROUTE_NAMES.definitionDetail,
    component: ReportingWorkspacePage,
    meta: reportingMeta('reporting.navigation.definitions'),
  },
]
