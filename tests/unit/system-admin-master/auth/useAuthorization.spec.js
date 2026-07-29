import { beforeEach, describe, expect, it } from 'vitest'
import {
  AUTH_ALL_PERMISSIONS,
  isSystemAdministratorRole,
} from '@/contracts/auth/authSession.contract'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  createSystemAdminPinia,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

describe('System Administrator authorization', () => {
  beforeEach(() => {
    createSystemAdminPinia()
    window.localStorage.clear()
  })

  it('recognizes only exact active platform System Administrator role', () => {
    expect(isSystemAdministratorRole(systemAdministratorRole)).toBe(true)
    expect(isSystemAdministratorRole({ ...systemAdministratorRole, name: 'System Admin' })).toBe(false)
    expect(isSystemAdministratorRole({ ...systemAdministratorRole, name: 'system administrator' })).toBe(false)
    expect(isSystemAdministratorRole({ ...systemAdministratorRole, name: 'Super Administrator' })).toBe(false)
    expect(isSystemAdministratorRole({ ...systemAdministratorRole, scope: 'school' })).toBe(false)
    expect(isSystemAdministratorRole({ ...systemAdministratorRole, status: 'inactive' })).toBe(false)
  })

  it('exposes master permission satisfaction only after session resolution', () => {
    const store = useAuthSessionStore()
    store.roles = [systemAdministratorRole]
    store.status = 'bootstrapping'

    expect(store.isSystemAdministrator).toBe(false)
    expect(store.permissionCodes).not.toContain(AUTH_ALL_PERMISSIONS)
    expect(store.hasPermission('users.manage')).toBe(false)

    store.status = 'authenticated'

    expect(store.isSystemAdministrator).toBe(true)
    expect(store.permissionCodes).toContain(AUTH_ALL_PERMISSIONS)
    expect(store.hasPermission('users.manage')).toBe(true)
  })
})
