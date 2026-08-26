import { describe, expect, it, vi } from 'vitest'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { deferred } from '../../user-recovery/fixtures/recoveryFeedback'

describe('useAdminLifecycleAction', () => {
  it('validates reason and future dates before submitter calls', async () => {
    const submitter = vi.fn()
    const lifecycle = useAdminLifecycleAction({
      submitter,
      now: () => new Date('2026-06-28T12:00:00'),
    })
    lifecycle.launch({ id: '1', name: 'A' }, 'deactivate')
    lifecycle.form.effectiveAt = '2026-06-29'
    await expect(lifecycle.submit()).rejects.toMatchObject({ type: 'validation' })
    expect(submitter).not.toHaveBeenCalled()
  })

  it('makes a late lifecycle result inert after close', async () => {
    const request = deferred()
    const onSuccess = vi.fn()
    const lifecycle = useAdminLifecycleAction({
      submitter: vi.fn(() => request.promise),
      onSuccess,
      now: () => new Date('2026-06-28T12:00:00'),
    })
    lifecycle.launch({ id: '1', name: 'A' }, 'restore')
    lifecycle.form.effectiveAt = '2026-06-28'
    lifecycle.form.reason = 'Approved recovery'

    const submission = lifecycle.submit()
    lifecycle.close()
    request.resolve({ status: 'active' })

    await expect(submission).resolves.toBeNull()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(lifecycle.outcome.value).toBeNull()
    expect(lifecycle.pending.value).toBe(false)
  })

  it('exposes explicit invalidation for context changes', async () => {
    const request = deferred()
    const lifecycle = useAdminLifecycleAction({
      submitter: vi.fn(() => request.promise),
      now: () => new Date('2026-06-28T12:00:00'),
    })
    lifecycle.launch({ id: '1', name: 'A' }, 'restore')
    lifecycle.form.effectiveAt = '2026-06-28'
    lifecycle.form.reason = 'Approved recovery'

    const submission = lifecycle.submit()
    lifecycle.invalidate()
    request.reject(new Error('late failure'))

    await expect(submission).resolves.toBeNull()
    expect(lifecycle.open.value).toBe(false)
    expect(lifecycle.formError.value).toBeNull()
    expect(lifecycle.pending.value).toBe(false)
  })
})
