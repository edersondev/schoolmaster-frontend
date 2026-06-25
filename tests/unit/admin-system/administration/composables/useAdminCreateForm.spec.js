import { describe, expect, it, vi } from 'vitest'
import { useAdminCreateForm } from '@/composables/admin-system/useAdminCreateForm'

describe('useAdminCreateForm', () => {
  it('derives dirty state, blocks duplicate submits, resets after success', async () => {
    let resolveSubmit
    const submitter = vi.fn(() => new Promise((resolve) => (resolveSubmit = resolve)))
    const form = useAdminCreateForm({ initialValues: { name: '' }, submitter })
    form.values.name = 'Northfield'
    expect(form.isDirty.value).toBe(true)
    const first = form.submit()
    const second = form.submit()
    expect(submitter).toHaveBeenCalledTimes(1)
    resolveSubmit({ id: '1' })
    await Promise.all([first, second])
    expect(form.isDirty.value).toBe(false)
  })
})
