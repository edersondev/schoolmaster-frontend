import AuthLayout from '@/layouts/auth/AuthLayout.vue'

export const AUTH_ROUTE_NAMES = Object.freeze({
  login: 'authLogin',
  forgotPassword: 'authForgotPassword',
  schoolSelection: 'authSchoolSelection',
  state: 'authState',
})

export const authRoutes = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: {
      layout: 'auth',
    },
    children: [
      {
        path: '',
        redirect: { name: AUTH_ROUTE_NAMES.login },
      },
      {
        path: 'login',
        name: AUTH_ROUTE_NAMES.login,
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: {
          layout: 'auth',
          guestOnly: true,
        },
      },
      {
        path: 'forgot-password',
        name: AUTH_ROUTE_NAMES.forgotPassword,
        component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
        meta: {
          layout: 'auth',
          guestOnly: true,
        },
      },
      {
        path: 'school-selection',
        name: AUTH_ROUTE_NAMES.schoolSelection,
        component: () => import('@/pages/auth/SchoolSelectionPage.vue'),
        meta: {
          layout: 'auth',
          requiresAuth: true,
        },
      },
      {
        path: 'state',
        name: AUTH_ROUTE_NAMES.state,
        component: () => import('@/pages/auth/AuthStatePage.vue'),
        meta: {
          layout: 'auth',
        },
      },
    ],
  },
]
