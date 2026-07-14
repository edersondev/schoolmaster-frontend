import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { useSchoolContextSwitch } from '@/composables/auth/useSchoolContextSwitch'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  activeSchool,
  backendSessionForSchool,
  createSystemAdminPinia,
  secondActiveSchool,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

describe('school context switch safety', () => {
  beforeEach(() => createSystemAdminPinia())

  function startPendingSchoolSwitch(store) {
    let resolveSelection
    const service = {
      getCurrentUser: vi.fn(() => new Promise((resolve) => { resolveSelection = resolve })),
    }

    return {
      pending: store.selectSchool(secondActiveSchool.id, { service }),
      resolve: () => resolveSelection(mapAuthSession(backendSessionForSchool(secondActiveSchool))),
    }
  }

  function createAuthenticatedStore() {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'system-administrator' }
    store.roles = [systemAdministratorRole]
    store.activeSchool = activeSchool
    return store
  }

  it('clears school-owned state before loading selected school', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]
    store.activeSchool = activeSchool
    const schoolOwnedState = { records: ['old-school-record'] }
    const service = {
      getCurrentUser: vi
        .fn()
        .mockImplementation(async () => {
          expect(schoolOwnedState.records).toEqual([])
          expect(store.activeSchool).toBeNull()
          return mapAuthSession(backendSessionForSchool(secondActiveSchool))
        }),
    }
    const contextSwitch = useSchoolContextSwitch({
      session: store,
      resetters: [() => { schoolOwnedState.records = [] }],
    })

    await contextSwitch.switchSchool(secondActiveSchool.id, { service })

    expect(store.activeSchool.id).toBe(secondActiveSchool.id)
  })

  it('ignores stale prior-context responses', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]
    store.activeSchool = activeSchool
    let resolveFirst
    const firstService = {
      getCurrentUser: vi.fn(() => new Promise((resolve) => { resolveFirst = resolve })),
    }
    const secondService = {
      getCurrentUser: vi.fn().mockResolvedValue(mapAuthSession(backendSessionForSchool(secondActiveSchool))),
    }

    const first = store.selectSchool(activeSchool.id, { service: firstService })
    const second = store.selectSchool(secondActiveSchool.id, { service: secondService })
    await second
    resolveFirst(mapAuthSession(backendSessionForSchool(activeSchool)))
    await first

    expect(store.activeSchool.id).toBe(secondActiveSchool.id)
  })

  it('does not restore identity when a school switch resolves after logout', async () => {
    const store = createAuthenticatedStore()
    const selection = startPendingSchoolSwitch(store)

    await store.logout({ logout: vi.fn().mockResolvedValue() })
    selection.resolve()

    await expect(selection.pending).resolves.toBeNull()
    expect(store.status).toBe('signed-out')
    expect(store.currentUser).toBeNull()
    expect(store.activeSchool).toBeNull()
  })

  it('does not restore identity after lifecycle session cleanup', async () => {
    const store = createAuthenticatedStore()
    const selection = startPendingSchoolSwitch(store)

    store.clearLifecycleSessionAssumptions()
    selection.resolve()

    await expect(selection.pending).resolves.toBeNull()
    expect(store.status).toBe('signed-out')
    expect(store.currentUser).toBeNull()
    expect(store.activeSchool).toBeNull()
  })

  it('does not restore identity after session expiry', async () => {
    const store = createAuthenticatedStore()
    const selection = startPendingSchoolSwitch(store)

    store.markSessionExpired()
    selection.resolve()

    await expect(selection.pending).resolves.toBeNull()
    expect(store.status).toBe('expired-session')
    expect(store.currentUser).toBeNull()
    expect(store.activeSchool).toBeNull()
  })
})
