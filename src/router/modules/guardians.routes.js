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
]
