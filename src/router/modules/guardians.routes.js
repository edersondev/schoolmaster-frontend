import { createAdministrationRoute } from './administration-route'

export const guardianRoutes = [
  createAdministrationRoute({
    path: 'guardians',
    name: 'guardiansList',
    component: () => import('@/pages/admin-system/guardians/GuardiansListPage.vue'),
    title: 'navigation.guardians',
    permissions: ['guardians.view'],
    order: 80,
  }),
  createAdministrationRoute({
    path: 'guardians/create',
    name: 'guardianCreate',
    component: () => import('@/pages/admin-system/guardians/CreateGuardianPage.vue'),
    title: 'navigation.createGuardian',
    permissions: ['guardians.view', 'guardians.manage'],
  }),
  createAdministrationRoute({
    path: 'guardians/:guardianId',
    name: 'guardianDetail',
    component: () => import('@/pages/admin-system/guardians/GuardianDetailPage.vue'),
    title: 'navigation.guardianDetail',
    permissions: ['guardians.view'],
    returnListRoute: 'guardiansList',
    mode: 'detail',
    resource: 'guardians',
  }),
  createAdministrationRoute({
    path: 'guardians/:guardianId/edit',
    name: 'guardianEdit',
    component: () => import('@/pages/admin-system/guardians/EditGuardianPage.vue'),
    title: 'navigation.editGuardian',
    permissions: ['guardians.view', 'guardians.manage'],
    returnListRoute: 'guardiansList',
    mode: 'edit',
    resource: 'guardians',
  }),
]
