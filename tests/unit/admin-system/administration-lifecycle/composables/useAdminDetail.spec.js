import { describe, expect, it, vi } from 'vitest'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'

describe('useAdminDetail', () => {
  it('loads details and exposes retry/reset states', async () => {
    const loader = vi.fn(() => ({ id: '1', name: 'Record' }))
    const detail = useAdminDetail({ id: '1', loader, operationId: 'getUser' })
    await detail.load()
    expect(detail.status.value).toBe('ready')
    expect(detail.record.value.name).toBe('Record')
    detail.reset()
    expect(detail.status.value).toBe('idle')
  })
})
