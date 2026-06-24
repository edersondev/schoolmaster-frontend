import {
  AUTH_FEEDBACK_STATES,
  AUTH_SESSION_STATUSES,
  mapRequestedRoute,
} from '@/contracts/auth/authSession.contract'
import { AUTH_ROUTE_NAMES } from './modules/auth.routes'

export function captureRequestedRoute(route, createdFrom) {
  return mapRequestedRoute(route, createdFrom)
}

function permissionCodes(session) {
  return (session.permissions ?? [])
    .filter((permission) => permission.status === 'active')
    .map((permission) => permission.code)
}

export function resolveRequestedRoute(requestedRoute, session) {
  if (!requestedRoute || session.status !== AUTH_SESSION_STATUSES.authenticated) {
    return null
  }

  if (requestedRoute.requiresSchoolContext && !session.activeSchool) {
    return null
  }

  const availablePermissions = permissionCodes(session)
  if (
    !requestedRoute.requiredPermissions.every((permission) =>
      availablePermissions.includes(permission),
    )
  ) {
    return null
  }

  if (!requestedRoute.routeName) {
    return null
  }

  return {
    name: requestedRoute.routeName,
    params: requestedRoute.routeParams,
    query: requestedRoute.routeQuery,
  }
}

export function getPostAuthRoute(store, fallbackRoute) {
  return resolveRequestedRoute(store.requestedRoute, store) ?? fallbackRoute
}

export function createAuthGuard({ store, fallbackRoute }) {
  return async function authGuard(to) {
    if (to.meta.guestOnly && store.status === AUTH_SESSION_STATUSES.authenticated) {
      return getPostAuthRoute(store, fallbackRoute)
    }

    if (!to.meta.requiresAuth) {
      return true
    }

    if (
      to.name === AUTH_ROUTE_NAMES.schoolSelection &&
      store.status === AUTH_SESSION_STATUSES.selectingSchool
    ) {
      return true
    }

    if (!store.hasBootstrapped) {
      try {
        await store.bootstrap({
          requiresSchoolContext: to.meta.requiresSchoolContext === true,
        })
      } catch {
        // The store owns the normalized denial state used below.
      }
    }

    if (store.status === AUTH_SESSION_STATUSES.selectingSchool) {
      return { name: AUTH_ROUTE_NAMES.schoolSelection }
    }

    if (store.status !== AUTH_SESSION_STATUSES.authenticated) {
      const createdFrom =
        store.status === AUTH_SESSION_STATUSES.expired ? 'expired-session' : 'signed-out'
      store.captureRequestedRoute?.(to, createdFrom)

      if (
        [
          AUTH_SESSION_STATUSES.forbidden,
          AUTH_SESSION_STATUSES.inactiveUser,
          AUTH_SESSION_STATUSES.inactiveSchool,
          AUTH_SESSION_STATUSES.tenantMismatch,
          AUTH_SESSION_STATUSES.unavailable,
        ].includes(store.status)
      ) {
        return { name: AUTH_ROUTE_NAMES.state }
      }

      return { name: AUTH_ROUTE_NAMES.login }
    }

    const requiredPermissions = to.meta.permissions ?? to.meta.requiredPermissions ?? []
    const availablePermissions = permissionCodes(store)
    if (!requiredPermissions.every((permission) => availablePermissions.includes(permission))) {
      store.setFeedbackState?.(AUTH_FEEDBACK_STATES.forbidden)
      return { name: AUTH_ROUTE_NAMES.state }
    }

    if (to.meta.requiresSchoolContext && !store.activeSchool) {
      return { name: AUTH_ROUTE_NAMES.schoolSelection }
    }

    return true
  }
}
