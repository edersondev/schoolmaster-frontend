import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { authError, authSessionEnvelope, createActivePinia } from './auth.fixtures'
import { normalizeAuthError } from '@/services/auth/authErrorMapper'

const preferenceKey = 'schoolmaster.auth.lastApprovedSchoolId'

describe('session bootstrap school restoration', () => {
  beforeEach(() => {
    createActivePinia()
    localStorage.clear()
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

  it('clears stale tenant data after a mismatch without a stored preference', async () => {
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

  it('restores a confirmed school only for its bound identity', async () => {
    localStorage.setItem(
      preferenceKey,
      JSON.stringify({
        schoolId: authSessionEnvelope.data.resolved_school.id,
        identityId: authSessionEnvelope.data.user.id,
      }),
    )
    const service = {
      getCurrentUser: vi.fn().mockResolvedValue(mapAuthSession(authSessionEnvelope.data)),
    }
    const store = useAuthSessionStore()

    await store.bootstrap({ service, requiresSchoolContext: true })

    expect(service.getCurrentUser).toHaveBeenCalledTimes(1)
    expect(store.activeSchool.id).toBe(authSessionEnvelope.data.resolved_school.id)
  })

  it('clears an invalid stored school and retries once without a header', async () => {
    localStorage.setItem(
      preferenceKey,
      JSON.stringify({ schoolId: 'stale-school', identityId: 'user-1' }),
    )
    const session = mapAuthSession({ ...authSessionEnvelope.data, resolved_school: null })
    const mismatch = normalizeAuthError(authError('tenant_mismatch', 403))
    const service = {
      getCurrentUser: vi.fn().mockRejectedValueOnce(mismatch).mockResolvedValueOnce(session),
    }
    const store = useAuthSessionStore()

    await store.bootstrap({ service })

    expect(service.getCurrentUser.mock.calls).toEqual([
      [{ schoolId: 'stale-school' }],
      [{ schoolId: undefined }],
    ])
    expect(localStorage.getItem(preferenceKey)).toBeNull()
    expect(store.status).toBe('authenticated')
  })

  it.each([
    ['forbidden', 403],
    ['token_revoked', 401],
    ['service_unavailable', 503],
  ])('does not retry non-context bootstrap failure %s', async (code, status) => {
    localStorage.setItem(
      preferenceKey,
      JSON.stringify({ schoolId: 'school-1', identityId: 'user-1' }),
    )
    const service = {
      getCurrentUser: vi.fn().mockRejectedValue(normalizeAuthError(authError(code, status))),
    }
    const store = useAuthSessionStore()

    await expect(store.bootstrap({ service })).rejects.toBeTruthy()
    expect(service.getCurrentUser).toHaveBeenCalledTimes(1)
  })
})
