import { ADMIN_SYSTEM_LAYOUT } from '@/contracts/admin-system/navigation'

export function createAdministrationRoute({
  path,
  name,
  component,
  title,
  permissions,
  schoolContext = true,
  order,
}) {
  const route = {
    path,
    name,
    component,
    meta: {
      layout: ADMIN_SYSTEM_LAYOUT,
      requiresAuth: true,
      requiresSchoolContext: schoolContext,
      title,
      breadcrumb: [{ label: title, routeName: name }],
      permissions,
    },
  }
  if (order) {
    route.meta.sidebar = {
      section: 'administration',
      order,
      icon: 'Management',
      label: title,
    }
  }
  return route
}
