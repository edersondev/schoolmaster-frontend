import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useStudentProfileLookup } from '@/composables/admin-system/useStudentProfileLookup'

describe('useStudentProfileLookup', () => {
  it('rejects stale search, retains selected options, resets on school change', async () => {
    let resolveOld
    const service = vi
      .fn()
      .mockReturnValueOnce(new Promise((resolve) => (resolveOld = resolve)))
      .mockResolvedValueOnce({
        items: [{ id: 'new', label: 'New' }],
        meta: { page: 1, total: 1 },
      })
    const tenantId = ref('school-a')
    const selectedIds = ref([])
    const lookup = useStudentProfileLookup({ service, tenantId, selectedIds })
    const old = lookup.search('old')
    await lookup.search('new')
    resolveOld({ items: [{ id: 'old', label: 'Old' }], meta: { page: 1, total: 1 } })
    await old
    expect(lookup.options.value.map((item) => item.id)).toEqual(['new'])
    tenantId.value = 'school-b'
    await nextTick()
    expect(lookup.options.value).toEqual([])
  })
})
