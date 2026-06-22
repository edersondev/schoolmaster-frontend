import AdminSystemLayout from '@/layouts/admin-system/AdminSystemLayout.vue'
import AdminDashboardPage from '@/pages/admin-system/dashboard/AdminDashboardPage.vue'
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROUTE_NAMES,
  ADMIN_SYSTEM_LAYOUT,
} from '@/contracts/admin-system/navigation'

export const adminSystemRoutes = [
  {
    path: '/',
    redirect: { name: ADMIN_ROUTE_NAMES.dashboard },
  },
  {
    path: '/admin',
    component: AdminSystemLayout,
    meta: {
      layout: ADMIN_SYSTEM_LAYOUT,
      requiresAuth: true,
      title: 'shell.title',
      breadcrumb: [{ label: 'shell.title', routeName: ADMIN_ROUTE_NAMES.dashboard }],
      permissions: [ADMIN_PERMISSIONS.viewDashboard],
    },
    children: [
      {
        path: '',
        name: ADMIN_ROUTE_NAMES.dashboard,
        component: AdminDashboardPage,
        meta: {
          layout: ADMIN_SYSTEM_LAYOUT,
          requiresAuth: true,
          title: 'dashboard.title',
          breadcrumb: [{ label: 'dashboard.title', routeName: ADMIN_ROUTE_NAMES.dashboard }],
          permissions: [ADMIN_PERMISSIONS.viewDashboard],
          sidebar: {
            section: 'workspace',
            order: 10,
            icon: 'House',
            label: 'navigation.dashboard',
          },
        },
      },
    ],
  },
]
