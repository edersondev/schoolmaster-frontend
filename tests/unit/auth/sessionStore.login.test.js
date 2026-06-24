import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { authSessionEnvelope, createActivePinia } from './auth.fixtures'

describe('auth session login transitions', () => {
  beforeEach(() => {
    createActivePinia()
    window.localStorage.clear()
  })

  it('hydrates authenticated state and clears stale denial feedback', async () => {
    const store = useAuthSessionStore()
    store.feedbackState = { state: 'forbidden' }
    const service = { login: vi.fn().mockResolvedValue(mapAuthSession(authSessionEnvelope.data)) }

    await store.login({ email: 'avery@example.com', password: 'password123' }, service)

    expect(store.status).toBe('authenticated')
    expect(store.currentUser.fullName).toBe('Avery Stone')
    expect(store.feedbackState).toBeNull()
  })

  it('restores the persisted school context during login', async () => {
    window.localStorage.setItem('schoolmaster.auth.lastApprovedSchoolId', 'school-1')
    createActivePinia()
    const store = useAuthSessionStore()
    const service = { login: vi.fn().mockResolvedValue(mapAuthSession(authSessionEnvelope.data)) }

    await store.login({ email: 'avery@example.com', password: 'password123' }, service)

    expect(service.login).toHaveBeenCalledWith({
      email: 'avery@example.com',
      password: 'password123',
      schoolId: 'school-1',
    })
  })

  it('clears stale protected state when login is denied', async () => {
    const store = useAuthSessionStore()
    store.currentUser = { id: 'stale' }
    const service = {
      login: vi.fn().mockRejectedValue({
        feedback: { state: 'inactive-user', messageKey: 'feedback.inactiveUser' },
      }),
    }

    await expect(store.login({}, service)).rejects.toBeTruthy()

    expect(store.status).toBe('inactive-user')
    expect(store.currentUser).toBeNull()
  })
})
