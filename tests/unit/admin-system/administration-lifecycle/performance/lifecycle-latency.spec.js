import { describe, expect, it, vi } from 'vitest'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'

const delay = (ms, value, reject = false) =>
  new Promise((resolve, rejectPromise) => {
    setTimeout(() => (reject ? rejectPromise(value) : resolve(value)), ms)
  })

describe('lifecycle latency handling', () => {
  it('settles delayed detail loading within the recoverable latency budget', async () => {
    vi.useFakeTimers()
    const detail = useAdminDetail({
      id: () => 'u1',
      loader: () => delay(1500, { id: 'u1', fullName: 'Ada Lovelace', status: 'active' }),
    })

    const promise = detail.load()
    await vi.advanceTimersByTimeAsync(1500)
    await promise

    expect(detail.status.value).toBe('ready')
    expect(detail.record.value.fullName).toBe('Ada Lovelace')
    vi.useRealTimers()
  })

  it('keeps lifecycle confirmation recoverable after delayed conflict feedback', async () => {
    vi.useFakeTimers()
    const lifecycle = useAdminLifecycleAction({
      submitter: () =>
        delay(
          1500,
          { response: { status: 409, data: { error: { code: 'stale_record' } } } },
          true,
        ),
    })
    lifecycle.launch({ id: 'u1', fullName: 'Ada Lovelace', status: 'active' }, 'deactivate')
    lifecycle.form.reason = 'Reviewed'

    const promise = lifecycle.submit().catch((error) => error)
    await vi.advanceTimersByTimeAsync(1500)
    const error = await promise

    expect(error).toMatchObject({ conflictKind: 'stale' })
    expect(lifecycle.form.reason).toBe('Reviewed')
    vi.useRealTimers()
  })
})
