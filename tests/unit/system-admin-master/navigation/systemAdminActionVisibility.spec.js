import { beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_QUICK_ACTIONS } from '@/contracts/admin-system/navigation'
import { getVisibleQuickActions } from '@/composables/admin-system/useAdminQuickActions'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  createSystemAdminPinia,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

describe('System Administrator action visibility', () => {
  beforeEach(() => createSystemAdminPinia())

  it('shows released permission-protected quick and lifecycle actions', () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]

    expect(getVisibleQuickActions(ADMIN_QUICK_ACTIONS, store.permissionCodes)).toHaveLength(
      ADMIN_QUICK_ACTIONS.length,
    )
    expect(
      deriveLifecycleActions({
        resource: 'users',
        status: 'active',
        permissions: store.permissionCodes,
        schoolReady: true,
      }),
    ).not.toEqual([])
    expect(
      deriveLifecycleActions({ resource: 'users', status: 'active', permissions: [] }),
    ).toEqual([])
  })
})
