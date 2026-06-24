import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { authSessionEnvelope, createActivePinia, role } from './auth.fixtures'

describe('tenant context', () => {
  beforeEach(() => {
    createActivePinia()
    window.localStorage.clear()
  })

  it('requests restoration and accepts only backend-confirmed school context', async () => {
    window.localStorage.setItem('schoolmaster.auth.lastApprovedSchoolId', 'school-1')
    const store = useAuthSessionStore()
    const service = {
      getCurrentUser: vi.fn().mockResolvedValue(mapAuthSession(authSessionEnvelope.data)),
    }

    await store.bootstrap({ service, requiresSchoolContext: true })

    expect(service.getCurrentUser).toHaveBeenCalledWith({ schoolId: 'school-1' })
    expect(store.activeSchool.name).toBe('Northfield Academy')
  })

  it('gates school-scoped sessions and exposes no unauthorized choices', async () => {
    const store = useAuthSessionStore()
    const session = mapAuthSession({
      ...authSessionEnvelope.data,
      resolved_school: null,
      roles: [{ ...role, scope: 'school', school_id: 'school-1' }],
    })
    const service = { getCurrentUser: vi.fn().mockResolvedValue(session) }

    await store.bootstrap({ service, requiresSchoolContext: true })

    expect(store.status).toBe('selecting-school')
    expect(store.authorizedSchools).toEqual([])
    expect(store.schoolSelectionSourceApproved).toBe(false)
  })
})
