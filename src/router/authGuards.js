import {
  AUTH_FEEDBACK_STATES,
  AUTH_SESSION_STATUSES,
  hasRequiredFeaturePermissions,
  isActiveSchoolContext,
  mapRequestedRoute,
} from '@/contracts/auth/authSession.contract'
import { AUTH_ROUTE_NAMES } from './modules/auth.routes'

export function captureRequestedRoute(route, createdFrom) {
  return mapRequestedRoute(route, createdFrom)
}

export function resolveRequestedRoute(requestedRoute, session) {
  if (!requestedRoute || session.status !== AUTH_SESSION_STATUSES.authenticated) {
    return null
  }

  if (requestedRoute.requiresSchoolContext && !isActiveSchoolContext(session.activeSchool)) {
    return null
  }

  if (!hasRequiredFeaturePermissions(session, requestedRoute.requiredPermissions)) {
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
  const requestedRoute = resolveRequestedRoute(store.requestedRoute, store)
  if (requestedRoute) return requestedRoute

  return typeof fallbackRoute === 'function' ? fallbackRoute(store) : fallbackRoute
}

export function createAuthGuard({ store, fallbackRoute }) {
  return async function authGuard(to) {
    if (to.meta.guestLifecycle) {
      return true
    }

    if (to.meta.guestOnly && !store.hasBootstrapped) {
      try {
        await store.bootstrap()
      } catch {
        // The store owns the normalized denial state used by the guest page.
      }
    }

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
    if (!hasRequiredFeaturePermissions(store, requiredPermissions)) {
      store.setFeedbackState?.(AUTH_FEEDBACK_STATES.forbidden)
      return { name: AUTH_ROUTE_NAMES.state }
    }

    if (to.meta.requiresSchoolContext && !isActiveSchoolContext(store.activeSchool)) {
      return { name: AUTH_ROUTE_NAMES.schoolSelection }
    }

    return true
  }
}
