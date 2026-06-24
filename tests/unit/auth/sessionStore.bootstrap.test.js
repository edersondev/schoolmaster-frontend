import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { authSessionEnvelope, createActivePinia } from './auth.fixtures'

describe('auth session bootstrap', () => {
  beforeEach(() => {
    createActivePinia()
    window.localStorage.clear()
  })

  it('blocks, hydrates, then exposes authenticated state', async () => {
    const store = useAuthSessionStore()
    let resolveSession
    const service = {
      getCurrentUser: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve
          }),
      ),
    }

    const pending = store.bootstrap({ service })
    expect(store.status).toBe('bootstrapping')
    expect(store.isProtectedContentReady).toBe(false)

    resolveSession(mapAuthSession(authSessionEnvelope.data))
    await pending
    expect(store.isProtectedContentReady).toBe(true)
  })

  it('clears stale tenant data after a mismatch', async () => {
    const store = useAuthSessionStore()
    store.activeSchool = { id: 'stale' }
    const service = {
      getCurrentUser: vi.fn().mockRejectedValue({
        feedback: { state: 'tenant-mismatch', messageKey: 'feedback.tenantMismatch' },
      }),
    }

    await expect(store.bootstrap({ service })).rejects.toBeTruthy()

    expect(store.activeSchool).toBeNull()
    expect(store.status).toBe('tenant-mismatch')
  })
})
