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
})
