import { ADMIN_SYSTEM_LAYOUT } from '@/contracts/admin-system/navigation'

export function createAdministrationRoute({
  path,
  name,
  component,
  title,
  permissions,
  anyPermissions = [],
  userLookupMode = false,
  schoolContext = true,
  order,
  returnListRoute = null,
  mode = 'list',
  resource = null,
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
      anyPermissions,
      userLookupMode,
      mode,
      resource,
      returnListRoute,
      schoolContextSwitch: schoolContext && mode === 'list' ? 'retain' : 'discard',
      contextNeutralQueryKeys: [
        'page',
        'per_page',
        'perPage',
        'status',
        'sort',
        'search',
        'user_mode',
      ],
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

export function sanitizeAdministrationReturnQuery(query = {}) {
  const allowed = [
    'page',
    'per_page',
    'perPage',
    'status',
    'sort',
    'academic_year_id',
    'academicYearId',
    'academicPeriodId',
    'search',
    'user_mode',
    'name',
    'date_from',
    'date_to',
  ]
  return Object.fromEntries(
    Object.entries(query).filter(([key, value]) => allowed.includes(key) && value !== ''),
  )
}

export function createReturnToListLocation(route, fallbackName) {
  return {
    name: route?.meta?.returnListRoute ?? fallbackName,
    query: sanitizeAdministrationReturnQuery(route?.query ?? {}),
  }
}
