import { beforeEach, describe, expect, it } from 'vitest'
import { ADMIN_NAVIGATION_ITEMS } from '@/contracts/admin-system/navigation'
import { getVisibleNavigationItems } from '@/composables/admin-system/useAdminShellPermissions'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  createSystemAdminPinia,
  systemAdministratorRole,
} from '../fixtures/masterAccess.fixtures'

describe('System Administrator navigation visibility', () => {
  beforeEach(() => createSystemAdminPinia())

  it('shows every approved destination while limited users remain filtered', () => {
    const store = useAuthSessionStore()
    store.status = 'authenticated'
    store.roles = [systemAdministratorRole]

    expect(getVisibleNavigationItems(ADMIN_NAVIGATION_ITEMS, store.permissionCodes)).toHaveLength(
      ADMIN_NAVIGATION_ITEMS.filter((item) => item.approved).length,
    )
    expect(getVisibleNavigationItems(ADMIN_NAVIGATION_ITEMS, [])).toEqual([])
  })
})
