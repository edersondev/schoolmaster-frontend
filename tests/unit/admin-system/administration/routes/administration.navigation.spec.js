import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { ADMIN_NAVIGATION_ITEMS } from '@/contracts/admin-system/navigation'
import { getVisibleNavigationItems } from '@/composables/admin-system/useAdminShellPermissions'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'

describe('administration navigation', () => {
  it('shows only exact permission-visible destinations', () => {
    const visible = getVisibleNavigationItems(ADMIN_NAVIGATION_ITEMS, ['schools.view'])
    expect(visible.map((item) => item.key)).toEqual(['schoolsList'])
    expect(ADMIN_NAVIGATION_ITEMS).toHaveLength(8)
  })

  it('keeps unresolved tenant administration blocked without requests', async () => {
    const loader = vi.fn()
    const tenantId = ref(null)
    await useAdminLookup({ loader, tenantId, selectedIds: ref([]) }).load()
    expect(loader).not.toHaveBeenCalled()
  })
})
