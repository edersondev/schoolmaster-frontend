import { describe, expect, it, vi } from 'vitest'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'

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
})
