import { createAdministrationRoute } from './administration-route'

export const schoolRoutes = [
  createAdministrationRoute({
    path: 'schools',
    name: 'schoolsList',
    component: () => import('@/pages/admin-system/schools/SchoolsListPage.vue'),
    title: 'navigation.schools',
    permissions: ['schools.view'],
    schoolContext: false,
    order: 20,
  }),
  createAdministrationRoute({
    path: 'schools/create',
    name: 'schoolCreate',
    component: () => import('@/pages/admin-system/schools/CreateSchoolPage.vue'),
    title: 'navigation.createSchool',
    permissions: ['schools.view', 'schools.manage'],
    schoolContext: false,
  }),
]
