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

  it('blocks submitter calls when local validation fails', async () => {
    const submitter = vi.fn()
    const validate = vi.fn(() => ({ name: ['School name is required.'] }))
    const form = useAdminCreateForm({
      initialValues: { name: '' },
      validate,
      submitter,
      operationId: 'createSchool',
    })

    await expect(form.submit()).rejects.toMatchObject({
      type: 'validation',
      fieldErrors: { name: ['School name is required.'] },
    })
    expect(validate).toHaveBeenCalledTimes(1)
    expect(submitter).not.toHaveBeenCalled()
    expect(form.fieldErrors.value).toEqual({ name: ['School name is required.'] })
  })
})
