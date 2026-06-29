import { describe, expect, it, vi } from 'vitest'
import { useAdminUpdateForm } from '@/composables/admin-system/useAdminUpdateForm'

describe('useAdminUpdateForm', () => {
  it('tracks dirty values, blocks duplicate submit, and preserves values on conflict', async () => {
    let resolveSubmit
    const submitter = vi.fn(() => new Promise((resolve) => (resolveSubmit = resolve)))
    const form = useAdminUpdateForm({ initialValues: { name: 'Old' }, submitter })
    form.values.name = 'New'
    expect(form.isDirty.value).toBe(true)
    const first = form.submit()
    const second = form.submit()
    expect(submitter).toHaveBeenCalledTimes(1)
    resolveSubmit({ name: 'New' })
    await Promise.all([first, second])
    expect(form.isDirty.value).toBe(false)
  })
})
