import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { createActivePinia } from '../../auth/auth.fixtures'

describe('sessionStore.invalidateSchoolContext', () => {
  beforeEach(() => {
    createActivePinia()
    localStorage.clear()
  })

  it('idempotently clears matching context while preserving identity', () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'user-1' }
    store.activeSchool = { id: 'school-1', status: 'active' }
    store.lastApprovedSchoolId = 'school-1'
    const generation = store.schoolContextGeneration

    expect(store.invalidateSchoolContext({ schoolId: 'school-1', reason: 'inactive-school' })).toBe(
      true,
    )
    expect(store.invalidateSchoolContext({ schoolId: 'school-1', reason: 'inactive-school' })).toBe(
      false,
    )
    expect(store.currentUser.id).toBe('user-1')
    expect(store.activeSchool).toBeNull()
    expect(store.status).toBe('authenticated')
    expect(store.schoolContextGeneration).toBe(generation + 1)
  })

  it('ignores a non-current school or stale generation', () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'user-1' }
    store.activeSchool = { id: 'school-1', status: 'active' }

    expect(store.invalidateSchoolContext({ schoolId: 'school-2' })).toBe(false)
    expect(store.invalidateSchoolContext({ schoolId: 'school-1', generation: 99 })).toBe(false)
    expect(store.activeSchool.id).toBe('school-1')
  })
})
