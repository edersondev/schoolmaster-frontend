import { describe, expect, it } from 'vitest'
import {
  getVisibleNavigationItems,
  hasRequiredPermissions,
} from '@/composables/admin-system/useAdminShellPermissions'
import { ADMIN_NAVIGATION_ITEMS, ADMIN_PERMISSIONS } from '@/contracts/admin-system/navigation'

describe('useAdminShellPermissions', () => {
  it('hides unauthorized sidebar navigation items', () => {
    expect(getVisibleNavigationItems(ADMIN_NAVIGATION_ITEMS, [])).toEqual([])
  })

  it('shows approved navigation when permission is present', () => {
    const items = getVisibleNavigationItems(ADMIN_NAVIGATION_ITEMS, [ADMIN_PERMISSIONS.viewDashboard])

    expect(items).toHaveLength(1)
    expect(items[0].key).toBe('adminDashboard')
  })

  it('requires every permission listed by metadata', () => {
    expect(hasRequiredPermissions(['first', 'second'], ['first'])).toBe(false)
    expect(hasRequiredPermissions(['first', 'second'], ['first', 'second'])).toBe(true)
  })
})
