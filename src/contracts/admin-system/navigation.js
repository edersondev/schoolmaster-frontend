import { ADMIN_SYSTEM_LAYOUT } from './shell'

export { ADMIN_SYSTEM_LAYOUT }

export const ADMIN_ROUTE_NAMES = Object.freeze({
  dashboard: 'adminDashboard',
})

export const ADMIN_PERMISSIONS = Object.freeze({
  viewDashboard: 'admin.dashboard.view',
})

export const ADMIN_NAVIGATION_SECTIONS = Object.freeze({
  workspace: 'workspace',
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
