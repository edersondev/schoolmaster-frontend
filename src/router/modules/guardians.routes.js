import { ADMIN_SYSTEM_LAYOUT } from '@/contracts/admin-system/navigation'

const redirectToCreateStudent = (to) => ({
  name: 'studentProfileCreate',
  query: {
    redirected_from: to.name,
  },
})

export const guardianRoutes = [
  {
    path: 'guardians',
    name: 'guardiansList',
    redirect: redirectToCreateStudent,
    meta: {
      layout: ADMIN_SYSTEM_LAYOUT,
      requiresAuth: true,
      requiresSchoolContext: true,
      title: 'studentGuardianTabs.redirect.guardians',
      permissions: ['guardians.view'],
    },
  },
  {
    path: 'guardians/create',
    name: 'guardianCreate',
    redirect: redirectToCreateStudent,
    meta: {
      layout: ADMIN_SYSTEM_LAYOUT,
      requiresAuth: true,
      requiresSchoolContext: true,
      title: 'studentGuardianTabs.redirect.createGuardian',
      permissions: ['guardians.view', 'guardians.manage'],
    },
  },
  {
    path: 'guardians/:guardianId',
    name: 'guardianDetail',
    redirect: redirectToCreateStudent,
    meta: {
      layout: ADMIN_SYSTEM_LAYOUT,
      requiresAuth: true,
      requiresSchoolContext: true,
      title: 'studentGuardianTabs.redirect.guardianDetail',
      permissions: ['guardians.view'],
    },
  },
  {
    path: 'guardians/:guardianId/edit',
    name: 'guardianEdit',
    redirect: redirectToCreateStudent,
    meta: {
      layout: ADMIN_SYSTEM_LAYOUT,
      requiresAuth: true,
      requiresSchoolContext: true,
      title: 'studentGuardianTabs.redirect.editGuardian',
      permissions: ['guardians.view', 'guardians.manage'],
    },
  },
]
