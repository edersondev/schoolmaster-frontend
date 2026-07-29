import { beforeEach, describe, expect, it } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  activeSchool,
  createSystemAdminPinia,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

describe('platform-wide presentation scope', () => {
  beforeEach(() => createSystemAdminPinia())

  it('does not make platform support depend on selected school', () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.currentUser = { id: 'system-admin' }
    store.roles = [systemAdministratorRole]
    store.activeSchool = activeSchool
    const withSchool = createPlatformSupportAccessState(store)

    expect(withSchool.isReady.value).toBe(true)
    store.activeSchool = null
    expect(withSchool.isReady.value).toBe(true)
  })
})
