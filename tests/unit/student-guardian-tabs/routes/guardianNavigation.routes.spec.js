import { describe, expect, it } from 'vitest'
import { ADMIN_NAVIGATION_ITEMS } from '@/contracts/admin-system/navigation'
import { getVisibleNavigationItems } from '@/composables/admin-system/useAdminShellPermissions'

describe('student guardian tabs navigation', () => {
  it('does not expose standalone Guardians navigation for any permission combination', () => {
    const permissionSets = [
      [],
      ['guardians.view'],
      ['guardians.view', 'guardians.manage'],
      ['student_profiles.view', 'student_profiles.manage', 'guardians.manage'],
      ['*'],
    ]

    expect(ADMIN_NAVIGATION_ITEMS.map((item) => item.key)).not.toContain('guardiansList')

    permissionSets.forEach((permissions) => {
      expect(
        getVisibleNavigationItems(ADMIN_NAVIGATION_ITEMS, permissions).map((item) => item.key),
      ).not.toContain('guardiansList')
    })
  })
})
