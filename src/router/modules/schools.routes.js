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
  createAdministrationRoute({
    path: 'schools/:schoolId',
    name: 'schoolDetail',
    component: () => import('@/pages/admin-system/schools/SchoolDetailPage.vue'),
    title: 'navigation.schoolDetail',
    permissions: ['schools.view'],
    schoolContext: false,
    returnListRoute: 'schoolsList',
    mode: 'detail',
    resource: 'schools',
  }),
  createAdministrationRoute({
    path: 'schools/:schoolId/edit',
    name: 'schoolEdit',
    component: () => import('@/pages/admin-system/schools/EditSchoolPage.vue'),
    title: 'navigation.editSchool',
    permissions: ['schools.view', 'schools.manage'],
    schoolContext: false,
    returnListRoute: 'schoolsList',
    mode: 'edit',
    resource: 'schools',
  }),
]
