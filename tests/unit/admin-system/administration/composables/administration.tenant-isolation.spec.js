import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useAdminList } from '@/composables/admin-system/useAdminList'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'

describe('administration tenant isolation', () => {
  it('clears tenant-owned list on school switch', async () => {
    const tenantId = ref('school-a')
    const list = useAdminList({
      tenantId,
      loader: vi
        .fn()
        .mockResolvedValue({ data: [{ id: 'a' }], meta: { page: 1, per_page: 25, total: 1 } }),
    })
    await list.load()
    expect(list.items.value).toHaveLength(1)
    tenantId.value = 'school-b'
    await nextTick()
    expect(list.items.value).toEqual([])
  })

  it('clears tenant-owned lookup selections on school switch', async () => {
    const tenantId = ref('school-a')
    const selectedIds = ref(['role'])
    const lookup = useAdminLookup({
      tenantId,
      selectedIds,
      loader: vi.fn().mockResolvedValue({
        items: [{ id: 'role', name: 'Role' }],
        meta: { page: 1, perPage: 25, total: 1 },
      }),
    })
    await lookup.load()
    expect(lookup.options.value).toHaveLength(1)
    tenantId.value = 'school-b'
    await nextTick()
    expect(lookup.selectedItems.value).toEqual([])
  })
})
