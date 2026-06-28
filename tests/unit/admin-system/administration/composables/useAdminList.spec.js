import { describe, expect, it, vi } from 'vitest'
import { nextTick, shallowRef } from 'vue'
import { useAdminList } from '@/composables/admin-system/useAdminList'
import { paginatedEnvelope } from '../administration.fixtures'

describe('useAdminList', () => {
  it('keeps latest request and resets tenant state', async () => {
    let resolveFirst
    const loader = vi
      .fn()
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce(paginatedEnvelope)
    const tenant = shallowRef('school-a')
    const list = useAdminList({ loader, tenantId: tenant })
    const first = list.load()
    tenant.value = 'school-b'
    await nextTick()
    await list.load()
    resolveFirst({ data: [{ id: 'stale' }], meta: { page: 1, per_page: 25, total: 1 } })
    await first
    expect(list.items.value[0].id).not.toBe('stale')
  })

  it('recovers an invalid empty final page once', async () => {
    const onInvalidPage = vi.fn()
    const list = useAdminList({
      loader: vi.fn().mockResolvedValue({
        data: [],
        meta: { page: 4, per_page: 25, total: 50 },
      }),
      onInvalidPage,
    })
    await list.load({ page: 4, perPage: 25 })
    expect(onInvalidPage).toHaveBeenCalledWith(2)
  })
})
