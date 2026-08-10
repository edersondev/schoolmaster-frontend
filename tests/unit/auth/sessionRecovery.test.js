import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPostAuthRoute } from '@/router/authGuards'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { createActivePinia } from './auth.fixtures'

const preferenceKey = 'schoolmaster.auth.lastApprovedSchoolId'

function confirmedSession(userId = 'user-1') {
  return {
    tokenExpiresAt: null,
    currentUser: { id: userId },
    roles: [],
    permissions: [],
    activeSchool: { id: 'school-1', status: 'active' },
  }
}

describe('session recovery routing', () => {
  beforeEach(() => {
    createActivePinia()
    localStorage.clear()
  })

  it('falls back to an allowed workspace when restoration is denied', () => {
    const store = {
      requestedRoute: {
        routeName: 'reports',
        routeParams: {},
        routeQuery: {},
        requiresSchoolContext: false,
        requiredPermissions: ['reports.view'],
      },
      status: 'authenticated',
      activeSchool: null,
      permissions: [],
    }

    expect(getPostAuthRoute(store, { name: 'adminDashboard' })).toEqual({ name: 'adminDashboard' })
  })

  it.each(['expiry', 'lifecycle'])(
    'clears identity-bound school preference on %s cleanup',
    (kind) => {
      const store = useAuthSessionStore()
      store.applySession(confirmedSession())
      expect(localStorage.getItem(preferenceKey)).not.toBeNull()

      if (kind === 'expiry') store.markSessionExpired()
      else store.clearLifecycleSessionAssumptions()

      expect(localStorage.getItem(preferenceKey)).toBeNull()
      expect(store.currentUser).toBeNull()
    },
  )

  it('clears identity-bound school preference on logout', async () => {
    const store = useAuthSessionStore()
    store.applySession(confirmedSession())

    await store.logout({ logout: vi.fn().mockResolvedValue() })

    expect(localStorage.getItem(preferenceKey)).toBeNull()
  })

  it('rebinds a confirmed preference only after identity replacement is confirmed', () => {
    const store = useAuthSessionStore()
    store.applySession(confirmedSession('user-1'))
    store.applySession({ ...confirmedSession('user-2'), activeSchool: null })

    expect(localStorage.getItem(preferenceKey)).toBeNull()
    expect(store.currentUser.id).toBe('user-2')
  })
})
