function hasRouteParams(params = {}) {
  return Object.values(params).some(
    (value) => value !== undefined && value !== null && value !== '',
  )
}

function retainQuery(query = {}, allowedKeys = []) {
  return Object.fromEntries(Object.entries(query).filter(([key]) => allowedKeys.includes(key)))
}

export function resolveSchoolContextRoute(intent, router) {
  if (!intent?.routeName || !router?.hasRoute?.(intent.routeName)) return null
  if (intent.featureEnabled === false || intent.released === false) return null

  if (!intent.requiresSchoolContext) {
    return {
      name: intent.routeName,
      params: intent.routeParams ?? {},
      query: intent.routeQuery ?? {},
    }
  }

  if (intent.schoolContextSwitch !== 'retain' || hasRouteParams(intent.routeParams)) return null

  return {
    name: intent.routeName,
    params: {},
    query: retainQuery(intent.routeQuery, intent.contextNeutralQueryKeys),
  }
}
