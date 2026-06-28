import { describe, expect, it, vi } from 'vitest'
import { useAdminList } from '@/composables/admin-system/useAdminList'

describe('administration performance feedback', () => {
  it('settles stable data after 1.5 second mocked latency within 2 seconds', async () => {
    vi.useFakeTimers()
    const list = useAdminList({
      loader: () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: [{ id: '1' }],
                meta: { page: 1, per_page: 25, total: 1 },
              }),
            1500,
          ),
        ),
    })
    const request = list.load()
    await vi.advanceTimersByTimeAsync(1500)
    await request
    expect(list.status.value).toBe('ready')
    vi.useRealTimers()
  })
})
