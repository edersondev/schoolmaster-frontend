import { ADMIN_SYSTEM_LAYOUT } from './shell'

export { ADMIN_SYSTEM_LAYOUT }

export const ADMIN_ROUTE_NAMES = Object.freeze({
  dashboard: 'adminDashboard',
  schools: 'schoolsList',
  users: 'usersList',
  roles: 'rolesList',
  permissions: 'permissionsList',
  academicYears: 'academicYearsList',
  academicPeriods: 'academicPeriodsList',
  guardians: 'guardiansList',
  studentProfiles: 'studentProfilesList',
  classSections: 'classSectionsList',
  teacherAssignments: 'teacherAssignmentsList',
})

export const ADMIN_PERMISSIONS = Object.freeze({
  viewDashboard: 'admin.dashboard.view',
  viewSchools: 'schools.view',
  viewUsers: 'users.view',
  viewRoles: 'roles.view',
  viewPermissions: 'permissions.view',
  viewAcademicYears: 'academic_years.view',
  viewAcademicPeriods: 'academic_periods.view',
  viewGuardians: 'guardians.view',
  viewStudentProfiles: 'student_profiles.view',
  viewClassSections: 'class_sections.view',
  viewTeacherAssignments: 'teacher_assignments.view',
})

export const ADMIN_NAVIGATION_SECTIONS = Object.freeze({
  workspace: 'workspace',
  administration: 'administration',
})

/**
 * @typedef {Object} NavigationItem
 * @property {string} key
 * @property {string} labelKey
 * @property {string|Object} destination
 * @property {string} icon
 * @property {string[]} permissions
 * @property {number} order
 * @property {boolean} approved
 * @property {string} section
 */

export const ADMIN_NAVIGATION_ITEMS = Object.freeze([
  {
    key: ADMIN_ROUTE_NAMES.dashboard,
    labelKey: 'navigation.dashboard',
    destination: { name: ADMIN_ROUTE_NAMES.dashboard },
    icon: 'House',
    permissions: [ADMIN_PERMISSIONS.viewDashboard],
    order: 10,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.workspace,
  },
  {
    key: ADMIN_ROUTE_NAMES.schools,
    labelKey: 'navigation.schools',
    destination: { name: ADMIN_ROUTE_NAMES.schools },
    icon: 'Management',
    permissions: [ADMIN_PERMISSIONS.viewSchools],
    order: 20,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.users,
    labelKey: 'navigation.users',
    destination: { name: ADMIN_ROUTE_NAMES.users },
    icon: 'User',
    permissions: [ADMIN_PERMISSIONS.viewUsers],
    order: 30,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.roles,
    labelKey: 'navigation.roles',
    destination: { name: ADMIN_ROUTE_NAMES.roles },
    icon: 'Key',
    permissions: [ADMIN_PERMISSIONS.viewRoles],
    order: 40,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.permissions,
    labelKey: 'navigation.permissions',
    destination: { name: ADMIN_ROUTE_NAMES.permissions },
    icon: 'Lock',
    permissions: [ADMIN_PERMISSIONS.viewPermissions],
    order: 50,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.academicYears,
    labelKey: 'navigation.academicYears',
    destination: { name: ADMIN_ROUTE_NAMES.academicYears },
    icon: 'Calendar',
    permissions: [ADMIN_PERMISSIONS.viewAcademicYears],
    order: 60,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.academicPeriods,
    labelKey: 'navigation.academicPeriods',
    destination: { name: ADMIN_ROUTE_NAMES.academicPeriods },
    icon: 'Clock',
    permissions: [ADMIN_PERMISSIONS.viewAcademicPeriods],
    order: 70,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.guardians,
    labelKey: 'navigation.guardians',
    destination: { name: ADMIN_ROUTE_NAMES.guardians },
    icon: 'Avatar',
    permissions: [ADMIN_PERMISSIONS.viewGuardians],
    order: 80,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.studentProfiles,
    labelKey: 'navigation.studentProfiles',
    destination: { name: ADMIN_ROUTE_NAMES.studentProfiles },
    icon: 'User',
    permissions: [ADMIN_PERMISSIONS.viewStudentProfiles],
    order: 90,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.classSections,
    labelKey: 'navigation.classSections',
    destination: { name: ADMIN_ROUTE_NAMES.classSections },
    icon: 'Management',
    permissions: [ADMIN_PERMISSIONS.viewClassSections],
    order: 100,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
  {
    key: ADMIN_ROUTE_NAMES.teacherAssignments,
    labelKey: 'navigation.teacherAssignments',
    destination: { name: ADMIN_ROUTE_NAMES.teacherAssignments },
    icon: 'Avatar',
    permissions: [ADMIN_PERMISSIONS.viewTeacherAssignments],
    order: 110,
    approved: true,
    section: ADMIN_NAVIGATION_SECTIONS.administration,
  },
])

/**
 * @typedef {Object} QuickAction
 * @property {string} key
 * @property {string} labelKey
 * @property {string} descriptionKey
 * @property {string|Object} destination
 * @property {string} icon
 * @property {string[]} permissions
 * @property {boolean} routeApproved
 * @property {boolean} workflowApproved
 * @property {number} order
 */

export const ADMIN_QUICK_ACTIONS = Object.freeze([
  {
    key: 'open-dashboard',
    labelKey: 'quickActions.openDashboard',
    descriptionKey: 'quickActions.openDashboardDescription',
    destination: { name: ADMIN_ROUTE_NAMES.dashboard },
    icon: 'House',
    permissions: [ADMIN_PERMISSIONS.viewDashboard],
    routeApproved: true,
    workflowApproved: true,
    order: 10,
  },
])

export function isApprovedAdminRoute(routeName) {
  return Object.values(ADMIN_ROUTE_NAMES).includes(routeName)
}
