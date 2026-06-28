import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'

describe('useAdminLookup', () => {
  it('traverses pages with approved params and retains selected options', async () => {
    const selectedIds = ref([])
    const loader = vi
      .fn()
      .mockResolvedValueOnce({
        items: [{ id: 'role-1', name: 'Role 1' }],
        meta: { page: 1, perPage: 1, total: 2 },
      })
      .mockResolvedValueOnce({
        items: [{ id: 'role-2', name: 'Role 2' }],
        meta: { page: 2, perPage: 1, total: 2 },
      })
    const lookup = useAdminLookup({
      loader,
      tenantId: ref('school'),
      selectedIds,
      perPage: 1,
      status: 'active',
    })
    await lookup.load(1)
    selectedIds.value = ['role-1']
    await nextTick()
    await lookup.load(2)
    expect(loader).toHaveBeenLastCalledWith(
      { page: 2, perPage: 1, status: 'active' },
      { schoolId: 'school' },
    )
    expect(lookup.options.value.map((item) => item.id)).toEqual(['role-1', 'role-2'])
  })

  it('blocks requests without resolved tenant and clears on switch', async () => {
    const tenantId = ref(null)
    const loader = vi.fn()
    const lookup = useAdminLookup({ loader, tenantId, selectedIds: ref([]) })
    await lookup.load()
    expect(loader).not.toHaveBeenCalled()
    tenantId.value = 'school'
    await nextTick()
    expect(loader).toHaveBeenCalledOnce()
    tenantId.value = null
    await nextTick()
    expect(lookup.options.value).toEqual([])
  })
})
