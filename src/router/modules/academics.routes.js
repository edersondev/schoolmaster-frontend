import { createAdministrationRoute } from './administration-route'

export const academicRoutes = [
  createAdministrationRoute({
    path: 'academic-years',
    name: 'academicYearsList',
    component: () => import('@/pages/admin-system/academic-years/AcademicYearsListPage.vue'),
    title: 'navigation.academicYears',
    permissions: ['academic_years.view'],
    order: 60,
  }),
  createAdministrationRoute({
    path: 'academic-years/create',
    name: 'academicYearCreate',
    component: () => import('@/pages/admin-system/academic-years/CreateAcademicYearPage.vue'),
    title: 'navigation.createAcademicYear',
    permissions: ['academic_years.view', 'academic_years.manage'],
  }),
  createAdministrationRoute({
    path: 'academic-periods',
    name: 'academicPeriodsList',
    component: () => import('@/pages/admin-system/academic-periods/AcademicPeriodsListPage.vue'),
    title: 'navigation.academicPeriods',
    permissions: ['academic_periods.view'],
    order: 70,
  }),
  createAdministrationRoute({
    path: 'academic-periods/create',
    name: 'academicPeriodCreate',
    component: () => import('@/pages/admin-system/academic-periods/CreateAcademicPeriodPage.vue'),
    title: 'navigation.createAcademicPeriod',
    permissions: ['academic_periods.view', 'academic_periods.manage', 'academic_years.view'],
  }),
]
