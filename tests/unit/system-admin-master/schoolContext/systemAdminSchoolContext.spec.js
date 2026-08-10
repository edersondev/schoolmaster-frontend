import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { createAuthGuard } from '@/router/authGuards'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  activeSchool,
  backendSessionForSchool,
  createSystemAdminPinia,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

describe('System Administrator school context', () => {
  beforeEach(() => createSystemAdminPinia())

  it('selects backend-confirmed active school through existing session transport', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]
    const service = {
      getCurrentUser: vi.fn().mockResolvedValue(mapAuthSession(backendSessionForSchool())),
    }

    await store.selectSchool(activeSchool.id, { service })

    expect(service.getCurrentUser).toHaveBeenCalledWith({ schoolId: activeSchool.id })
    expect(store.activeSchool.id).toBe(activeSchool.id)
    expect(store.status).toBe('authenticated')
  })

  it('blocks school-owned routes while selected school is missing', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.hasBootstrapped = true
    store.roles = [systemAdministratorRole]
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    await expect(
      guard({
        name: 'usersList',
        meta: { requiresAuth: true, requiresSchoolContext: true, permissions: ['users.view'] },
      }),
    ).resolves.toEqual({ name: 'authSchoolSelection' })
  })

  it('blocks school-owned routes when selected school is inactive', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.hasBootstrapped = true
    store.roles = [systemAdministratorRole]
    store.activeSchool = { ...activeSchool, status: 'inactive' }
    const guard = createAuthGuard({ store, fallbackRoute: { name: 'adminDashboard' } })

    await expect(
      guard({
        name: 'usersList',
        meta: { requiresAuth: true, requiresSchoolContext: true, permissions: ['users.view'] },
      }),
    ).resolves.toEqual({ name: 'authSchoolSelection' })
  })

  it('blocks duplicate confirmation submissions while one is pending', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'system-administrator' }
    store.roles = [systemAdministratorRole]
    let resolveSession
    const service = {
      getCurrentUser: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve
          }),
      ),
    }

    const first = store.selectSchool(activeSchool.id, { service })
    const duplicate = store.selectSchool(activeSchool.id, { service })
    resolveSession(mapAuthSession(backendSessionForSchool()))
    await Promise.all([first, duplicate])

    expect(service.getCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('preserves identity after a recoverable selection failure', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'system-administrator' }
    store.roles = [systemAdministratorRole]
    const error = { status: 403, feedback: { state: 'tenant-mismatch' } }

    await expect(
      store.selectSchool(activeSchool.id, {
        service: { getCurrentUser: vi.fn().mockRejectedValue(error) },
      }),
    ).rejects.toBe(error)

    expect(store.currentUser.id).toBe('system-administrator')
    expect(store.activeSchool).toBeNull()
    expect(store.status).toBe('selecting-school')
  })

  it('clears identity after token rejection during confirmation', async () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'system-administrator' }
    store.roles = [systemAdministratorRole]
    const error = { status: 401, feedback: { state: 'expired-session' } }

    await expect(
      store.selectSchool(activeSchool.id, {
        service: { getCurrentUser: vi.fn().mockRejectedValue(error) },
      }),
    ).rejects.toBe(error)

    expect(store.currentUser).toBeNull()
    expect(store.status).toBe('expired-session')
  })
})
