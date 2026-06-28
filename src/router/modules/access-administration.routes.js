import { createAdministrationRoute } from './administration-route'

export const accessAdministrationRoutes = [
  createAdministrationRoute({
    path: 'users',
    name: 'usersList',
    component: () => import('@/pages/admin-system/users/UsersListPage.vue'),
    title: 'navigation.users',
    permissions: ['users.view'],
    order: 30,
  }),
  createAdministrationRoute({
    path: 'users/create',
    name: 'userCreate',
    component: () => import('@/pages/admin-system/users/CreateUserPage.vue'),
    title: 'navigation.createUser',
    permissions: ['users.view', 'users.manage', 'roles.view'],
  }),
  createAdministrationRoute({
    path: 'users/:userId/edit',
    name: 'userEdit',
    component: () => import('@/pages/admin-system/users/EditUserPage.vue'),
    title: 'navigation.editUser',
    permissions: ['users.view', 'users.manage', 'roles.view'],
  }),
  createAdministrationRoute({
    path: 'roles',
    name: 'rolesList',
    component: () => import('@/pages/admin-system/roles/RolesListPage.vue'),
    title: 'navigation.roles',
    permissions: ['roles.view'],
    order: 40,
  }),
  createAdministrationRoute({
    path: 'roles/create',
    name: 'roleCreate',
    component: () => import('@/pages/admin-system/roles/CreateRolePage.vue'),
    title: 'navigation.createRole',
    permissions: ['roles.view', 'roles.manage', 'permissions.view'],
  }),
  createAdministrationRoute({
    path: 'permissions',
    name: 'permissionsList',
    component: () => import('@/pages/admin-system/permissions/PermissionsListPage.vue'),
    title: 'navigation.permissions',
    permissions: ['permissions.view'],
    order: 50,
  }),
]
